# Artem Kondratenko — Game Designer Landing CV

Интерактивный CV-лендинг Артёма Кондратенко, Game Designer Generalist.

Сайт нужен, чтобы HR или продюсер быстро понял профиль: опыт, проекты, стек, контакты, PDF-CV, CV-ассистент и proof-of-work слот под игровые прототипы. Проект сделан как статический frontend и подходит для GitHub Pages.

## Стек

- React
- Vite
- TypeScript
- Tailwind CSS
- Lucide React для иконок

## Быстрый старт

### 1. Установить зависимости

Нужен Node.js и npm.

```bash
npm install
```

### 2. Запустить локально в dev-режиме

```bash
npm run dev
```

После запуска Vite покажет локальный адрес, обычно `http://localhost:5173/`.

Если нужно открыть сайт с другого устройства в той же сети:

```bash
npm run dev -- --host 0.0.0.0
```

После этого откройте адрес, который Vite покажет как `Network`.

### 3. Проверить перед коммитом или деплоем

```bash
npm run build
```

Команда запускает TypeScript-проверку (`tsc -b`) и production-сборку Vite. Готовая сборка появляется в `dist/`.

Дополнительный smoke-test после сборки:

```bash
npm run preview
```

Обычно Vite preview доступен на `http://localhost:4173/`. Проверьте:

- header anchors: `Главная`, `Опыт`, `Проекты`, `Стек`, `Мини игра`;
- секцию `#proof-game`: витрину игровых прототипов и слот `Стройка века`;
- CV-ассистент: quick questions и fallback-ответы;
- PDF-ссылку и изображения проектов;
- mobile viewport, особенно header и карточки prototype hub.

Для проверки production preview с другого устройства в локальной сети:

```bash
npm run preview -- --host 0.0.0.0
```

Это не публикует сайт в интернет, а только делает локальный preview доступным в вашей сети.

### 4. Запустить глобально / опубликовать на GitHub Pages

Проект уже настроен для GitHub Pages через `base: './'` в `vite.config.ts`.

Публичный деплой идет через GitHub Actions:

1. Локально проверить проект: `npm run build`.
2. Запушить изменения в ветку `main`.
3. Workflow `.github/workflows/deploy.yml` выполнит `npm ci`, `npm run build` и опубликует `dist/`.
4. В настройках репозитория GitHub Pages должен быть выбран source `GitHub Actions`.

Деплой также можно запустить вручную через вкладку GitHub `Actions` → `Deploy static content to GitHub Pages` → `Run workflow`.

Текущий workflow `.github/workflows/deploy.yml` запускает `npm ci`, затем `npm run build`, а потом публикует `dist/`.
В build передается `VITE_CV_ASSISTANT_API_URL`: сначала из GitHub Actions variable, а если variable пустая — текущий production endpoint `https://cv-api-209-38-212-226.sslip.io/api/cv-assistant/chat`.

Файл `.env.production` уже находится в репозитории и содержит только публичный backend URL. Если в другой копии проекта `.env.production` окажется под `.gitignore`, его нужно добавить явно через `git add -f .env.production` или вместо файла настроить GitHub Actions variable `VITE_CV_ASSISTANT_API_URL`.

## Где редактировать тексты лендинга

Основной контент лежит в:

```txt
src/data/cvData.ts
```

Там редактируются:

- имя, роль, теги и pitch;
- контакты;
- блок “Что я закрываю”;
- опыт;
- проекты;
- стек;

UI-компоненты в `src/components/` лучше менять только если нужно изменить внешний вид или поведение.

## Где менять ссылки в header

Быстрые переходы в закрепленном header лежат здесь:

```txt
src/data/navigationData.ts
```

Там можно поменять названия пунктов и anchor-ссылки, например `#experience`, `#projects`, `#stack`.

CTA `CV-ассистент` не дублируется в nav-списке и ведёт на `#assistant-chat`, то есть сразу к окну диалога.

CTA в header используют контакты и PDF из:

```txt
src/data/cvData.ts
```

Если меняется путь к PDF, Telegram или LinkedIn, правьте их в `contacts`.

На mobile header устроен в два ряда:

- быстрые действия: `Скачать PDF`, `Telegram`, `LinkedIn`, `CV-ассистент`;
- навигация: `Главная`, `Опыт`, `Проекты`, `Стек`, `Мини игра`.

Desktop header остается цельным. Для якорей используется `scroll-mt-*` в `Section` и `Hero`, чтобы sticky header не перекрывал начало секций.

## Где менять вопросы и ответы ассистента

Базовые scripted quick questions CV-ассистента настроены здесь:

```txt
src/data/assistantData.ts
```

Там можно менять:

- приветствие ассистента;
- quick questions;
- готовые ответы;
- fallback-ответ для неизвестных вопросов.

Дополнительный fallback по ключевым темам, например Chameleon 42, MeowMeals, английский и ограничения по метрикам/программированию, лежит здесь:

```txt
src/lib/assistantFallback.ts
```

Если при сборке задан `VITE_CV_ASSISTANT_API_URL`, ассистент сначала обращается к backend. Если endpoint не задан или недоступен, UI остается рабочим и отвечает из fallback-базы.

Backend LLM knowledge base лежит здесь:

```txt
backend/src/assistant/knowledgeBase.ts
```

При изменении фактов о CV синхронизируйте:

- `src/data/cvData.ts` — видимый контент лендинга;
- `src/data/assistantData.ts` — quick questions и базовые ответы;
- `src/lib/assistantFallback.ts` — scripted fallback для HR-вопросов;
- `backend/src/assistant/knowledgeBase.ts` — база для Gemini backend.

## Куда класть PDF

Текущий PDF лежит здесь:

```txt
public/files/Artem_Kondratenko_GameDesigner_CV.pdf
```

Чтобы заменить CV, положите новый PDF в эту же папку с тем же именем. Тогда ссылка “Скачать PDF” продолжит работать без правок в коде.

Если хотите поменять имя файла, обновите путь в `src/data/cvData.ts`:

```ts
pdfPath: "/files/Artem_Kondratenko_GameDesigner_CV.pdf"
```

## Куда класть изображения

Текущее фото лежит здесь:

```txt
public/images/artem-photo.jpg
```

Чтобы заменить фото, положите новый JPG/PNG в `public/images/`.

Если имя файла поменялось, обновите путь в `src/data/cvData.ts`:

```ts
photoPath: "/images/artem-photo.jpg"
```

Если фото временно удалить, Hero-блок останется читаемым, просто без портрета.

Из этого же фото подготовлены site icons:

```txt
public/favicon.ico
public/favicon-32x32.png
public/apple-touch-icon.png
public/icon-192x192.png
public/icon-512x512.png
public/site.webmanifest
```

Подключение находится в `index.html`. Пути относительные (`./...`), чтобы иконки корректно работали на GitHub Pages при `base: './'`.

## Куда класть изображения проектов

Изображения для блока “Проекты” лежат в:

```txt
public/images/projects/
```

Текущая структура:

```txt
public/images/projects/catch-the-candy/
public/images/projects/game-to-think/
public/images/projects/hamster-combat/
```

Внутри каждой папки есть полноразмерные изображения `01.webp`, `02.webp`, ... и облегченные превью в папке `thumbs/`.

Рекомендуемый формат — WebP. Он хорошо подходит для GitHub Pages: меньше весит, быстро загружается и нормально работает в современных браузерах. JPG/PNG тоже можно использовать, если обновить пути в data-файле.

## Как добавлять изображения проектов

Откройте:

```txt
src/data/cvData.ts
```

У нужного проекта добавьте или обновите поле `images`:

```ts
images: [
  {
    src: "/images/projects/catch-the-candy/01.webp",
    thumbSrc: "/images/projects/catch-the-candy/thumbs/01.webp",
    alt: "Catch The Candy gameplay screenshot 1",
  },
]
```

- `thumbSrc` используется для горизонтальной ленты превью.
- `src` используется для полноразмерного изображения в lightbox.
- `alt` нужен для доступности и нормального описания изображения.

Пути начинаются с `/images/...`, а helper `publicAsset` сам применяет Vite `base`. Это важно для GitHub Pages и локального запуска.

## Как работает галерея проектов

Галерея находится в:

```txt
src/components/ProjectImageGallery.tsx
```

Она отображается внутри карточки проекта после ссылки и перед `Focus`.

Что умеет галерея:

- показывает горизонтальную ленту превью;
- держит превью компактными и единообразными, в стиле плотной media preview-ленты;
- открывает изображение в full-size lightbox;
- листает изображения Previous / Next только внутри текущего проекта;
- поддерживает клавиши `ArrowLeft`, `ArrowRight` и `Escape`;
- закрывается по кнопке X, Escape или клику по фону.

Если у проекта нет поля `images` или массив пустой, карточка отображается без галереи и без пустого блока.

## Где менять стили и цвета

Основные глобальные стили лежат здесь:

```txt
src/styles.css
```

Цвета и внешний вид большинства блоков заданы Tailwind-классами прямо в компонентах:

```txt
src/components/
```

Текущая версия использует темную product-тему: темный фон, карточки чуть светлее фона, тонкие полупрозрачные borders и спокойный teal accent.

Если нужно менять общий shadow или базовую Tailwind-настройку, смотрите:

```txt
tailwind.config.ts
```

## Как проверить frontend UI

После изменений запускайте dev server:

```bash
npm run dev
```

Проверьте desktop и mobile viewport:

- mobile header состоит из двух понятных рядов и не перекрывает якорные секции;
- `Скачать PDF` визуально заметнее Telegram/LinkedIn и ведет на `public/files/Artem_Kondratenko_GameDesigner_CV.pdf`;
- project preview-лента компактная, а full-size lightbox открывается по клику;
- favicon отображается во вкладке браузера и manifest подтягивает `192x192`/`512x512` icons.
- секция `#proof-game` сначала показывает карточку-превью `Стройка века`, а не сразу открытую игру;
- на desktop прототип раскрывается inline, а на mobile открывается fixed fullscreen-shell поверх лендинга;
- при закрытии mobile/fullscreen-shell сессия игры сбрасывается, при повторном открытии снова показывается tutorial;
- tutorial состоит из коротких интерактивных этапов и не использует `localStorage`;
- на mobile проверить viewport `360x780`, `384x848`, `390x844`: нет горизонтального скролла, поле полностью видно, action-кнопки не у нижнего края браузера;
- drag-to-select работает в разные стороны, включая диагональ, справа налево и снизу вверх;
- drag, начатый внутри построенного здания, удаляет этот корпус и возвращает его пункт в план;
- blocked cells `ПУСТЫРЬ` остаются видимыми поверх зданий и не дают строить через себя.

## Для чего нужен LANDING_CONTENT_SPEC.md

Файл:

```txt
LANDING_CONTENT_SPEC.md
```

Это продуктовый манифест и исходная спецификация лендинга. Его удобно держать рядом с проектом, чтобы при следующих итерациях не терять контекст: позиционирование, структура, контент, правила ассистента и Definition of Done.

## Где менять игровые прототипы

Секция `Proof-of-work` с якорем `#proof-game` показывает витрину игровых прототипов. Header-ссылка `Мини игра` продолжает вести на эту секцию.

Основные файлы:

```txt
src/components/GamePrototypeHub.tsx
src/components/GamePrototypeHub.css
src/components/StroikaVekaGame.tsx
src/components/StroikaVekaGame.css
src/data/gamePrototypeSlots.ts
docs/STROIKA_VEKA_GAME_RULES.md
```

Что где лежит:

- `GamePrototypeHub.tsx` — витрина, раскрываемые карточки, desktop inline mode и mobile fullscreen-shell;
- `GamePrototypeHub.css` — scoped-стили карточек, procedural preview и mobile fixed shell;
- `StroikaVekaGame.tsx` — логика playable-прототипа `Стройка века`: уровни, drag-to-select, снос, долгострои, tutorial, win/game over;
- `StroikaVekaGame.css` — scoped-стили игры, board layers, mobile app layout, советский ретро-футуристический визуал;
- `gamePrototypeSlots.ts` — список прототипов, id, статус, описание, CTA и тип preview.
- `docs/STROIKA_VEKA_GAME_RULES.md` — игровой reference: правила, tutorial flow, пустыри, снос, победа, визуальный стиль.

Первый слот — playable `Стройка века`: Shikaku-like puzzle про строительство советского ретро-футуристического города по плану пятилетки.

Текущее поведение:

- карточка-превью показывает мини-генплан и CTA `Играть`;
- desktop/tablet: игра раскрывается inline внутри карточки;
- mobile до `720px`: игра открывается как fixed fullscreen-shell поверх лендинга, body scroll временно блокируется;
- закрытие shell размонтирует `StroikaVekaGame`, поэтому новая сессия начинается с нуля;
- tutorial не хранится в `localStorage`, повторяется при каждом открытии и идет через 3 коротких учебных генплана;
- win/game over отображаются overlay внутри игрового блока, не как отдельная секция страницы;
- `Долгострой` работает как шкала риска 0/3, третий долгострой дает `Пятилетка провалена`;
- drag, начатый внутри здания, включает режим удаления: корпус подсвечивается `ПОД СНОС`, удаляется без штрафа, а карточка плана возвращается в `В ПЛАНЕ`;
- генератор и presets проверяются на разнообразие площадей и форм, чтобы уровень не состоял из одинаковых заданий;
- blocked cells рисуются отдельным верхним слоем с подписью `ПУСТЫРЬ`, остаются видимыми поверх зданий и не принимают pointer events;
- danger-selection через пустырь показывает отдельную ошибку `Нельзя через пустырь` и не выглядит как новый большой пустырь;
- board получает неяркие CSS blueprint-подложки по сложности: basic, sector, industrial, residential, restricted.

Перед следующими игровыми итерациями сначала сверяйтесь с `docs/STROIKA_VEKA_GAME_RULES.md` и обновляйте его после изменения правил.

При добавлении новых playable-прототипов добавьте слот в `gamePrototypeSlots.ts`, задайте стабильный `id`, а в `GamePrototypeHub.tsx` подключите соответствующий компонент по этому `id`. Роутинг для прототипов сейчас не используется.

Законсервированный MVP `КБ-42: Красный Билд` сохранен здесь:

```txt
archive/prototypes/kb42-red-build-mvp.zip
archive/prototypes/kb42-red-build-mvp.README.md
```

Архив содержит старые `ProofGame`, data, rules и types. Эти файлы удалены из активного `src`, чтобы build больше не тянул старый прототип.

## Что зарезервировано под настоящего LLM-ассистента

`src/components/AssistantChat.tsx` умеет обращаться к настоящему backend endpoint, если при сборке задан `VITE_CV_ASSISTANT_API_URL`.

Flow:

```txt
Frontend AssistantChat -> VITE_CV_ASSISTANT_API_URL -> backend /api/cv-assistant/chat -> Gemini
```

Production endpoint сейчас задан в:

```txt
.env.production
```

Текущее значение:

```txt
VITE_CV_ASSISTANT_API_URL=https://cv-api-209-38-212-226.sslip.io/api/cv-assistant/chat
```

Если endpoint не задан или backend недоступен, чат остается scripted FAQ-chat и использует fallback из:

```txt
src/data/assistantData.ts
src/lib/assistantFallback.ts
```

Backend живет отдельно в:

```txt
backend/
```

В production технические предупреждения не показываются: пользователь видит нейтральный текст “Сейчас отвечаю в базовом режиме по CV. Для деталей лучше написать Артёму напрямую.” и подпись ответа “Базовый ответ по CV”. В dev mode под quick questions остается диагностика `endpoint configured: yes/no; mode: ...`.

Gemini API key хранится только в backend env как `GEMINI_API_KEY` и не должен попадать во frontend. Во frontend можно хранить только публичный `VITE_CV_ASSISTANT_API_URL`, потому что `VITE_*` переменные встраиваются в JS bundle. Никогда не добавляйте `VITE_GEMINI_API_KEY`.

Проверить, что key не попал в `dist`:

```bash
npm run build
rg "AIza|GEMINI_API_KEY|VITE_GEMINI_API_KEY" dist
```

Допустимо, что `dist` содержит публичный endpoint URL. Подробные инструкции по локальному запуску, DigitalOcean App Platform и GitHub Pages variable лежат в:

```txt
ASSISTANT_SETUP.md
```

## Что специально оставлено простым в v1

- Нет сложного роутинга.
- Нет CMS.
- Контент редактируется через data-файлы.
- Игровые прототипы работают без backend, роутинга и сохранения прогресса.
- `Стройка века` использует DOM/CSS, без canvas и game engine.
