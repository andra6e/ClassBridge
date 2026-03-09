# Script para reiniciar el backend ClassBridge
# Libera el puerto 3000 si esta en uso y luego inicia el servidor

$puerto = 3000
$proceso = Get-NetTCPConnection -LocalPort $puerto -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($proceso) {
    Write-Host "Deteniendo proceso en puerto $puerto (PID: $proceso)..."
    Stop-Process -Id $proceso -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

$backendPath = Join-Path $PSScriptRoot "..\backend"
Set-Location $backendPath
Write-Host "Iniciando backend en $backendPath..."
npm run dev
