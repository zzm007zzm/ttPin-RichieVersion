# 🔧 浏览器访问问题排查（历史/已不适用 MVP）

> 当前发布版本为 MVP：仅桌面应用 `apps/desktop`，建议直接使用 `npm -w @ttpin/desktop run tauri:dev`。
> 本文档保留用于早期阶段（浏览器方式跑 Vite + 后端/管理后台）排查记录。

## 当前状态

✅ 端口已监听：
- 后端API: `0.0.0.0:3001` (IPv4)
- 桌面应用: `::1:5174` (IPv6)
- 管理后台: `::1:5176` (IPv6)

⚠️ **问题**: Vite服务只监听IPv6地址，导致浏览器访问`localhost`时可能连不上。

---

## 解决方案

### 方法1：使用IPv6地址访问（立即尝试）

在浏览器地址栏输入：

```
http://[::1]:5174/     # 桌面应用
http://[::1]:5176/     # 管理后台
http://127.0.0.1:3001/health  # 后端API
```

**注意**：IPv6地址需要用方括号包裹 `[::1]`

---

### 方法2：修改Vite配置监听所有地址（推荐）

这会让Vite同时监听IPv4和IPv6：

#### 桌面应用配置
文件：`apps/desktop/vite.config.ts`

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: '0.0.0.0',  // 添加这行
  },
  // ...其他配置
});
```

#### 管理后台配置
文件：`apps/admin/vite.config.ts`

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',  // 添加这行
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

修改后重启服务：
1. 关闭所有CMD窗口
2. 重新双击 `start-all.bat`

---

### 方法3：使用命令行参数（临时）

停止当前服务，手动启动：

```powershell
# 桌面应用
cmd /c "npm run dev -w @ttpin/desktop -- --host 0.0.0.0"

# 管理后台
cmd /c "npm run dev -w @ttpin/admin -- --host 0.0.0.0"
```

---

## 快速测试

### 测试后端（应该能访问）
```powershell
curl http://127.0.0.1:3001/health
```

### 测试桌面应用IPv6
在浏览器打开：`http://[::1]:5174/`

### 测试管理后台IPv6
在浏览器打开：`http://[::1]:5176/`

---

## 推荐操作流程

1. **立即尝试**：在浏览器打开 `http://[::1]:5174/` 和 `http://[::1]:5176/`
2. **如果能访问**：说明服务正常，只是IPv6地址问题
3. **永久修复**：按方法2修改Vite配置文件，让它监听 `0.0.0.0`

---

需要我帮你修改Vite配置文件吗？
