// 简单的后端服务 - 处理员工信息存储
// 使用文件系统存储提交的数据

const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');

class SimpleBackend {
    constructor() {
        this.dataDir = path.join(__dirname, 'data');
        this.init();
    }

    init() {
        // 创建数据目录
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }

        // 创建服务器
        this.createServer();
    }

    createServer() {
        const server = http.createServer((req, res) => {
            // 设置CORS头
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

            if (req.method === 'OPTIONS') {
                res.writeHead(200);
                res.end();
                return;
            }

            const parsedUrl = url.parse(req.url, true);
            const pathname = parsedUrl.pathname;

            if (pathname === '/api/submit' && req.method === 'POST') {
                this.handleSubmit(req, res);
            } else if (pathname === '/api/data' && req.method === 'GET') {
                this.getAllData(req, res);
            } else if (pathname === '/api/export' && req.method === 'GET') {
                this.exportData(req, res);
            } else if (pathname === '/api/stats' && req.method === 'GET') {
                this.getStats(req, res);
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Not found' }));
            }
        });

        const port = process.env.PORT || 3000;
        server.listen(port, () => {
            console.log(`后端服务运行在端口 ${port}`);
            console.log(`数据存储目录: ${this.dataDir}`);
        });
    }

    handleSubmit(req, res) {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                
                // 验证数据
                if (!data.name || !data.phone || !data.department || !data.type) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: '数据不完整' }));
                    return;
                }

                // 添加时间戳和ID
                const submission = {
                    id: 'emp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    name: data.name,
                    phone: data.phone,
                    department: data.department,
                    type: data.type,
                    timestamp: new Date().toISOString(),
                    ip: req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown'
                };

                // 保存到文件
                const filename = `employee_${Date.now()}.json`;
                const filepath = path.join(this.dataDir, filename);
                fs.writeFileSync(filepath, JSON.stringify(submission, null, 2));

                // 同时追加到汇总文件
                this.appendToMasterFile(submission);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: true, 
                    message: '提交成功',
                    id: submission.id 
                }));

                console.log(`新数据提交: ${data.name} (${data.department})`);

            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: '数据格式错误' }));
            }
        });
    }

    appendToMasterFile(data) {
        const masterFile = path.join(this.dataDir, 'all_employees.json');
        let allData = [];
        
        if (fs.existsSync(masterFile)) {
            try {
                const content = fs.readFileSync(masterFile, 'utf8');
                allData = JSON.parse(content);
            } catch (e) {
                console.error('读取主文件错误:', e);
            }
        }
        
        allData.push(data);
        fs.writeFileSync(masterFile, JSON.stringify(allData, null, 2));
    }

    getAllData(req, res) {
        try {
            const masterFile = path.join(this.dataDir, 'all_employees.json');
            let data = [];
            
            if (fs.existsSync(masterFile)) {
                const content = fs.readFileSync(masterFile, 'utf8');
                data = JSON.parse(content);
            }

            // 按时间排序
            data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ data }));

        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '获取数据失败' }));
        }
    }

    getStats(req, res) {
        try {
            const masterFile = path.join(this.dataDir, 'all_employees.json');
            let data = [];
            
            if (fs.existsSync(masterFile)) {
                const content = fs.readFileSync(masterFile, 'utf8');
                data = JSON.parse(content);
            }

            const stats = {
                total: data.length,
                formal: data.filter(e => e.type === '正式员工').length,
                intern: data.filter(e => e.type === '实习生').length,
                departments: [...new Set(data.map(e => e.department).filter(Boolean))],
                recent: data.slice(0, 5) // 最近5条记录
            };

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(stats));

        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '获取统计失败' }));
        }
    }

    exportData(req, res) {
        try {
            const masterFile = path.join(this.dataDir, 'all_employees.json');
            let data = [];
            
            if (fs.existsSync(masterFile)) {
                const content = fs.readFileSync(masterFile, 'utf8');
                data = JSON.parse(content);
            }

            // 创建CSV格式
            const headers = ['ID', '姓名', '手机号', '部门', '员工类型', '提交时间', 'IP地址'];
            const csvContent = [
                headers.join(','),
                ...data.map(employee => [
                    employee.id,
                    employee.name,
                    employee.phone,
                    employee.department,
                    employee.type,
                    new Date(employee.timestamp).toLocaleString('zh-CN'),
                    employee.ip
                ].join(','))
            ].join('\n');

            const filename = `员工信息_${new Date().toISOString().split('T')[0]}.csv`;
            const exportPath = path.join(this.dataDir, filename);
            fs.writeFileSync(exportPath, '\uFEFF' + csvContent); // 添加BOM用于中文

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true, 
                message: '导出成功',
                filename: filename 
            }));

            console.log(`数据导出: ${filename}`);

        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '导出失败' }));
        }
    }
}

// 启动后端服务
new SimpleBackend();