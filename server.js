// 完整的Web服务器 - 包含前端和后端服务
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

class WebServer {
    constructor() {
        this.port = process.env.PORT || 8080;
        this.dataDir = path.join(__dirname, 'data');
        this.init();
    }

    init() {
        // 创建数据目录
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }

        this.createServer();
    }

    createServer() {
        const server = http.createServer((req, res) => {
            const parsedUrl = url.parse(req.url, true);
            const pathname = parsedUrl.pathname;

            // 设置CORS头
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

            if (req.method === 'OPTIONS') {
                res.writeHead(200);
                res.end();
                return;
            }

            // API路由
            if (pathname === '/api/submit' && req.method === 'POST') {
                this.handleApiSubmit(req, res);
            } else if (pathname === '/api/data' && req.method === 'GET') {
                this.handleApiData(req, res);
            } else if (pathname === '/api/stats' && req.method === 'GET') {
                this.handleApiStats(req, res);
            } else if (pathname === '/api/export' && req.method === 'GET') {
                this.handleApiExport(req, res);
            }
            // 静态文件服务
            else {
                this.serveStaticFile(req, res, pathname);
            }
        });

        server.listen(this.port, () => {
            console.log(`🚀 Web服务器启动成功！`);
            console.log(`📱 前台地址: http://localhost:${this.port}`);
            console.log(`🔧 后台管理: http://localhost:${this.port}/admin.html`);
            console.log(`📊 数据存储: ${this.dataDir}`);
            console.log('');
            console.log('使用说明:');
            console.log('1. 访问前台地址，员工填写信息');
            console.log('2. 访问后台管理查看统计数据');
            console.log('3. 数据会自动保存到data目录');
            console.log('4. 支持导出Excel格式的数据文件');
        });
    }

    // API处理函数
    handleApiSubmit(req, res) {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                
                if (!data.name || !data.phone || !data.department || !data.type) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: '数据不完整' }));
                    return;
                }

                const submission = {
                    id: 'emp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    name: data.name,
                    phone: data.phone,
                    department: data.department,
                    type: data.type,
                    timestamp: new Date().toISOString(),
                    ip: req.connection.remoteAddress || 'unknown'
                };

                // 保存到文件
                const filename = `employee_${Date.now()}.json`;
                const filepath = path.join(this.dataDir, filename);
                fs.writeFileSync(filepath, JSON.stringify(submission, null, 2));

                // 追加到汇总文件
                this.appendToMasterFile(submission);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: true, 
                    message: '提交成功',
                    id: submission.id 
                }));

                console.log(`✅ 新数据提交: ${data.name} (${data.department})`);

            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: '数据格式错误' }));
            }
        });
    }

    handleApiData(req, res) {
        try {
            const masterFile = path.join(this.dataDir, 'all_employees.json');
            let data = [];
            
            if (fs.existsSync(masterFile)) {
                const content = fs.readFileSync(masterFile, 'utf8');
                data = JSON.parse(content);
            }

            data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ data }));

        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '获取数据失败' }));
        }
    }

    handleApiStats(req, res) {
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
                recent: data.slice(0, 5)
            };

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(stats));

        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '获取统计失败' }));
        }
    }

    handleApiExport(req, res) {
        try {
            const masterFile = path.join(this.dataDir, 'all_employees.json');
            let data = [];
            
            if (fs.existsSync(masterFile)) {
                const content = fs.readFileSync(masterFile, 'utf8');
                data = JSON.parse(content);
            }

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
            fs.writeFileSync(exportPath, '\uFEFF' + csvContent);

            // 直接发送文件给客户端
            res.writeHead(200, {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="${filename}"`
            });
            
            const fileStream = fs.createReadStream(exportPath);
            fileStream.pipe(res);

            console.log(`📊 数据导出: ${filename}`);

        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '导出失败' }));
        }
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

    serveStaticFile(req, res, pathname) {
        // 默认首页
        if (pathname === '/') {
            pathname = '/index.html';
        }

        // 移除开头的/
        const filePath = path.join(__dirname, pathname.substr(1));
        
        // 安全检查
        if (!filePath.startsWith(__dirname)) {
            res.writeHead(403, { 'Content-Type': 'text/html' });
            res.end('403 Forbidden');
            return;
        }

        // 检查文件是否存在
        if (!fs.existsSync(filePath)) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('404 Not Found');
            return;
        }

        // 读取文件
        try {
            const content = fs.readFileSync(filePath);
            const ext = path.extname(filePath).toLowerCase();
            
            // 设置内容类型
            const contentType = {
                '.html': 'text/html; charset=utf-8',
                '.css': 'text/css',
                '.js': 'application/javascript',
                '.json': 'application/json',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.gif': 'image/gif',
                '.svg': 'image/svg+xml',
                '.ico': 'image/x-icon'
            }[ext] || 'text/plain';

            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);

        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end('500 Internal Server Error');
        }
    }
}

// 启动服务器
new WebServer();