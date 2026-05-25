# Flag Quiz

Офлайн-викторина: несколько категорий и режимов, данные и медиа лежат локально.

## Стек

- Vue 3, TypeScript
- Vite, Vitest
- PWA (vite-plugin-pwa)
- Capacitor (Android / iOS)

## Запуск

```bash
npm install
npm run dev
```

```bash
npm run build      # продакшен
npm run test       # тесты
npm run typecheck  # проверка типов
```

## Подготовка данных (по необходимости)

Медиа кладутся в `public/` (например `public/flags/`, `public/paintings/`), метаданные — в `src/data/`.

```bash
npm run download-flags      # флаги → public/flags
npm run build:paintings     # Met API → JSON + public/paintings (долго)
npm run sync:paintings      # докачать картинки из существующего JSON
npm run validate:paintings  # проверка бандла картин
```

## Мобильная сборка

```bash
npm run build
npx cap sync
npm run cap:open:android   # или cap:open:ios
```

## Лицензия

MIT
