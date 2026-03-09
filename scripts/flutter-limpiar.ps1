# Script para limpiar y reconstruir Flutter cuando hay errores de archivos bloqueados
# EJECUTAR CON CURSOR CERRADO para evitar bloqueos

$appPath = Join-Path $PSScriptRoot "..\appmovil"

Write-Host "Deteniendo procesos que puedan usar archivos del proyecto..."
Get-Process -Name "flutter" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "dart" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Start-Sleep -Seconds 2

Set-Location $appPath

Write-Host "Ejecutando flutter clean..."
flutter clean

Write-Host "Ejecutando flutter pub get..."
flutter pub get

Write-Host "Listo. Ahora ejecuta: flutter run"
Write-Host ""
Write-Host "Si sigue fallando:"
Write-Host "1. Cierra Cursor por completo"
Write-Host "2. Pausa OneDrive (icono en bandeja del sistema)"
Write-Host "3. Mueve el proyecto fuera de Documents a C:\ClassBridge"
Write-Host "4. Ejecuta este script desde la nueva ubicacion"
