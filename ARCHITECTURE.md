# ttPin 技术方案

> 本文档描述的是“完整形态（规划）”的架构蓝图。
>
> 当前已发布版本为 **MVP（纯客户端 Desktop Only）**，请优先阅读：
>
> - [MVP_ARCHITECTURE.md](MVP_ARCHITECTURE.md)

## 架构设计

### 整体架构

```
┌────────────────────────────────────────────┐
│     Desktop App (Tauri + React)            │
│  ┌──────────────────────────────────────┐  │
│  │  Frontend (React + i18n)             │  │
│  │  - 翻译UI (语言选择/输入输出)          │  │
│  │  - 生词本管理                         │  │
│  │  - 用户设置                           │  │
│  └──────────────────────────────────────┘  │
│  ┌──────────────────────────────────────┐  │
│  │  Tauri Rust Backend                  │  │
│  │  - 全局快捷键注册                     │  │
│  │  - 窗口管理（右下角/置顶/拖拽）       │  │
│  │  - OS安全存储（Windows凭据管理器）    │  │
│  │  - 系统托盘图标                       │  │
│  └──────────────────────────────────────┘  │
└────────────────┬───────────────────────────┘
                 │ HTTPS
                 ▼
┌────────────────────────────────────────────┐
│   Backend API (Fastify + Node.js)         │
│  - 用户认证（JWT）                         │
│  - 邮箱验证码注册                          │
│  - 配额管理（5000字符/月）                 │
│  - VIP状态管理                             │
│  - 翻译代理（模式1）                       │
│  - 生词本云同步                            │
│  - 使用日志记录                            │
└────────────────┬───────────────────────────┘
                 │
                 ├─→ PostgreSQL (用户/配额/生词本)
                 ├─→ Azure Translator API (LLM)
                 ├─→ Azure Text-to-Speech API
                 └─→ Azure Communication Email

┌────────────────────────────────────────────┐
│    Admin Panel (React SPA)                │
│  - 用户列表与搜索                          │
│  - 配额调整                                │
│  - VIP设置                                 │
│  - 使用统计图表                            │
└────────────────────────────────────────────┘
```

### 双模式支持

**模式1：开发者配额**
- 用户使用开发者提供的Azure API
- 后端跟踪用户配额消耗
- 免费用户5000字符/月
- VIP无限制

**模式2：用户自有密钥**
- 用户在设置中配置自己的Azure Foundry endpoint + key
- 密钥存储在OS原生安全存储
- 桌面应用直接调用Azure API
- 无配额限制，无后端参与

## 数据库Schema

```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_vip BOOLEAN DEFAULT FALSE,
  quota_remaining INTEGER DEFAULT 5000,
  quota_reset_date TIMESTAMP DEFAULT (NOW() + INTERVAL '1 month'),
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 邮箱验证码表
CREATE TABLE email_verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_email_code (email, code),
  INDEX idx_expires (expires_at)
);

-- 生词本表
CREATE TABLE vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  word VARCHAR(500) NOT NULL,
  translation VARCHAR(500),
  example_sentence TEXT,
  source_lang VARCHAR(10),
  target_lang VARCHAR(10),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_id (user_id),
  INDEX idx_created (created_at DESC)
);

-- 使用日志表（用于统计和审计）
CREATE TABLE translation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  source_text TEXT,
  source_lang VARCHAR(10),
  target_lang VARCHAR(10),
  characters_used INTEGER NOT NULL,
  tokens_used INTEGER,  -- LLM翻译的token数
  mode VARCHAR(20) DEFAULT 'developer',  -- 'developer' or 'user-key'
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_id (user_id),
  INDEX idx_created (created_at DESC)
);
```

## API端点设计

### 认证相关

- `POST /api/auth/send-verification-code` - 发送邮箱验证码
- `POST /api/auth/register` - 用户注册（需验证码）
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/refresh` - 刷新访问令牌
- `GET /api/auth/me` - 获取当前用户信息

### 翻译相关

- `POST /api/translate` - 翻译文本（模式1）
- `GET /api/quota` - 获取当前配额

### 生词本相关

- `GET /api/vocabulary` - 获取生词列表
- `POST /api/vocabulary` - 添加生词
- `DELETE /api/vocabulary/:id` - 删除生词
- `GET /api/vocabulary/export` - 导出生词本（CSV/JSON）

### 管理员相关

- `GET /api/admin/users` - 获取用户列表
- `PATCH /api/admin/users/:id/vip` - 设置VIP状态
- `PATCH /api/admin/users/:id/quota` - 调整用户配额
- `GET /api/admin/stats` - 获取统计数据

## 桌面窗口行为

- **默认位置**: 屏幕右下角
- **快捷键**: 可配置（默认`Ctrl+Shift+T`）
- **行为**: 
  - 唤出后始终置顶
  - 可拖拽，位置会被记住
  - 可调整大小
  - 失焦后保持显示（需手动隐藏）

## 安全考虑

1. **密码**: bcrypt哈希
2. **JWT**: 短期访问令牌（15分钟） + 长期刷新令牌（7天）
3. **API密钥**: 
   - 后端密钥存储在Azure Key Vault
   - 用户密钥存储在OS原生安全存储
4. **邮箱验证码**: 6位数字，5分钟过期
5. **速率限制**: 全局300请求/分钟

## 国际化

- 支持中文和英文界面切换
- 使用`react-i18next`
- 翻译键存储在`i18n.ts`

## 下一步开发任务

1. ✅ 搭建项目脚手架
2. ⏳ 集成Tauri到desktop应用
3. ⏳ 实现后端认证API（邮箱验证码+注册+登录）
4. ⏳ 实现翻译代理API（Azure Translator LLM）
5. ⏳ 实现生词本CRUD
6. ⏳ 实现管理后台UI
7. ⏳ 桌面应用集成Tauri（快捷键/窗口管理）
8. ⏳ 实现Text-to-Speech发音功能
9. ⏳ 部署到Azure

## 预估成本

**Azure服务月度成本（假设100活跃用户）:**

- Translator API (LLM): ~$20-50（取决于使用量）
- Text-to-Speech: ~$5-10
- Communication Email: ~$15（1000封邮件）
- App Service (B1): ~$13
- PostgreSQL (Basic): ~$5
- **总计**: ~$58-93/月

**成本优化建议:**
1. 优先推荐用户使用模式2（自有密钥）
2. 为免费用户设置较低配额
3. 鼓励用户成为VIP（如需要可接入支付）
