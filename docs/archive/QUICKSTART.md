# 🚀 ttPin 快速参考

> 当前发布版本为 MVP：只需要运行桌面应用 `apps/desktop`，不需要启动后端/管理后台。

## 立即开始（开发者）

### 1) 修复 PowerShell 执行策略（仅首次）

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### 2) 启动桌面应用（Tauri Dev）

```powershell
npm install
npm -w @ttpin/desktop run tauri:dev
```

### 3) 构建安装包

```powershell
npm -w @ttpin/desktop run tauri:build
```

---

## 项目结构速查

```
apps/
└── desktop/    # Tauri 桌面应用（MVP 主应用）
```

---

## 常用命令

```powershell
# 安装依赖
npm install

# 类型检查
npm run typecheck

# 启动桌面应用（开发模式）
npm -w @ttpin/desktop run tauri:dev

# 构建桌面安装包
npm -w @ttpin/desktop run tauri:build
```

---

## 配置

- 终端用户/开发者都通过应用内【设置】填写 Azure 翻译配置
- 相关指南见 [docs/azure-setup-guide.md](docs/azure-setup-guide.md)

---

## 文档导航

- 📖 [README.md](README.md) - 项目概览
- 🏗️ [ARCHITECTURE.md](ARCHITECTURE.md) - 技术架构
- 📊 [PROJECT_STATUS.md](PROJECT_STATUS.md) - 完成状态
- 🚀 [START_GUIDE.md](START_GUIDE.md) - 启动指南
- 🐙 [GITHUB_SETUP.md](GITHUB_SETUP.md) - GitHub仓库创建

---

## 下一步

1. ✅ 启动桌面应用并完成 Azure 配置
2. ✅ 验证翻译与生词本功能
3. 🧩 根据需求迭代 UI/功能（见 DEVELOPMENT.md）

---

## 技术栈

| 类型 | 技术 |
|------|------|
| 桌面 | Tauri + React + TS |
| 后端 | Fastify + Node.js |
| 数据库 | PostgreSQL |
| AI | Azure GPT-4o-mini |

---

## 配额规则

- 免费: 5000字符/月
- VIP: 无限制
- 自有密钥: 无限制

---

**需要帮助？** 查看 [PROJECT_STATUS.md](PROJECT_STATUS.md) 了解详细进度和待办事项。
