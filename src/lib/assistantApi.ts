import type { AssistantChatMessage, AssistantChatResponse, AssistantSuggestedCta } from "../types/cv";

const REQUEST_TIMEOUT_MS = 15000;
const ALLOWED_CTA_VALUES: AssistantSuggestedCta[] = ["telegram", "linkedin", "email", null];

export class AssistantApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssistantApiError";
  }
}

export function getAssistantApiUrl() {
  return import.meta.env.VITE_CV_ASSISTANT_API_URL?.trim() ?? "";
}

export function isAssistantApiEnabled() {
  return Boolean(getAssistantApiUrl());
}

function isSuggestedCta(value: unknown): value is AssistantSuggestedCta {
  return ALLOWED_CTA_VALUES.includes(value as AssistantSuggestedCta);
}

function validateAssistantResponse(value: unknown): AssistantChatResponse {
  if (!value || typeof value !== "object") {
    throw new AssistantApiError("Assistant API returned an invalid response.");
  }

  const response = value as Partial<AssistantChatResponse>;

  if (typeof response.answer !== "string" || !response.answer.trim()) {
    throw new AssistantApiError("Assistant API returned an empty answer.");
  }

  if (!isSuggestedCta(response.suggestedCta)) {
    throw new AssistantApiError("Assistant API returned an invalid CTA.");
  }

  return {
    answer: response.answer,
    suggestedCta: response.suggestedCta,
  };
}

export async function sendAssistantMessage(
  message: string,
  history: AssistantChatMessage[],
): Promise<AssistantChatResponse> {
  const apiUrl = getAssistantApiUrl();

  if (!apiUrl) {
    throw new AssistantApiError("Assistant API URL is not configured.");
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, history }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new AssistantApiError(`Assistant API returned ${response.status}.`);
    }

    const data: unknown = await response.json();
    return validateAssistantResponse(data);
  } catch (error) {
    if (error instanceof AssistantApiError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new AssistantApiError("Assistant API request timed out.");
    }

    throw new AssistantApiError("Assistant API request failed.");
  } finally {
    window.clearTimeout(timeoutId);
  }
}
