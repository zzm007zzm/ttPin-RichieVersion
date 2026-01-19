# 创建GitHub仓库指南

由于系统未安装GitHub CLI (`gh`)，请按以下步骤手动创建GitHub仓库并推送代码。

## 方案1：通过GitHub网站创建（推荐）

### 步骤1：创建仓库

1. 打开浏览器，访问 https://github.com/new
2. 填写仓库信息：
   - **Repository name**: `ttPin`
   - **Description**: `高质量桌面翻译工具 - Desktop translation widget with Azure LLM`
   - **Visibility**: 选择 Public 或 Private
   - **不要勾选**"Initialize this repository with..."的任何选项（README、.gitignore、license）
3. 点击 "Create repository"

### 步骤2：推送本地代码

GitHub会显示推送指令，但你只需要运行：

```powershell
# 添加远程仓库（将 YOUR_USERNAME 替换为你的GitHub用户名）
git remote add origin https://github.com/YOUR_USERNAME/ttPin.git

# 推送代码
git branch -M main
git push -u origin main
```

## 方案2：安装GitHub CLI后自动创建

### 安装GitHub CLI

```powershell
# 使用 winget 安装
winget install --id GitHub.cli

# 或使用 scoop 安装
scoop install gh
```

### 重启终端后运行

```powershell
# 登录GitHub
gh auth login

# 创建仓库并推送
gh repo create ttPin --public --source=. --remote=origin --push
```

## 验证

推送成功后，访问 `https://github.com/YOUR_USERNAME/ttPin` 查看仓库。

---

## 当前项目状态

✅ 项目结构已搭建完成
✅ 依赖已安装
✅ Git仓库已初始化并完成首次提交

### 包含的应用：

1. **apps/backend** - Fastify后端API
2. **apps/admin** - React管理后台
3. **apps/desktop** - React桌面应用（待集成Tauri）

### 下一步开发任务：

1. 实现后端用户认证API（邮箱验证码+注册+登录）
2. 集成Azure Translator LLM翻译接口
3. 为desktop应用添加Tauri支持（窗口管理+快捷键）
4. 实现生词本功能
5. 完善管理后台UI
