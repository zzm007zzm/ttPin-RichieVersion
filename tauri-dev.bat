@echo off
setlocal

rem Ensure Rust toolchain is available in this CMD session
set "CARGO_BIN=%USERPROFILE%\.cargo\bin"
if exist "%CARGO_BIN%\cargo.exe" (
	echo Found cargo at: %CARGO_BIN%
	set "PATH=%CARGO_BIN%;%PATH%"
) else (
	echo WARNING: cargo.exe not found under %CARGO_BIN%
	echo If Tauri fails to build, please install Rust via rustup.
)

cd /d %~dp0apps\desktop
echo Starting Tauri dev server...
npm run tauri:dev
pause

endlocal
