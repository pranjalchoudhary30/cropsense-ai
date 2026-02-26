# CropSense AI — Capacitor Android Build Helper
# Run this script from the 'frontend' directory to rebuild and sync the Android app

Write-Host "`n=== CropSense AI — Android Build ===" -ForegroundColor Green

Write-Host "`n[1/3] Building production web bundle..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "Build failed!" -ForegroundColor Red; exit 1 }

Write-Host "`n[2/3] Syncing to Android..." -ForegroundColor Cyan
npx cap sync android
if ($LASTEXITCODE -ne 0) { Write-Host "Sync failed!" -ForegroundColor Red; exit 1 }

Write-Host "`n[3/3] Opening Android Studio..." -ForegroundColor Cyan
npx cap open android

Write-Host "`n=== Done! Press Run in Android Studio to launch the app. ===" -ForegroundColor Green
