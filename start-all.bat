@echo off
echo ============================================
echo ttPin 项目启动脚本
echo ============================================
echo.

echo [1/3] 正在启动后端API (端口3001)...
start "ttPin Backend" cmd /k "cd /d %~dp0 && npm run dev -w @ttpin/backend"
timeout /t 3 /nobreak >nul

echo [2/3] 正在启动管理后台 (端口5173)...
start "ttPin Admin" cmd /k "cd /d %~dp0 && npm run dev -w @ttpin/admin"
timeout /t 3 /nobreak >nul

echo [3/3] 正在启动桌面应用 (端口5174)...
start "ttPin Desktop" cmd /k "cd /d %~dp0 && npm run dev -w @ttpin/desktop"

echo.
echo ============================================
echo 所有服务已启动！
echo ============================================
echo.
echo 访问地址：
echo - 后端API:    http://localhost:3001/health
echo - 管理后台:   http://localhost:5173
echo - 桌面应用:   http://localhost:5174
echo.
echo 关闭此窗口不会停止服务
echo 要停止服务，请关闭各个终端窗口
echo ============================================
pause
