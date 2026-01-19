# Minimal dev launcher for ttPin (PowerShell)
# - Ensures Rust/cargo is on PATH for this session
# - Starts Tauri dev in a separate CMD window to avoid PowerShell/batch Ctrl+C prompts

$cargoBin = Join-Path $env:USERPROFILE '.cargo\bin'
if (Test-Path (Join-Path $cargoBin 'cargo.exe')) {
  if (($env:Path -split ';') -notcontains $cargoBin) {
    $env:Path = "$cargoBin;" + $env:Path
  }
} else {
  Write-Warning "cargo.exe not found under $cargoBin"
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$desktopDir = Join-Path $root 'apps\desktop'

Start-Process -FilePath 'cmd.exe' -ArgumentList @(
  '/d',
  '/k',
  "cd /d \"$desktopDir\" && npm run tauri:dev"
)
