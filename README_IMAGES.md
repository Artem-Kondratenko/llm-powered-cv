# Project images for llm-powered-cv

Готовый набор изображений для блока “Проекты”.

## Что внутри

- `public/images/projects/<project>/01.webp ...` — оптимизированные полноразмерные изображения для lightbox.
- `public/images/projects/<project>/thumbs/01.webp ...` — облегченные версии для ленты превью.
- `project-images-data-snippet.ts` — готовые массивы для добавления в `src/data/cvData.ts`.
- `project-images-manifest.json` — технический манифест размеров и путей.

## Проекты в архиве

- `catch-the-candy` — 4 изображения.
- `game-to-think` — 4 изображения.
- `hamster-combat` — 4 изображения.

В исходном архиве не было изображений для `meowmeals` и `combuchai`, поэтому они не добавлены.

## Как вставить в проект

1. Скопировать папку `public/images/projects/` в корень проекта `llm-powered-cv`, чтобы получилось:

```text
public/images/projects/catch-the-candy/01.webp
public/images/projects/catch-the-candy/thumbs/01.webp
...
```

2. Открыть `project-images-data-snippet.ts` и перенести массивы `catchTheCandyImages`, `gameToThinkImages`, `hamsterCombatImages` в data-файл проектов.

3. В карточках проектов использовать:

```ts
images: catchTheCandyImages
```

4. Компонент галереи должен использовать `thumbSrc` для ленты превью и `src` для full-size lightbox.

## Формат

Все изображения приведены к WebP:

- full-size: максимум 1600px по ширине/высоте;
- thumbnails: максимум 640x420;
- EXIF не сохранялся;
- имена файлов нормализованы: `01.webp`, `02.webp`, ...
