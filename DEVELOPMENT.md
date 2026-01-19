# ttPin 开发文档（MVP / Desktop Only）

当前发布版本为纯客户端 MVP，核心代码在 `apps/desktop`（Tauri + React + TypeScript）。

## 本地开发

### 环境要求

- Node.js >= 20
- Rust >= 1.70（用于 Tauri）

### 安装依赖

```bash
npm install
```

### 启动开发模式

```bash
npm -w @ttpin/desktop run tauri:dev
```

### 构建安装包

```bash
npm -w @ttpin/desktop run tauri:build
```

## 配置（重要）

- 翻译配置只通过应用内【设置】保存到本地（发布版/开发版一致）
- 出于安全原因，桌面应用不会从 `.env.local` 自动加载密钥，避免开发机配置被编译进 Release

配置字段：

- Translate Endpoint（例如 `https://<your-resource>.services.ai.azure.com/`）
- Subscription Key
- Region
- AOAI Deployment Name（通常为 `gpt-4o` 或 `gpt-4o-mini`）

配置指南见 [docs/azure-setup-guide.md](docs/azure-setup-guide.md)。

## 数据存储位置（Windows）

### 生词本 SQLite

- `%APPDATA%\com.ttpin.desktop\vocabulary.db`

### 本地设置（Tauri Store）

- `%APPDATA%\com.ttpin.desktop\settings.json`

> 当前 Subscription Key 存储在本地文件中（后续可考虑接入系统凭据库）。

## 代码结构（apps/desktop）

```
apps/desktop/
├── src/
│   ├── components/
│   │   ├── Settings.tsx           # 设置页面
│   │   └── VocabularyPanel.tsx    # 生词本面板
│   ├── services/
│   │   ├── azureTranslator.ts     # Azure 翻译服务封装
│   │   └── vocabularyService.ts   # SQLite 生词本
│   ├── App.tsx                    # 主界面（含自定义标题栏）
│   ├── i18n.ts                    # i18n 文案
│   └── index.css                  # 全局样式（液态玻璃）
└── src-tauri/
    ├── src/lib.rs                 # Rust 入口
    ├── Cargo.toml
    └── tauri.conf.json
```

## 已知限制

1. **毛玻璃效果**：极老的 Windows 版本可能不支持 `backdrop-filter`
2. **配置安全**：Subscription Key 当前存储在本地文件中（后续可接入系统凭据库）
3. **生词本导出**：暂不支持导出为 CSV/JSON（可作为后续功能）

## 调试技巧

### 查看 Rust 日志
```bash
cd apps/desktop/src-tauri
cargo run
```

### 查看前端控制台
按 F12 打开开发者工具

### 查看 SQLite 数据
数据库位置（Windows）：
```
%APPDATA%\com.ttpin.desktop\vocabulary.db
```

使用 SQLite 客户端（如 DB Browser for SQLite）打开查看

### 查看 Tauri Store 配置
配置文件位置（Windows）：
```
%APPDATA%\com.ttpin.desktop\settings.json
```

## 下一步优化建议

1. **安全存储**：集成 Windows 凭据管理器存储 Subscription Key
2. **生词本导出**：添加导出为 CSV/JSON 功能
3. **托盘菜单增强**：添加"打开设置"、"打开生词本"菜单项
4. **快捷键优化**：添加打开设置、生词本的快捷键
5. **主题切换**：支持浅色/深色主题
6. **窗口记忆**：记住窗口位置和大小
7. **翻译历史**：记录翻译历史记录
8. **批量翻译**：支持一次翻译多段文本

## 测试清单

- [ ] 点击设置图标打开设置页面
- [ ] 填写配置并保存，刷新后配置仍然存在
- [ ] 输入文本并翻译成功
- [ ] 翻译后点击"添加到生词本"保存成功
- [ ] 打开生词本查看保存的生词
- [ ] 搜索生词功能正常
- [ ] 删除生词功能正常
- [ ] 毛玻璃效果显示正常
- [ ] 窗口置顶功能正常
- [ ] 语言切换（中/英）正常
- [ ] 全局快捷键 Ctrl+Shift+T 调出窗口
