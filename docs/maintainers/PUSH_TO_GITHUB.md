# 🚀 推送到GitHub - 操作步骤

## 步骤1：创建GitHub仓库

1. 打开浏览器访问：https://github.com/new
2. 填写仓库信息：
   - **Repository name**: `ttPin`
   - **Description**: `高质量桌面翻译工具 - Desktop translation widget with Azure LLM`
   - **Visibility**: 选择 Public 或 Private
   - ⚠️ **重要**：不要勾选任何"Initialize this repository with..."选项
3. 点击 **Create repository**

---

## 步骤2：推送本地代码

GitHub创建完成后，在PowerShell中运行以下命令：

### 替换你的GitHub用户名
```powershell
# 将 YOUR_USERNAME 替换为你的GitHub用户名
$GITHUB_USERNAME = "YOUR_USERNAME"

# 添加远程仓库
git remote add origin "https://github.com/$GITHUB_USERNAME/ttPin.git"

# 重命名分支为main
git branch -M main

# 推送代码
git push -u origin main
```

### 或者一步步执行：
```powershell
# 1. 添加远程仓库（替换YOUR_USERNAME）
git remote add origin https://github.com/YOUR_USERNAME/ttPin.git

# 2. 重命名分支
git branch -M main

# 3. 推送代码
git push -u origin main
```

---

## 当前准备推送的内容

✅ **8个提交**：
```
69f6638 fix: configure Vite to listen on 0.0.0.0 for browser accessibility
b24f1db docs: add service status documentation with actual ports
2d264e7 feat: add batch script to start all services with one click
4201673 fix: update startup guide with cmd workaround for PowerShell execution policy
91bc81e docs: add quickstart reference guide
21fa177 docs: add comprehensive project documentation and startup guides
0f7a22f fix: update Fastify plugins to v5-compatible versions and fix .env loading
19600b1 feat: initial project scaffold with desktop/backend/admin apps
```

✅ **项目文件**：
- 完整的Monorepo结构
- 后端API（Fastify）
- 管理后台（React）
- 桌面应用（React + i18n）
- 7个文档文件
- 一键启动脚本

---

## 步骤3：验证推送成功

推送完成后，访问你的仓库：
```
https://github.com/YOUR_USERNAME/ttPin
```

应该能看到：
- ✅ README.md 显示项目介绍
- ✅ 8个提交历史
- ✅ 完整的项目结构

---

## 如果推送时要求登录

### 使用Personal Access Token（推荐）

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 勾选 `repo` 权限
4. 生成并复制token
5. 推送时使用token作为密码

### 或安装GitHub CLI（一劳永逸）

```powershell
# 使用winget安装
winget install --id GitHub.cli

# 重启终端后
gh auth login
gh repo create ttPin --public --source=. --remote=origin --push
```

---

## 后续维护

### 日常提交和推送
```powershell
# 查看修改
git status

# 添加所有更改
git add .

# 提交
git commit -m "描述你的更改"

# 推送到GitHub
git push
```

### 拉取远程更改（如果有协作者）
```powershell
git pull origin main
```

---

## 准备就绪！

现在可以：
1. 创建GitHub仓库
2. 运行上面的推送命令
3. 明天继续开发核心功能

**需要我帮你做什么吗？** 比如调整README或添加LICENSE文件？
