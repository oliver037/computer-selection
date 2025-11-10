# 员工电脑选择系统 - 部署说明

## 🚀 快速部署

### 方案一：完整Web服务器（推荐）

#### 1. 安装Node.js
- 访问 https://nodejs.org/ 下载并安装Node.js（建议v14+）
- 验证安装：`node --version`

#### 2. 部署系统
```bash
# 进入项目目录
cd /path/to/your/project

# 启动完整Web服务器
node server.js
```

#### 3. 访问系统
- **前台地址**: http://localhost:8080
- **后台管理**: http://localhost:8080/admin.html
- **测试页面**: http://localhost:8080/test.html

#### 4. 数据存储
- 员工提交的数据会自动保存到 `data/` 目录
- 每个员工信息单独存储为JSON文件
- 汇总数据保存在 `all_employees.json`
- 导出的Excel文件也保存在 `data/` 目录

---

### 方案二：仅后端服务

如果需要分离前后端部署：

#### 启动后端服务
```bash
node backend.js
# 服务运行在端口 3000
```

#### 修改前端API地址
在 `employee-info.html` 和 `admin.html` 中修改API地址：
```javascript
// 将 /api/submit 改为后端实际地址
fetch('http://your-server-ip:3000/api/submit', ...)
```

---

## 📁 文件结构

```
computer-selection-system/
├── index.html              # 主页 - 二维码扫描
├── employee-info.html      # 员工信息填写
├── selection.html          # 电脑类型选择
├── company-policy.html     # 公司电脑须知
├── personal-confirm.html   # 个人电脑确认
├── admin.html              # 后台管理
├── test.html               # 测试页面
├── server.js               # 完整Web服务器
├── backend.js              # 独立后端服务
├── main.js                 # 前端主要脚本
├── resources/              # 资源文件
│   └── qr-code.png         # 二维码图片
├── data/                   # 数据存储目录
│   ├── all_employees.json  # 汇总数据
│   ├── employee_xxx.json   # 单个员工数据
│   └── 员工信息_xxx.csv    # 导出文件
└── package.json            # 项目配置
```

---

## 🌐 生产环境部署

### 1. 云服务器部署
- 购买云服务器（阿里云、腾讯云等）
- 安装Node.js环境
- 上传项目文件
- 运行 `node server.js`
- 配置域名和SSL证书

### 2. 内网部署
- 在公司内部服务器部署
- 员工通过内网IP访问
- 数据存储在公司服务器上

### 3. 端口配置
```bash
# 指定端口运行
PORT=80 node server.js
# 或使用环境变量
```

---

## 🔧 系统管理

### 数据管理
- **查看数据**: 访问后台管理页面
- **导出数据**: 点击"导出Excel"按钮
- **清理数据**: 手动删除 `data/` 目录下的文件

### 备份建议
- 定期备份 `data/` 目录
- 将导出文件保存到安全位置
- 考虑使用数据库替代文件存储（如需扩展）

---

## 📋 使用流程

1. **员工访问** http://your-server-ip:8080
2. **扫描二维码** 进入系统
3. **填写信息** 姓名、手机号、部门等
4. **选择电脑类型** 公司电脑或个人电脑
5. **完成申请** 根据指引操作
6. **管理员查看** 访问后台管理页面
7. **导出数据** 生成Excel报表

---

## 🆘 常见问题

### Q: 数据存储在哪里？
A: 存储在服务器的 `data/` 目录中，以JSON文件格式保存。

### Q: 如何备份数据？
A: 定期备份 `data/` 目录下的所有文件。

### Q: 支持多少并发用户？
A: 基于文件存储，适合中小型企业使用。如需支持更多用户，建议使用数据库。

### Q: 如何修改部门选项？
A: 在 `employee-info.html` 中修改 `<select>` 选项。

### Q: 如何自定义样式？
A: 使用Tailwind CSS类名，或添加自定义CSS样式。

---

## 📞 技术支持

如需技术支持或功能定制，请联系IT部门。

---

**注意**: 当前版本使用文件存储，适合测试和小规模使用。如需企业级解决方案，建议使用数据库后端。