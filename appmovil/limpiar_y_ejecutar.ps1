# INSTRUCCIONES:
# 1. Cierra Cursor COMPLETAMENTE (no solo la ventana, sino salir de la app).
# 2. Si usas OneDrive, pausa la sincronizacion temporalmente.
# 3. Abre PowerShell como administrador, ve a esta carpeta y ejecuta:
#    powershell -ExecutionPolicy Bypass -File limpiar_y_ejecutar.ps1
#
# Alternativa: Si el proyecto esta en Documents (OneDrive), muévelo a C:\ClassBridge
# para evitar bloqueos de archivos.

$ErrorActionPreference = "Continue"
Set-Location $PSScriptRoot

Write-Host "Deteniendo procesos Flutter/Dart/Java/Gradle..." -ForegroundColor Yellow
Get-Process | Where-Object { $_.ProcessName -match "dart|flutter|java|gradle" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 4

Write-Host "Eliminando carpetas de build (esto puede tardar)..." -ForegroundColor Yellow
$carpetas = @(
    "build",
    ".dart_tool",
    "android\.gradle",
    "android\app\build",
    "windows\flutter\ephemeral",
    "ios\Flutter\ephemeral",
    "linux\flutter\ephemeral",
    "macos\Flutter\ephemeral"
)
foreach ($c in $carpetas) {
    $ruta = Join-Path $PSScriptRoot $c
    if (Test-Path $ruta) {
        try {
            Remove-Item -Path $ruta -Recurse -Force -ErrorAction Stop
            Write-Host "  OK: $c" -ForegroundColor Green
        } catch {
            Write-Host "  Fallo: $c (quizas en uso)" -ForegroundColor Red
        }
    }
}

Write-Host "`nflutter pub get..." -ForegroundColor Cyan
flutter pub get

Write-Host "`nIniciando emulador Android (si esta disponible)..." -ForegroundColor Cyan
flutter emulators
$emulador = flutter devices 2>&1 | Select-String "emulator|Android"
if ($emulador) {
    Write-Host "flutter run (Android)..." -ForegroundColor Cyan
    flutter run
} else {
    Write-Host "flutter run -d windows..." -ForegroundColor Cyan
    Write-Host "Para usar el emulador Android, ejecuta primero: flutter emulators --launch <nombre>" -ForegroundColor Gray
    flutter run -d windows
}
