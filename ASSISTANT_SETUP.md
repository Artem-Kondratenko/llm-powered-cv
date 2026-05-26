# LLM CV Assistant Setup

Этот проект остается static-first: frontend собирается Vite и деплоится на GitHub Pages, а LLM-запросы идут в отдельный backend.

## Архитектура

- Frontend: React/Vite static site на GitHub Pages.
- Backend: отдельный Node.js/TypeScript API в папке `backend`.
- Endpoint: `POST /api/cv-assistant/chat`.
- Healthcheck: `GET /health`.
- Gemini API key хранится только в backend env.
- Frontend знает только публичный URL endpoint через `VITE_CV_ASSISTANT_API_URL`.
- Если backend не настроен или недоступен, `AssistantChat` использует scripted fallback из `src/data/assistantData.ts`.

## Frontend local

```bash
npm install
npm run dev
```

Без `VITE_CV_ASSISTANT_API_URL` чат работает как scripted assistant.

Чтобы проверить frontend с локальным backend:

```bash
VITE_CV_ASSISTANT_API_URL=http://localhost:8080/api/cv-assistant/chat npm run dev
```

В PowerShell:

```powershell
$env:VITE_CV_ASSISTANT_API_URL="http://localhost:8080/api/cv-assistant/chat"
npm run dev
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
LLM_MODEL=gemini-2.0-flash
MAX_INPUT_CHARS=1000
MAX_HISTORY_MESSAGES=8
MAX_OUTPUT_TOKENS=600
```

Реальное значение `GEMINI_API_KEY` нельзя добавлять в frontend, README, `.env.example` или tracked files.

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
- При изменении CV-контента в `src/data/cvData.ts` нужно синхронно обновлять backend knowledge base.
- Prompt запрещает выдумывать проценты роста метрик, уверенное программирование на Python/C#/SQL, неуказанный коммерческий опыт, доступность, зарплату, сроки выхода и уровень английского сверх базы.

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
LLM_MODEL=gemini-2.0-flash
MAX_INPUT_CHARS=1000
MAX_HISTORY_MESSAGES=8
MAX_OUTPUT_TOKENS=600
```

Если GitHub Pages сайт находится под project path, например `https://<github-user>.github.io/llm-powered-cv/`, в `ALLOWED_ORIGIN` все равно нужен только origin без path: `https://<github-user>.github.io`.

## Connect GitHub Pages to backend

1. После деплоя backend скопируйте публичный URL endpoint:

```txt
https://<digitalocean-app-domain>/api/cv-assistant/chat
```

2. В GitHub repository settings добавьте variable:

```txt
VITE_CV_ASSISTANT_API_URL=https://<digitalocean-app-domain>/api/cv-assistant/chat
```

3. Запустите GitHub Pages workflow заново.

Если variable не задана, GitHub Pages build остается рабочим, а чат работает в scripted fallback.

## Checks

Frontend:

```bash
npm run build
```

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
