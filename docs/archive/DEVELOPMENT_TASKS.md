# ttPin 开发任务清单（历史/内部）

> 说明：这是早期规划/执行用的 checklist，部分版本号与描述可能已过期。
> 当前发布版本与使用方式以 [README.md](README.md) 为准。

## 当前状态

- ✅ 项目脚手架完成
- ✅ MVP架构设计完成
- ✅ 文档体系建立
- ✅ 打包发布方案确定（Tauri MSI）

---

## Phase 1: Tauri基础集成 🚀

### 1.1 环境准备

- [ ] 安装Rust工具链
  ```powershell
  winget install Rustlang.Rustup
  rustc --version  # 验证安装
  ```

- [ ] 安装Tauri CLI
  ```bash
  cd apps/desktop
  npm install -D @tauri-apps/cli
  npm install @tauri-apps/api
  ```

### 1.2 初始化Tauri

- [ ] 运行Tauri初始化
  ```bash
  npx tauri init
  ```
  
  配置选项：
  - App name: `ttPin`
  - Window title: `ttPin - 翻译助手`
  - Dev server: `http://localhost:5174`
  - Build output: `../dist`

- [ ] 验证Tauri运行
  ```bash
  npm run tauri dev
  ```

### 1.3 窗口配置

编辑 `src-tauri/tauri.conf.json`：

- [ ] 配置窗口大小和位置
  ```json
  "windows": [{
    "title": "ttPin",
    "width": 600,
    "height": 400,
    "x": 9999,  // 右下角（通过代码动态计算）
    "y": 9999,
    "resizable": true,
    "alwaysOnTop": true,
    "decorations": true,
    "transparent": false,
    "skipTaskbar": false
  }]
  ```

- [ ] 在Rust代码中动态计算右下角位置
  ```rust
  // src-tauri/src/main.rs
  // 获取屏幕分辨率并计算窗口位置
  ```

### 1.4 系统托盘

- [ ] 配置系统托盘图标
- [ ] 添加托盘菜单：
  - 显示/隐藏
  - 设置
  - 退出
- [ ] 单击托盘图标切换显示/隐藏

### 1.5 全局快捷键

- [ ] 注册全局快捷键 `Ctrl+Shift+T`
- [ ] 快捷键触发显示/隐藏窗口
- [ ] 支持自定义快捷键配置

---

## Phase 2: 核心翻译功能 💬

### 2.1 Azure API集成

- [ ] 创建Azure API服务模块
  ```typescript
  // src/services/azure-translator.ts
  export class AzureTranslatorService {
    translate(text: string, from: string, to: string): Promise<string>
  }
  ```

- [ ] 实现翻译API调用
  - HTTP请求到Azure Translator
  - 错误处理和重试逻辑
  - 超时处理

- [ ] 支持语言自动检测

### 2.2 设置管理

- [ ] 创建设置存储模块（使用Tauri Store插件）
  ```typescript
  interface AzureConfig {
    translatorEndpoint: string;
    translatorKey: string;
    translatorRegion: string;
    speechKey?: string;
    speechRegion?: string;
  }
  ```

- [ ] 实现密钥加密存储（Tauri API）
  ```rust
  // 使用OS原生安全存储
  // Windows: Credential Manager
  ```

- [ ] 设置页面UI
  - Azure配置表单
  - 测试连接按钮
  - 保存/取消按钮

### 2.3 翻译UI完善

- [ ] 连接翻译API到UI
- [ ] 添加加载状态动画
- [ ] 显示错误提示（Toast通知）
- [ ] 一键复制输出文本
- [ ] 清空输入/输出按钮
- [ ] 交换源语言和目标语言按钮

### 2.4 首次启动向导

- [ ] 检测是否首次启动
- [ ] 创建向导组件（多步骤表单）
  - 步骤1: 欢迎页面
  - 步骤2: Azure Translator配置
  - 步骤3: Azure Speech配置（可跳过）
  - 步骤4: 快捷键配置
  - 步骤5: 完成页面

- [ ] 向导完成后标记已配置

---

## Phase 3: 生词本与发音 📚

### 3.1 本地数据库（SQLite）

- [ ] 集成Tauri SQL插件
  ```bash
  npm install @tauri-apps/plugin-sql
  ```

- [ ] 创建数据库Schema
  ```sql
  CREATE TABLE vocabulary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    word TEXT NOT NULL,
    translation TEXT,
    example TEXT,
    source_lang TEXT,
    target_lang TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  ```

- [ ] 创建数据库访问层
  ```typescript
  class VocabularyDB {
    add(word: VocabularyItem): Promise<void>
    getAll(): Promise<VocabularyItem[]>
    delete(id: number): Promise<void>
    update(id: number, data: Partial<VocabularyItem>): Promise<void>
    export(format: 'csv' | 'json'): Promise<string>
  }
  ```

### 3.2 生词本UI

- [ ] 创建生词本页面/侧边栏
- [ ] 显示生词列表（表格或卡片）
- [ ] 添加到生词本按钮（翻译页面）
- [ ] 编辑生词对话框
- [ ] 删除生词确认对话框
- [ ] 搜索/筛选功能
- [ ] 导出按钮（CSV/JSON）

### 3.3 Text-to-Speech发音

- [ ] 集成Azure Speech SDK
  ```typescript
  class AzureSpeechService {
    speak(text: string, language: string): Promise<void>
  }
  ```

- [ ] 添加发音按钮
  - 在翻译输入框旁
  - 在生词本列表中

- [ ] 音频播放控制
  - 播放/停止
  - 播放状态指示

---

## Phase 4: 打包发布 📦

### 4.1 应用图标设计

- [ ] 设计ttPin Logo
  - 尺寸：256x256, 128x128, 64x64, 32x32, 16x16
  - 格式：PNG和ICO

- [ ] 添加图标到Tauri配置
  ```json
  "icon": [
    "icons/icon.png",
    "icons/32x32.png",
    "icons/128x128.png",
    "icons/icon.ico"
  ]
  ```

### 4.2 UI美化

- [ ] 应用现代化UI设计
- [ ] 添加主题配置（可选）
- [ ] 优化动画和过渡效果
- [ ] 响应式布局调整

### 4.3 性能优化

- [ ] 翻译请求防抖（避免频繁调用）
- [ ] 缓存翻译结果（可选）
- [ ] 优化数据库查询
- [ ] 减小打包体积

### 4.4 构建和测试

- [ ] 配置Tauri打包选项
  ```json
  "bundle": {
    "identifier": "com.ttpin.desktop",
    "publisher": "ttPin Team",
    "shortDescription": "高质量桌面翻译工具",
    "longDescription": "使用Azure AI的桌面翻译助手"
  }
  ```

- [ ] 运行构建
  ```bash
  npm run tauri build
  ```

- [ ] 测试MSI安装程序
  - 安装流程
  - 首次启动向导
  - 核心功能测试
  - 卸载测试

- [ ] 测试便携版EXE

### 4.5 文档完善

- [ ] 编写 Release Notes（示例：v0.1.x）
- [ ] 更新README安装说明
- [ ] 完善Azure配置指南
- [ ] 添加FAQ

### 4.6 发布

- [ ] 创建Git标签
  ```bash
  git tag v0.1.x
  git push origin v0.1.x
  ```

- [ ] 在GitHub创建Release
  - 标题：ttPin v0.1.x
  - 描述：功能列表、安装说明、已知问题
  - 附件：
    - `ttPin_0.1.x_x64_en-US.msi`
    - `ttPin.exe`（便携版）
    - `SHA256SUMS.txt`（校验文件）

- [ ] 更新README的安装链接

---

## 可选增强功能（v0.2.0+）

- [ ] 自动更新功能（Tauri Updater）
- [ ] 翻译历史记录（可选开启）
- [ ] 多窗口支持
- [ ] 翻译结果对比模式
- [ ] 快捷短语库
- [ ] 插件系统
- [ ] macOS和Linux支持

---

## 优先级建议

**本周（Week 1）**：
1. ✅ 安装Rust和Tauri
2. ✅ 初始化Tauri项目
3. ✅ 配置窗口行为
4. ✅ 实现系统托盘

**下周（Week 2）**：
5. ✅ 全局快捷键
6. ✅ Azure翻译API集成
7. ✅ 设置管理和首次向导

**Week 3**：
8. ✅ 生词本功能
9. ✅ 发音功能
10. ✅ UI优化

**Week 4**：
11. ✅ 打包测试
12. ✅ 文档完善
13. ✅ 发布v0.1.0

---

**准备开始了吗？从Phase 1开始！** 🚀
