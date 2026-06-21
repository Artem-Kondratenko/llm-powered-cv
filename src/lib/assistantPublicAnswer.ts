type AssistantAnswerLike = {
  answer: string;
};

const replacementRules: Array<[RegExp, string]> = [
  [/CV[-\s]?баз[аеуы]/giu, "резюме"],
  [/баз[аеуы]\s+CV/giu, "резюме"],
  [/\bknowledgeBase\b/giu, "резюме"],
  [/\bfallback\b/giu, "базовый режим"],
  [/\bendpoint\b/giu, "сервер"],
  [/\bscripted\b/giu, "базовый"],
  [/\bLLM[-\s]?аналитик[ауы]\b/giu, "AI-аналитика"],
  [/\bLLM\b/giu, "AI"],
  [/\bderived facts?\b/giu, "данные"],
  [/\bbackend-derived facts?\b/giu, "данные"],
  [/\bdeterministic\b/giu, "базовый"],
  [/\bcandidateAnswerType\b/giu, ""],
  [/\bcandidateType\b/giu, ""],
  [/\bsafety rules?\b/giu, ""],
  [/\bNDA rule\b/giu, "ограничение на раскрытие деталей"],
  [/\bNDA[-\s]?детал[ьи]/giu, "закрытые детали"],
  [/под\s+NDA/giu, "не раскрывается публично"],
  [/\bclassic software engineering\b/giu, "классическая разработка"],
  [/\bPython\/C#\/SQL developer\b/giu, "разработчик Python/C#/SQL"],
  [/в резюме по Nerve Games разрешено говорить/giu, "Публично можно говорить"],
  [/публично можно говорить только о разреш[её]нных метриках из резюме/giu, "Публично можно говорить только о подтверждённых метриках"],
  [/в резюме нет подтверждения, что/giu, "Открыто не указано, что"],
  [/в резюме нет подтвержд[её]нных данных/giu, "В открытых материалах нет подтверждённых данных"],
  [/в резюме нет точного года/giu, "В открытых материалах нет точного года"],
  [/В базе подтвержд[её]н/giu, "В резюме подтверждён"],
  [/В базе можно говорить только о/giu, "Публично можно говорить о"],
  [/из базы/giu, "из резюме"],
  [/в базе/giu, "в резюме"],
  [/по базе/giu, "по информации из CV"],
  [/не стоит\s+приукрашивать[^.?!]*(?:[.?!]|$)/giu, ""],
  [/не\s+приукрашивать[^.?!]*(?:[.?!]|$)/giu, ""],
  [/не\s+выдумывать[^.?!]*(?:[.?!]|$)/giu, ""],
  [/это не нужно позиционировать как[^.?!]*(?:[.?!]|$)/giu, ""],
  [/не позиционировать как[^.?!]*(?:[.?!]|$)/giu, ""],
  [/fluent\s*\/\s*intermediate speaking/giu, "свободное разговорное владение"],
  [/fluent\s+или\s+intermediate speaking/giu, "свободное разговорное владение"],
  [/уверенного\s+intermediate speaking/giu, "уверенного разговорного уровня"],
];

const cleanupRules: Array<[RegExp, string]> = [
  [/\s+([,.;:!?])/gu, "$1"],
  [/([.!?])\s*([.!?])+/gu, "$1"],
  [/\s{2,}/gu, " "],
  [/:\s*\./gu, "."],
];

export function sanitizePublicAnswer(answer: string) {
  const sanitized = cleanupRules.reduce((result, [pattern, replacement]) => {
    return result.replace(pattern, replacement);
  }, replacementRules.reduce((result, [pattern, replacement]) => result.replace(pattern, replacement), answer)).trim();

  return sanitized || "Сейчас доступен базовый режим ответов. Для деталей лучше написать Артёму напрямую.";
}

export function sanitizeAssistantAnswer<T extends AssistantAnswerLike>(value: T): T {
  return {
    ...value,
    answer: sanitizePublicAnswer(value.answer),
  };
}
