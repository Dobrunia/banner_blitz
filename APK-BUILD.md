# Автоматическая сборка APK

## 🚀 GitHub Actions

Этот проект настроен для автоматической сборки APK через GitHub Actions.

### Как это работает:

1. **При push в main/master** - автоматически собирается APK
2. **При создании Pull Request** - собирается APK для тестирования
3. **Ручной запуск** - можно запустить вручную в разделе Actions

### Где найти APK:

#### После успешной сборки:

1. Перейдите в **Actions** на GitHub
2. Выберите последний workflow
3. Скачайте артефакт **flag-quiz-apk**

#### APK файлы в проекте:

- `apk-builds/latest.apk` - последняя версия
- `apk-builds/flag-quiz-YYYYMMDD-HHMMSS.apk` - версии с датой

### Локальная сборка:

```bash
# Установка зависимостей
npm install

# Сборка веб-версии
npm run build

# Копирование в Android проект
npx cap copy

# Сборка APK (требует Android Studio или Gradle)
cd android
./gradlew assembleDebug
```

### Структура проекта:

```
flag-quiz/
├── src/                    # Исходный код игры
│   ├── app.js             # Главный файл
│   ├── countries.js       # API стран
│   ├── gameLogic.js       # Логика игры
│   ├── ui.js              # UI компоненты
│   └── style.css          # Стили
├── android/               # Android проект
├── apk-builds/            # Готовые APK файлы
└── .github/workflows/     # GitHub Actions
```

### Требования для локальной сборки:

- Node.js 20+
- Java 17+
- Android SDK
- Gradle

### PWA версия:

Если APK не нужен, можно использовать PWA версию:

- Установка на домашний экран
- Оффлайн режим
- Нативный вид

```bash
npm run dev    # Локальная разработка
npm run build  # Сборка для продакшена
```
