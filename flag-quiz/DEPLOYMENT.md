npm run cap:build:android # Сборка и открытие Android Studio
npm run cap:build:ios # Сборка и открытие Xcode
npm run cap:copy # Копирование файлов в нативные проекты
npm run dev # Локальный сервер
npm run build # Сборка для продакшена
npm run preview # Предварительный просмотр


npm run build && npx cap copy && cd android && ./gradlew assembleDebug