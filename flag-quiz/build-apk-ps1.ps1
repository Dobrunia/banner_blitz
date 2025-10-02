Write-Host "Building APK..." -ForegroundColor Green
Set-Location android
& .\gradlew.bat assembleDebug
Write-Host "APK created in: android\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor Yellow
Read-Host "Press Enter to continue"
