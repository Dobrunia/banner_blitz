@echo off
echo Building APK...
cd android
gradlew.bat assembleDebug
echo APK created in: android\app\build\outputs\apk\debug\app-debug.apk
pause
