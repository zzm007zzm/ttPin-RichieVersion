# Azure 配置指南（ttPin）

ttPin 使用 **Azure AI Foundry Translator（LLM 预览版）** 完成翻译。本指南说明如何获取并填写应用【设置】里的配置项。

---

## 前置要求

- 一个Microsoft账号（如果没有，访问 https://account.microsoft.com/ 创建）
- 信用卡或借记卡（用于验证身份，Azure提供免费额度）

---

## 步骤1：创建Azure账号

### 1.1 注册Azure

1. 访问 https://azure.microsoft.com/free/
2. 点击 **"免费开始使用"**
3. 使用Microsoft账号登录
4. 填写个人信息和支付信息
5. 完成手机验证

**免费额度**：
- 新用户获得 $200 美元额度（30天内使用）
- 12个月免费服务
- 25+个永久免费服务

### 1.2 登录Azure门户

完成注册后，访问 https://portal.azure.com/

---

## 步骤2：创建 Azure Translator（AI Foundry）资源

### 2.1 创建资源

1. 在 Azure 门户或 Azure AI Foundry 中创建 Translator 相关资源（不同订阅/区域的入口略有差异）
2. 确保你能拿到：**Endpoint / Key / Region**

### 2.2 配置Translator

填写以下信息：

- **订阅**: 选择你的订阅
- **资源组**: 创建新的或选择现有的（如 `ttPin-resources`）
- **区域**: 选择 `East US` 或 `Southeast Asia`（距离你最近的）
- **名称**: 如 `ttpin-translator`
- **定价层**: 选择 **S1**（标准版，按使用量付费）

> **费用说明**：  
> - 标准翻译：$10/百万字符
> - LLM翻译（GPT-4o-mini）：按token计费，约$0.15/百万token
> - 每月前200万字符免费（标准翻译）

点击 **"查看 + 创建"** → **"创建"**

### 2.3 获取密钥、端点与区域

资源创建完成后：

1. 进入资源页面
2. 左侧菜单选择 **"密钥和终结点"**
3. 记录以下信息（用于 ttPin【设置】）：
   - **Subscription Key**：KEY 1 / KEY 2（任选一个）
   - **Region**：例如 `eastus` / `swedencentral`（以你资源实际区域为准）
   - **Translate Endpoint**：AI Foundry 资源的 endpoint（通常形如 `https://<your-resource>.services.ai.azure.com/`）

> ttPin 支持你直接粘贴 base endpoint（以 `/` 结尾也没关系），应用会自动补全 translate 路径。

---

## 步骤3：创建 AOAI 部署（Deployment Name）

LLM 翻译需要一个可用的 **AOAI 部署名称**。

1. 在 Azure OpenAI / Azure AI Foundry 中创建模型部署
2. 选择模型：`gpt-4o` 或 `gpt-4o-mini`
3. 记录 **Deployment Name**（部署名称）

---

## 步骤4：在 ttPin 中配置

打开 ttPin → 【设置】并填写：

![ttPin 设置页示例](screenshots/settings.png?v=feb744e)

- Translate Endpoint
- Subscription Key
- Region
- AOAI Deployment Name

---

## 常见问题

### Q1: 如何查看我的使用量？

1. 访问 https://portal.azure.com/
2. 进入 **"成本管理 + 计费"**
3. 查看 **"成本分析"**

### Q2: 翻译质量如何？

ttPin 使用 Azure LLM 模型（`gpt-4o` / `gpt-4o-mini`）进行翻译，提供：
- 上下文感知的高质量翻译
- 自然流畅的语言表达
- 支持多种语言对

### Q3: 我的密钥安全吗？

ttPin 不会把你的密钥上传到任何服务器；配置仅保存在本机。

但需要注意：当前版本的 Subscription Key **存储在本地文件中**（并非系统凭据库）。请不要把该文件分享给他人；后续可再升级为系统凭据库。

---

## 需要帮助？

- **Azure官方文档**: https://learn.microsoft.com/azure/
- **Translator定价**: https://azure.microsoft.com/pricing/details/cognitive-services/translator/
- **ttPin GitHub Issues**: https://github.com/aristo7298sub/ttPin/issues

---

**配置完成后，就可以开始使用ttPin享受高质量翻译服务了！** 🎉
