# ttPin 项目完成报告

> 注：当前发布版本为 MVP（纯客户端 Desktop Only），以 `apps/desktop` 为主。
> 本文档中涉及 backend/admin/用户系统/配额等内容属于规划或历史记录，可能未实现或已移除。

## 项目概述

**ttPin** 是一个基于Azure AI的高质量桌面翻译工具，支持快捷键唤出、生词本管理、单词发音等功能。

### 核心特性

- 🔑 **快捷键唤出** - 全局快捷键唤出桌面翻译卡片（待集成Tauri）
- 🤖 **Azure LLM翻译** - 使用Azure GPT-4o-mini提供高质量翻译
- 📚 **生词本** - 支持单词+翻译+例句，可导出CSV/JSON
- 🔊 **单词发音** - Azure Text-to-Speech在线发音
- 🌐 **中英双语** - UI支持中英文切换
- 👤 **用户系统** - 邮箱验证码注册、JWT认证
- 💎 **双模式** - 开发者配额 / 用户自有Azure密钥
- 🛠️ **管理后台** - 用户管理、配额调整、VIP设置

---

## 技术栈

| 模块 | 技术选型 | 说明 |
|------|---------|------|
| **桌面应用** | Tauri + React + TypeScript | 轻量级跨平台桌面应用 |
| **后端API** | Node.js + Fastify + TypeScript | 高性能异步API服务器 |
| **数据库** | PostgreSQL | 用户/配额/生词本数据存储 |
| **管理后台** | React + Vite | SPA管理界面 |
| **国际化** | react-i18next | 中英文切换 |
| **Azure服务** | Translator (LLM) + Text-to-Speech + Communication Email | AI翻译+发音+邮件验证 |

---

## 项目结构

```
ttPin/
├── apps/
│   ├── backend/              # Fastify后端API (端口3001)
│   │   ├── src/
│   │   │   └── index.ts      # 服务器入口，JWT/CORS/Rate Limiting
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── admin/                # 管理后台SPA (端口5173)
│   │   ├── src/
│   │   │   ├── App.tsx       # 路由+Dashboard+用户管理
│   │   │   ├── main.tsx
│   │   │   └── index.css
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   └── desktop/              # 桌面应用 (端口5174)
│       ├── src/
│       │   ├── App.tsx       # 翻译UI+语言选择器
│       │   ├── i18n.ts       # 中英文翻译配置
│       │   ├── main.tsx
│       │   └── index.css
│       ├── index.html
│       ├── vite.config.ts
│       └── package.json
├── packages/
│   └── shared/               # 共享类型定义
│       ├── src/index.ts
│       └── package.json
├── .env                      # 环境变量（Git忽略）
├── .env.example              # 环境变量模板
├── .gitignore
├── package.json              # Workspace根配置
├── README.md                 # 项目说明
├── ARCHITECTURE.md           # 技术架构文档
├── START_GUIDE.md            # 启动指南（PowerShell修复）
├── GITHUB_SETUP.md           # GitHub仓库创建指南
└── 需求文档.md                # 原始需求

## 已完成功能

### ✅ 基础设施

- [x] Monorepo工作区结构（npm workspaces）
- [x] TypeScript配置（所有应用）
- [x] ESLint配置
- [x] Git仓库初始化
- [x] 环境变量配置（.env + .env.example）
- [x] 依赖管理（兼容性修复）

### ✅ 后端API

- [x] Fastify 5.x服务器
- [x] CORS跨域配置
- [x] JWT认证中间件
- [x] 全局速率限制（300请求/分钟）
- [x] 健康检查端点 `/health`
- [x] .env环境变量加载
- [x] 依赖：
  - `fastify` ^5.6.2
  - `@fastify/cors` ^10.0.0
  - `@fastify/jwt` ^9.0.0
  - `@fastify/rate-limit` ^10.0.0
  - `@azure/communication-email` ^1.0.0
  - `dotenv` ^16.4.5
  - `zod` ^3.23.8

### ✅ 管理后台

- [x] React + TypeScript + Vite
- [x] React Router路由
- [x] Dashboard页面占位
- [x] 用户管理页面占位
- [x] API代理配置（/api → backend:3001）
- [x] 基础样式

### ✅ 桌面应用

- [x] React + TypeScript + Vite
- [x] i18next国际化配置
- [x] 中英文翻译键定义
- [x] 语言切换按钮（中/EN）
- [x] 翻译UI组件：
  - 源语言/目标语言选择器
  - 输入/输出文本框
  - 翻译按钮
  - 添加到生词本按钮
  - 设置按钮

### ✅ 文档

- [x] README.md - 项目概览和快速开始
- [x] ARCHITECTURE.md - 详细技术架构设计
- [x] START_GUIDE.md - Windows启动指南（PowerShell修复）
- [x] GITHUB_SETUP.md - GitHub仓库创建指南
- [x] 需求文档.md - 原始需求保留

---

## 待实现功能

### 🔲 后端API（优先级：高）

#### 认证相关
- [ ] `POST /api/auth/send-verification-code` - Azure Communication Email发送验证码
- [ ] `POST /api/auth/register` - 用户注册（验证邮箱+密码哈希）
- [ ] `POST /api/auth/login` - 登录返回JWT
- [ ] `POST /api/auth/refresh` - 刷新访问令牌
- [ ] `GET /api/auth/me` - 获取当前用户信息
- [ ] JWT中间件守卫路由

#### 翻译相关
- [ ] `POST /api/translate` - 调用Azure Translator LLM API
- [ ] 配额检查与扣减逻辑
- [ ] 使用日志记录（translation_logs表）
- [ ] `GET /api/quota` - 查询剩余配额

#### 生词本相关
- [ ] `GET /api/vocabulary` - 分页获取生词列表
- [ ] `POST /api/vocabulary` - 添加生词（单词+翻译+例句）
- [ ] `PUT /api/vocabulary/:id` - 更新生词
- [ ] `DELETE /api/vocabulary/:id` - 删除生词
- [ ] `GET /api/vocabulary/export` - 导出CSV/JSON

#### 管理员相关
- [ ] 管理员角色中间件
- [ ] `GET /api/admin/users` - 用户列表+搜索
- [ ] `PATCH /api/admin/users/:id/vip` - 设置VIP状态
- [ ] `PATCH /api/admin/users/:id/quota` - 调整配额
- [ ] `GET /api/admin/stats` - 统计数据（总用户/总翻译量/VIP数）

#### 数据库
- [ ] 安装Prisma ORM
- [ ] 定义数据库Schema：
  - `users` - 用户表
  - `email_verification_codes` - 验证码表
  - `vocabulary` - 生词本表
  - `translation_logs` - 使用日志表
- [ ] 数据库迁移脚本
- [ ] 种子数据（测试用户+管理员）

### 🔲 管理后台（优先级：中）

- [ ] 登录页面（管理员认证）
- [ ] Dashboard数据可视化（用户数/翻译量图表）
- [ ] 用户列表表格（分页+搜索）
- [ ] VIP设置开关
- [ ] 配额调整表单
- [ ] 使用日志查看

### 🔲 桌面应用（优先级：高）

#### Tauri集成
- [ ] 安装Rust + Tauri CLI
- [ ] 初始化Tauri项目（`npm create tauri-app`）
- [ ] 窗口配置：
  - 默认位置：右下角
  - 始终置顶
  - 可拖拽+位置记忆
  - 可调整大小
- [ ] 全局快捷键注册（默认`Ctrl+Shift+T`）
- [ ] 系统托盘图标
- [ ] Windows凭据管理器集成（存储用户JWT和Azure密钥）

#### 功能实现
- [ ] 登录/注册界面
- [ ] 设置界面：
  - 语言切换
  - 快捷键配置
  - 模式切换（开发者配额 / 自有密钥）
  - Azure密钥配置表单（endpoint + key）
- [ ] 翻译功能：
  - 调用后端API（模式1）或直接调用Azure（模式2）
  - 加载状态显示
  - 错误处理
- [ ] 生词本界面：
  - 列表展示
  - 添加/删除
  - 例句编辑
  - 导出功能
- [ ] 单词发音：
  - Azure Text-to-Speech SDK集成
  - 选中单词后点击发音按钮
  - 音频流播放

### 🔲 部署（优先级：低）

- [ ] 配置Azure App Service部署
- [ ] PostgreSQL生产环境配置
- [ ] Azure Key Vault配置（存储API密钥）
- [ ] CI/CD Pipeline（GitHub Actions）
- [ ] 管理后台部署到Azure Static Web Apps
- [ ] 桌面应用打包（Windows安装程序）
- [ ] 自动更新配置（Tauri Updater）

---

## 配额规则（已确认）

| 用户类型 | 月度配额 | 翻译模型 | 重置周期 |
|---------|---------|---------|---------|
| **免费用户** | 5000字符 | Azure GPT-4o-mini LLM | 每月1号 |
| **VIP用户** | 无限制 | Azure GPT-4o-mini LLM | - |
| **自有密钥模式** | 无限制 | 用户自己的Azure资源 | - |

- 单次翻译限制：遵循Azure API限制（50,000字符/请求）
- 速率限制：300请求/分钟（全局）

---

## Azure服务配置清单

### 需要创建的Azure资源

1. **Azure AI Foundry** （用户自己创建）
   - 部署GPT-4o-mini模型
   - 获取deployment name、endpoint、key

2. **Azure Translator Service**
   - 订阅密钥
   - 区域（如eastus）
   - Endpoint: `https://api.cognitive.microsofttranslator.com`

3. **Azure Speech Service**
   - Text-to-Speech API
   - 订阅密钥

4. **Azure Communication Services - Email**
   - 配置验证域名
   - 获取Connection String
   - 发件人地址（如no-reply@your-domain.com）

5. **Azure Database for PostgreSQL**
   - Basic或General Purpose tier
   - 创建数据库：`ttpin`

6. **Azure Key Vault**（生产环境）
   - 存储Translator/Speech/Email密钥
   - 配置Managed Identity

### .env配置示例

参考 [.env.example](.env.example) 文件，填写以下关键配置：

```env
# JWT密钥（生产环境务必更换）
JWT_ACCESS_SECRET=your-strong-secret-here
JWT_REFRESH_SECRET=your-strong-refresh-secret-here

# Azure Translator
AZURE_TRANSLATOR_KEY=<your-translator-key>
AZURE_TRANSLATOR_REGION=eastus
AZURE_TRANSLATOR_DEPLOYMENT_NAME=gpt-4o-mini

# Azure Communication Email
ACS_EMAIL_CONNECTION_STRING=<your-acs-connection-string>
ACS_EMAIL_FROM=no-reply@your-domain.com

# PostgreSQL
DATABASE_URL=postgresql://user:pass@host:5432/ttpin
```

---

## 开发流程建议

### Phase 1: 核心功能（2-3周）

1. **数据库设计与实现**
   - 安装Prisma
   - 编写Schema
   - 运行迁移
   - 创建种子数据

2. **后端认证系统**
   - 邮箱验证码发送
   - 用户注册/登录
   - JWT生成与验证
   - 测试认证流程

3. **翻译API代理**
   - Azure Translator LLM集成
   - 配额检查逻辑
   - 错误处理
   - 使用日志记录

4. **生词本API**
   - CRUD端点实现
   - 导出功能

### Phase 2: 桌面应用（2-3周）

1. **Tauri集成**
   - 安装Rust工具链
   - 初始化Tauri项目
   - 窗口管理配置
   - 全局快捷键

2. **桌面UI实现**
   - 登录/注册表单
   - 翻译功能对接
   - 设置界面
   - 生词本界面

3. **Azure密钥管理**
   - Windows凭据管理器集成
   - 模式2实现（直接调用Azure）

4. **Text-to-Speech**
   - Azure Speech SDK集成
   - 发音功能

### Phase 3: 管理后台（1-2周）

1. **管理员认证**
   - 登录界面
   - 管理员角色中间件

2. **用户管理界面**
   - 用户列表表格
   - VIP设置
   - 配额调整

3. **数据可视化**
   - 统计Dashboard
   - 使用量图表

### Phase 4: 部署与优化（1周）

1. **生产环境部署**
   - Azure App Service配置
   - PostgreSQL迁移
   - 环境变量配置

2. **桌面应用打包**
   - Windows安装程序生成
   - 自动更新配置

3. **监控与日志**
   - Application Insights集成
   - 错误追踪

---

## 成本预估（重复确认）

**假设100活跃用户/月：**

| 服务 | 费用 | 说明 |
|------|------|------|
| Azure Translator (LLM) | $20-50 | 取决于使用量，鼓励用户模式2 |
| Azure Text-to-Speech | $5-10 | 按字符计费 |
| Communication Email | $15 | 1000封邮件 |
| App Service (B1) | $13 | 基础托管 |
| PostgreSQL (Basic) | $5 | 1核2GB |
| **总计** | **$58-93/月** | - |

**成本优化建议：**
- 优先引导用户使用模式2（自有密钥）
- 免费用户配额设置较低（5000字符/月）
- VIP收费覆盖成本（如$9.99/月）

---

## 下一步操作

### 1. 创建GitHub仓库

参考 [GITHUB_SETUP.md](GITHUB_SETUP.md)：

```powershell
# 访问 https://github.com/new 创建仓库
# 然后运行：
git remote add origin https://github.com/YOUR_USERNAME/ttPin.git
git branch -M main
git push -u origin main
```

### 2. 启动开发服务器

参考 [START_GUIDE.md](START_GUIDE.md) 修复PowerShell执行策略，然后：

```powershell
# 后端
npm run dev -w @ttpin/backend

# 管理后台（新终端）
npm run dev -w @ttpin/admin

# 桌面应用（新终端）
npm run dev -w @ttpin/desktop
```

### 3. 配置Azure服务

- 创建Azure AI Foundry资源并部署GPT-4o-mini
- 创建Translator Service和Speech Service
- 配置Communication Services Email
- 创建PostgreSQL数据库

### 4. 开始实现后端API

从认证系统开始，参考 [ARCHITECTURE.md](ARCHITECTURE.md) 的数据库Schema和API端点设计。

---

## 项目亮点

- ✅ **Monorepo架构** - 统一管理多个应用，共享依赖
- ✅ **TypeScript全栈** - 类型安全，减少运行时错误
- ✅ **Tauri桌面应用** - 比Electron轻量10倍以上
- ✅ **Azure AI集成** - GPT-4o-mini提供业界领先的翻译质量
- ✅ **双模式支持** - 灵活的商业模式
- ✅ **国际化** - 内置中英文支持
- ✅ **安全性** - JWT认证、OS原生密钥存储、bcrypt密码哈希

---

## 技术债务与注意事项

1. **Tauri尚未集成** - desktop应用目前只是React SPA，需要添加Tauri
2. **数据库未配置** - 需要安装Prisma并设计Schema
3. **Azure服务未对接** - 所有Azure API调用需要实现
4. **认证未实现** - JWT中间件已配置但没有实际登录/注册逻辑
5. **生产环境配置** - 需要配置HTTPS、域名、CDN等

---

## 联系与支持

- **项目仓库**（待创建）: https://github.com/YOUR_USERNAME/ttPin
- **技术架构**: 参考 [ARCHITECTURE.md](ARCHITECTURE.md)
- **问题反馈**: GitHub Issues

---

**生成时间**: 2026-01-07  
**项目状态**: 脚手架完成，待功能实现  
**下一里程碑**: 后端API认证系统 + 数据库集成
