# Levo.dev backend — deploy con clasp (mantiene la misma URL)
# Uso desde gas/: .\deploy.ps1
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
Write-Host "📤 Subiendo Code.gs..." -ForegroundColor Cyan
clasp push --force
Write-Host "🚀 Actualizando deployment..." -ForegroundColor Cyan
$desc = "Levo.dev — $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
clasp deploy -i AKfycbwUrROfitdW0diXmCos-81ZK9shn872nFYxPHBIGBC_BkszURaUPsvuxyKGrvhZxPH2 -d $desc
Write-Host "✅ Listo. URL: https://script.google.com/macros/s/AKfycbwUrROfitdW0diXmCos-81ZK9shn872nFYxPHBIGBC_BkszURaUPsvuxyKGrvhZxPH2/exec" -ForegroundColor Green
