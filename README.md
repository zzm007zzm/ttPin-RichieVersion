# ttPin

[![Release](https://img.shields.io/github/v/release/zzm007zzm/ttPin-RichieVersion?display_name=tag&sort=semver)](https://github.com/zzm007zzm/ttPin-RichieVersion/releases)
[![License](https://img.shields.io/badge/license-PolyForm%20Noncommercial%201.0.0-blue)](LICENSE)

<p align="center">
  <img src="apps/desktop/src-tauri/icons/128x128.png" width="96" alt="ttPin logo" />
</p>

高质量桌面翻译小组件：Tauri + React 打造的无边框翻译卡片，使用 Azure AI Foundry Translator (LLM)，并提供本地生词本、邮件生成、文本调优能力。

## 界面预览

![ttPin 主界面](docs/screenshots/main.png?v=2.0.1)
![ttPin 设置页](docs/screenshots/settings.png?v=2.0.1)

## 功能特性

- 快捷键唤出桌面翻译卡片
- Azure AI Foundry Translator 高质量翻译
- Azure Speech TTS 朗读（选中优先，否则朗读全文）
- 生词本（SQLite 本地存储）
- 邮件生成（Azure OpenAI）
- 文本调优（Azure OpenAI）
- 中英文界面切换
- 配置仅保存在本机（不会进仓库和 Release）

## 项目结构（当前）

```
ttPin/
├── apps/
│   └── desktop/          # Tauri + React 桌面端主应用
├── docs/
│   ├── README.md
│   ├── azure-setup-guide.md
│   └── screenshots/
├── MVP_ARCHITECTURE.md
└── README.md
```

## 快速开始

### 终端用户（只想安装使用）

1. 打开 Releases：
	https://github.com/zzm007zzm/ttPin-RichieVersion/releases
2. Windows 推荐下载：
	- `ttPin_*_x64-setup.exe`（NSIS）
	- `ttPin_*_x64_en-US.msi`（MSI）
3. 安装并启动 ttPin，进入设置页填写 Azure 配置。
4. 使用快捷键 `Ctrl+Shift+T` 唤出窗口。

配置指南见 [docs/azure-setup-guide.md](docs/azure-setup-guide.md)。

### 开发者（本地开发）

环境要求：
- Node.js >= 20
- Rust >= 1.77
- Windows: Visual Studio Build Tools（C++ 工具链）

安装依赖：

```bash
npm install
```

启动开发版：

```bash
npm -w @ttpin/desktop run tauri:dev
```

构建安装包：

```bash
npm -w @ttpin/desktop run tauri:build
```

## 设置说明（重点）

### Translator 认证方式

- API Key
- Azure CLI (`az login`)
- Entra ID（Service Principal: tenant/client/client secret）

必填项根据认证方式变化，均在设置页内显示。

### OpenAI 认证方式

- API Key
- Azure CLI (`az login`)
- Entra ID（Service Principal: tenant/client/client secret）

OpenAI 的认证方式已经与设置页联动到运行时请求：
- `key` 模式：使用 `api-key` 请求头
- `entra-az-cli` 模式：使用 Azure CLI 获取 Bearer Token
- `entra-client-credentials` 模式：使用 tenant/client/client secret 换取 Bearer Token

## 维护者发布流程（简版）

1. 确认版本号一致：
	- `package.json`
	- `apps/desktop/package.json`
	- `apps/desktop/src-tauri/tauri.conf.json`
	- `apps/desktop/src-tauri/Cargo.toml`
2. 构建安装包：

```bash
npm run tauri:build
```

3. 提交并推送代码：

```bash
git add .
git commit -m "chore(release): ..."
git push origin main
```

4. 打 tag 并推送：

```bash
git tag -a vX.Y.Z -m "vX.Y.Z"
git push origin vX.Y.Z
```

5. 创建或更新 Release 并上传：

```bash
gh release create vX.Y.Z \
  apps/desktop/src-tauri/target/release/bundle/nsis/ttPin_X.Y.Z_x64-setup.exe \
  apps/desktop/src-tauri/target/release/bundle/msi/ttPin_X.Y.Z_x64_en-US.msi
```

## 许可证

PolyForm Noncommercial 1.0.0（禁止任何商业用途，含转售、商用服务、商业集成）。
