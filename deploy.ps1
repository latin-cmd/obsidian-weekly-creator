# 构建并部署到 Obsidian vault
# 用法: .\deploy.ps1 -VaultPath "C:\path\to\your\vault"
param(
    [Parameter(Mandatory=$true)]
    [string]$VaultPath
)

$vaultPluginDir = Join-Path $VaultPath ".obsidian\plugins\weekly-creator"

Write-Host "Building plugin..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed." -ForegroundColor Red
    exit 1
}

Write-Host "Deploying to $vaultPluginDir ..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $vaultPluginDir | Out-Null
Copy-Item "main.js"       -Destination $vaultPluginDir -Force
Copy-Item "manifest.json" -Destination $vaultPluginDir -Force

Write-Host "Done. Enable the plugin in Obsidian > Settings > Community Plugins." -ForegroundColor Green
