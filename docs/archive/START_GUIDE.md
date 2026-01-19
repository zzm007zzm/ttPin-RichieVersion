# 启动项目（Windows）- PowerShell 执行策略与桌面应用

> 当前发布版本为 MVP：只需要运行桌面应用 `apps/desktop`。

## 1) PowerShell 执行策略问题

如果你在 PowerShell 里运行脚本/命令遇到执行策略限制，推荐临时放开当前进程：

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

如果你不想改执行策略，也可以直接使用 CMD 运行命令：

```powershell
cmd /c "npm -w @ttpin/desktop run tauri:dev"
```

## 2) 启动桌面应用（开发模式）

在仓库根目录：

```powershell
npm install
npm -w @ttpin/desktop run tauri:dev
```

## 3) 构建安装程序

```powershell
npm -w @ttpin/desktop run tauri:build
```

## 4) 配置 Azure

启动应用后，在【设置】里填写 Azure 翻译配置。

配置指南：

- [docs/azure-setup-guide.md](docs/azure-setup-guide.md)
