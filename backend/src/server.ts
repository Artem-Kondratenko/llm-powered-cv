import cors from "cors";
import express, { ErrorRequestHandler } from "express";
import { config } from "./config.js";
import { AssistantHttpError } from "./assistant/geminiClient.js";
import { assistantRouter } from "./assistant/routes.js";

const app = express();

app.disable("x-powered-by");

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (config.allowedOrigin && origin === config.allowedOrigin) {
        callback(null, true);
        return;
      }

      callback(new AssistantHttpError(403, "Origin is not allowed by CORS."));
    },
  }),
);
app.use(express.json({ limit: "20kb" }));

app.get("/health", (_request, response) => {
  response.json({
    ok: true,
    service: "llm-powered-cv-assistant-api",
  });
});

app.use("/api", assistantRouter);

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  const parserStatus = typeof (error as { status?: unknown }).status === "number"
    ? (error as { status: number }).status
    : undefined;
  const statusCode = error instanceof AssistantHttpError ? error.statusCode : parserStatus ?? 500;
  const message = (error as { type?: unknown }).type === "entity.parse.failed"
    ? "Request body must be valid JSON."
    : error instanceof Error
      ? error.message
      : "Unexpected server error.";

  response.status(statusCode).json({
    error: {
      message,
    },
  });
};

app.use(errorHandler);

app.listen(config.port, "127.0.0.1", () => {
  console.log(`CV assistant API listening on port ${config.port}`);
});
