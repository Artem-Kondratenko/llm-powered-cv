# LLM CV Assistant Setup

Этот проект остается static-first: frontend собирается Vite и деплоится на GitHub Pages, а LLM-запросы идут в отдельный backend.

## Архитектура

- Frontend: React/Vite static site на GitHub Pages.
- Backend: отдельный Node.js/TypeScript API в папке `backend`.
- Endpoint: `POST /api/cv-assistant/chat`.
- Healthcheck: `GET /health`.
- Gemini API key хранится только в backend env.
- Frontend знает только публичный URL endpoint через `VITE_CV_ASSISTANT_API_URL`.
- Production endpoint сейчас: `https://cv-api-209-38-212-226.sslip.io/api/cv-assistant/chat`.
- Flow: `Frontend AssistantChat -> VITE_CV_ASSISTANT_API_URL -> backend /api/cv-assistant/chat -> Gemini`.
- Если backend не настроен или недоступен, `AssistantChat` использует scripted fallback из `src/data/assistantData.ts` и `src/lib/assistantFallback.ts`.
- В production fallback выглядит нейтрально для HR: “Сейчас отвечаю в базовом режиме по CV. Для деталей лучше написать Артёму напрямую.” Ответы помечаются как “Базовый ответ по CV”.

## Frontend local

```bash
npm install
npm run dev
```

Без `VITE_CV_ASSISTANT_API_URL` чат работает как scripted assistant. Это нормальный режим для проверки fallback.

Чтобы проверить frontend с production backend:

```bash
VITE_CV_ASSISTANT_API_URL=https://cv-api-209-38-212-226.sslip.io/api/cv-assistant/chat npm run dev
```

Чтобы проверить frontend с локальным backend:

```bash
VITE_CV_ASSISTANT_API_URL=http://localhost:8080/api/cv-assistant/chat npm run dev
```

В PowerShell:

```powershell
$env:VITE_CV_ASSISTANT_API_URL="http://localhost:8080/api/cv-assistant/chat"
npm run dev
```

Чтобы проверить fallback без endpoint в PowerShell:

```powershell
Remove-Item Env:VITE_CV_ASSISTANT_API_URL -ErrorAction SilentlyContinue
npm run dev
```

Fallback test questions:

```txt
Что Артём делал в Chameleon 42?
Чем Артём полезен как Game Designer Generalist?
Какие точные проценты роста retention были после A/B-тестов?
Артём умеет программировать на Python/C#/SQL?
Подходит ли он для mobile F2P вакансии?
Какой у него английский?
Что такое MeowMeals?
Можно ли обсудить вакансию?
Какая зарплата?
Где находится Артём?
Какие форматы работы рассматривает?
Что он делал в Hamster Kombat?
Что такое CombuchAI?
```

## Backend local

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Для Windows PowerShell:

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run dev
```

Заполните `.env`:

```txt
PORT=8080
ALLOWED_ORIGIN=http://localhost:5173
GEMINI_API_KEY=<real-gemini-key>
LLM_MODEL=gemini-2.5-flash-lite
MAX_INPUT_CHARS=1000
MAX_HISTORY_MESSAGES=8
MAX_OUTPUT_TOKENS=600
```

Реальное значение `GEMINI_API_KEY` нельзя добавлять в frontend, README, `.env.example` или tracked files.

Рекомендуемая модель для MVP: `gemini-2.5-flash-lite`. Альтернатива, если нужен более сильный ответ и подходит квота: `gemini-2.5-flash`. Значение `LLM_MODEL` из `.env` имеет приоритет над backend default.

## Backend API

Request:

```json
{
  "message": "Вопрос пользователя",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

Response:

```json
{
  "answer": "Ответ ассистента",
  "suggestedCta": "telegram"
}
```

`suggestedCta` может быть `"telegram"`, `"linkedin"`, `"email"` или `null`.

## Knowledge base and prompt

- Knowledge base: `backend/src/assistant/knowledgeBase.ts`.
- System prompt: `backend/src/assistant/systemPrompt.ts`.
- При изменении CV-контента в `src/data/cvData.ts` нужно синхронно обновлять backend knowledge base, `src/data/assistantData.ts` и `src/lib/assistantFallback.ts`.
- Prompt запрещает выдумывать проценты роста метрик, уверенное программирование на Python/C#/SQL, неуказанный коммерческий опыт, доступность, сроки выхода, NDA-детали и уровень английского сверх базы.
- По условиям работы можно говорить только факты из базы: full-time/project-based/contract/remote/офис Минск, ориентир от $2000/мес. с зависимостью от формата и задач. Нельзя обещать финальные условия от лица Артёма.

## DigitalOcean App Platform

1. Создайте новое App Platform приложение из GitHub repository.
2. Выберите source directory: `backend`.
3. Build command: `npm run build`.
4. Run command: `npm run start`.
5. HTTP port: используйте env `PORT`, App Platform передаст его автоматически.
6. Health check path: `/health`.
7. Добавьте env:

```txt
ALLOWED_ORIGIN=https://<github-user>.github.io
GEMINI_API_KEY=<real-gemini-key>
LLM_MODEL=gemini-2.5-flash-lite
MAX_INPUT_CHARS=1000
MAX_HISTORY_MESSAGES=8
MAX_OUTPUT_TOKENS=600
```

Рекомендуемая модель для MVP: `gemini-2.5-flash-lite`. Альтернативная модель: `gemini-2.5-flash`.

Если GitHub Pages сайт находится под project path, например `https://<github-user>.github.io/llm-powered-cv/`, в `ALLOWED_ORIGIN` все равно нужен только origin без path: `https://<github-user>.github.io`.

## Connect GitHub Pages to backend

Production build уже получает публичный endpoint из `.env.production`:

```txt
VITE_CV_ASSISTANT_API_URL=https://cv-api-209-38-212-226.sslip.io/api/cv-assistant/chat
```

Это безопасно, потому что это только публичный URL backend. `GEMINI_API_KEY` нельзя хранить во frontend env: любые `VITE_*` переменные встраиваются в JS bundle и видны пользователю.

`.env.production` в текущем репозитории уже tracked и содержит только `VITE_CV_ASSISTANT_API_URL`. Если файл случайно попал под ignore в другой копии, используйте `git add -f .env.production` или настройте GitHub Actions variable вместо файла.

Нельзя использовать `VITE_GEMINI_API_KEY`: все `VITE_*` значения попадут во frontend bundle.

Если нужно переопределить endpoint без изменения файла, в GitHub repository settings добавьте Actions variable:

```txt
VITE_CV_ASSISTANT_API_URL=https://<digitalocean-app-domain>/api/cv-assistant/chat
```

GitHub Actions workflow передает эту variable в `npm run build`, а если variable пустая, использует текущий production endpoint как fallback. После изменения variable запустите GitHub Pages workflow заново.

Если `VITE_CV_ASSISTANT_API_URL` намеренно не задан в локальной dev-среде, чат остается рабочим и отвечает из fallback-базы.

## Checks

Frontend:

```bash
npm run build
```

Security после build:

```bash
rg "AIza|GEMINI_API_KEY|VITE_GEMINI_API_KEY" dist
```

Ожидаемо: совпадений по ключам нет. Публичный URL `https://cv-api-209-38-212-226.sslip.io/api/cv-assistant/chat` в `dist` допустим.

Backend:

```bash
cd backend
npm run build
npm run typecheck
```

Health:

```bash
curl http://localhost:8080/health
```

POST без `GEMINI_API_KEY` должен вернуть контролируемую ошибку:

```bash
curl -X POST http://localhost:8080/api/cv-assistant/chat \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"Что умеет Артем?\",\"history\":[]}"
```

Production:

- `/health` возвращает `{ "ok": true }`.
- GitHub Pages чат отвечает через LLM при доступном backend.
- При выключенном backend чат не падает и показывает scripted fallback.
- В frontend bundle и репозитории нет реального `GEMINI_API_KEY`.
- В dev mode под quick questions виден диагностический статус `endpoint configured: yes/no; mode: ...`.
- В production технический статус не показывается; понять, что frontend подключен к backend, можно по ответу LLM без подписи `Базовый ответ по CV`.
- Mobile header: два ряда, быстрые действия сверху, навигация снизу; якоря не уходят под sticky header.
- Favicon: во вкладке отображается фото Артёма; `index.html` подключает `favicon.ico`, `favicon-32x32.png`, `apple-touch-icon.png` и `site.webmanifest`.
- Project gallery: превью компактные; full-size lightbox открывается и листается.

Проверить production backend:

```bash
curl https://cv-api-209-38-212-226.sslip.io/health
curl -X POST https://cv-api-209-38-212-226.sslip.io/api/cv-assistant/chat \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"Что Артем делал в Chameleon 42?\",\"history\":[]}"
```
