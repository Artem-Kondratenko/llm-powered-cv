# Artem Kondratenko — Game Designer Landing CV

Интерактивный CV-лендинг Артёма Кондратенко, Game Designer Generalist.

Сайт нужен, чтобы HR или продюсер быстро понял профиль: опыт, проекты, стек, контакты, PDF-CV и scripted CV-ассистент. Первая версия сделана как статический сайт и подходит для GitHub Pages.

## Стек

- React
- Vite
- TypeScript
- Tailwind CSS
- Lucide React для иконок

## Как установить зависимости

Нужен Node.js и npm.

```bash
npm install
```

## Как запустить локально

```bash
npm run dev
```

После запуска Vite покажет локальный адрес, обычно `http://localhost:5173/`.

## Как собрать production build

```bash
npm run build
```

Готовая сборка появится в папке `dist/`.

## Как проверить production build локально

```bash
npm run preview
```

## Как задеплоить на GitHub Pages

Проект уже настроен для GitHub Pages через `base: './'` в `vite.config.ts`.

Простой вариант:

1. Установить зависимости: `npm install`.
2. Проверить сборку: `npm run build`.
3. Залить репозиторий на GitHub.
4. Настроить GitHub Pages на публикацию собранной папки `dist/` через GitHub Actions или другой удобный способ.

Если используете GitHub Actions, workflow должен запускать `npm install`, затем `npm run build`, а потом публиковать `dist/`.

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
- placeholder будущей мини-игры.

UI-компоненты в `src/components/` лучше менять только если нужно изменить внешний вид или поведение.

## Где менять вопросы и ответы ассистента

Scripted CV-ассистент v1 настроен здесь:

```txt
src/data/assistantData.ts
```

Там можно менять:

- приветствие ассистента;
- quick questions;
- готовые ответы;
- fallback-ответ для неизвестных вопросов.

В первой версии ассистент не использует настоящую LLM и не генерирует ответы сам.

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

## Для чего нужен LANDING_CONTENT_SPEC.md

Файл:

```txt
LANDING_CONTENT_SPEC.md
```

Это продуктовый манифест и исходная спецификация лендинга. Его удобно держать рядом с проектом, чтобы при следующих итерациях не терять контекст: позиционирование, структура, контент, правила ассистента и Definition of Done.

## Что зарезервировано под мини-игру

Мини-игра пока не реализована.

Под неё уже есть:

- секция `Proof-of-work`;
- компонент `src/components/GamePlaceholder.tsx`;
- данные в `gamePlaceholder` внутри `src/data/cvData.ts`;
- якорь страницы `#proof-game`.

Основной лендинг не зависит от будущей игры.

## Что зарезервировано под настоящего LLM-ассистента

Сейчас `src/components/AssistantChat.tsx` работает как scripted FAQ-chat.

В будущем можно заменить внутреннюю логику ответа на запрос к backend/API, например на DigitalOcean. UI чата при этом можно оставить тем же, а `assistantData.ts` использовать как базу знаний или fallback.

## Что специально оставлено простым в v1

- Нет backend.
- Нет настоящей LLM.
- Нет мини-игры.
- Нет сложного роутинга.
- Нет CMS.
- Нет dark mode.
- Контент редактируется через data-файлы.
