import { config } from "../config.js";
import { assistantSystemPrompt } from "./systemPrompt.js";

export type AssistantRole = "user" | "assistant";
export type AssistantSuggestedCta = "telegram" | "linkedin" | "email" | null;

export type AssistantHistoryMessage = {
  role: AssistantRole;
  content: string;
};

export type AssistantAnswer = {
  answer: string;
  suggestedCta: AssistantSuggestedCta;
};

type GeminiPart = {
  text?: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
  }>;
  error?: {
    message?: string;
  };
};

export class AssistantHttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "AssistantHttpError";
  }
}

function toGeminiRole(role: AssistantRole) {
  return role === "assistant" ? "model" : "user";
}

function normalizeModelName(model: string) {
  return model.replace(/^models\//, "");
}

function parseJsonResponse(text: string): unknown {
  const trimmedText = text.trim();
  const withoutFence = trimmedText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");

  return JSON.parse(withoutFence);
}

function isSuggestedCta(value: unknown): value is AssistantSuggestedCta {
  return value === "telegram" || value === "linkedin" || value === "email" || value === null;
}

function validateAssistantAnswer(value: unknown): AssistantAnswer {
  if (!value || typeof value !== "object") {
    throw new AssistantHttpError(502, "Gemini returned an invalid response.");
  }

  const response = value as Partial<AssistantAnswer>;

  if (typeof response.answer !== "string" || !response.answer.trim()) {
    throw new AssistantHttpError(502, "Gemini returned an empty answer.");
  }

  return {
    answer: response.answer.trim(),
    suggestedCta: isSuggestedCta(response.suggestedCta) ? response.suggestedCta : null,
  };
}

export async function generateAssistantAnswer(
  message: string,
  history: AssistantHistoryMessage[],
): Promise<AssistantAnswer> {
  if (!config.geminiApiKey) {
    throw new AssistantHttpError(503, "GEMINI_API_KEY is not configured.");
  }

  const model = encodeURIComponent(normalizeModelName(config.llmModel));
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": config.geminiApiKey,
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: assistantSystemPrompt }],
      },
      contents: [
        ...history.map((historyMessage) => ({
          role: toGeminiRole(historyMessage.role),
          parts: [{ text: historyMessage.content }],
        })),
        {
          role: "user",
          parts: [{ text: message }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: config.maxOutputTokens,
        responseMimeType: "application/json",
      },
    }),
  });

  const data = (await response.json().catch(() => ({}))) as GeminiResponse;

  if (!response.ok) {
    throw new AssistantHttpError(
      502,
      data.error?.message ? `Gemini API request failed: ${data.error.message}` : "Gemini API request failed.",
    );
  }

  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    throw new AssistantHttpError(502, "Gemini returned no answer.");
  }

  try {
    return validateAssistantAnswer(parseJsonResponse(text));
  } catch (error) {
    if (error instanceof AssistantHttpError) {
      throw error;
    }

    throw new AssistantHttpError(502, "Gemini returned malformed JSON.");
  }
}
