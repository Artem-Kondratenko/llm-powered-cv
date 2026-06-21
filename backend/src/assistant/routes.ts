import { Router } from "express";
import { config } from "../config.js";
import {
  AssistantHistoryMessage,
  AssistantHttpError,
  AssistantRole,
  generateAssistantAnswer,
} from "./geminiClient.js";
import { buildRelevantContext } from "./context.js";
import { sanitizeAssistantAnswer } from "./publicAnswer.js";

const router = Router();

function isRole(value: unknown): value is AssistantRole {
  return value === "user" || value === "assistant";
}

function truncate(value: string, maxLength: number) {
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

function readMessage(body: unknown) {
  if (!body || typeof body !== "object") {
    throw new AssistantHttpError(400, "Request body must be a JSON object.");
  }

  const message = (body as { message?: unknown }).message;

  if (typeof message !== "string" || !message.trim()) {
    throw new AssistantHttpError(400, "message must be a non-empty string.");
  }

  const trimmedMessage = message.trim();

  if (trimmedMessage.length > config.maxInputChars) {
    throw new AssistantHttpError(400, `message must be ${config.maxInputChars} characters or less.`);
  }

  return trimmedMessage;
}

function readHistory(body: unknown): AssistantHistoryMessage[] {
  if (!body || typeof body !== "object") {
    return [];
  }

  const history = (body as { history?: unknown }).history;

  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter((item): item is AssistantHistoryMessage => {
      if (!item || typeof item !== "object") {
        return false;
      }

      const candidate = item as Partial<AssistantHistoryMessage>;
      return isRole(candidate.role) && typeof candidate.content === "string" && Boolean(candidate.content.trim());
    })
    .slice(-config.maxHistoryMessages)
    .map((item) => ({
      role: item.role,
      content: truncate(item.content.trim(), config.maxInputChars),
    }));
}

router.post("/cv-assistant/chat", async (request, response, next) => {
  try {
    const message = readMessage(request.body);
    const history = readHistory(request.body);
    const assistantContext = buildRelevantContext(message);

    if (assistantContext.deterministicAnswer) {
      response.json(sanitizeAssistantAnswer(assistantContext.deterministicAnswer));
      return;
    }

    const answer = await generateAssistantAnswer(message, history, assistantContext);

    response.json(sanitizeAssistantAnswer(answer));
  } catch (error) {
    next(error);
  }
});

export { router as assistantRouter };
