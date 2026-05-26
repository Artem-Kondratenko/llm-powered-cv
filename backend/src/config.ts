import "dotenv/config";

function readNumber(name: string, fallback: number) {
  const rawValue = process.env[name];

  if (!rawValue) {
    return fallback;
  }

  const parsedValue = Number(rawValue);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
}

export const config = {
  port: readNumber("PORT", 8080),
  allowedOrigin: process.env.ALLOWED_ORIGIN?.trim() ?? "",
  geminiApiKey: process.env.GEMINI_API_KEY?.trim() ?? "",
  llmModel: process.env.LLM_MODEL?.trim() || "gemini-2.0-flash",
  maxInputChars: readNumber("MAX_INPUT_CHARS", 1000),
  maxHistoryMessages: readNumber("MAX_HISTORY_MESSAGES", 8),
  maxOutputTokens: readNumber("MAX_OUTPUT_TOKENS", 600),
};
