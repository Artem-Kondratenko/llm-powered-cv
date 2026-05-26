import type { AssistantSuggestedCta } from "../types/cv";

export type AssistantFallbackAnswer = {
  answer: string;
  suggestedCta: AssistantSuggestedCta;
};

type FallbackRule = {
  match: (normalizedQuestion: string) => boolean;
  answer: string;
  suggestedCta: AssistantSuggestedCta;
};

function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9#%+/]+/gi, " ")
    .replace(/\s+/g, " ");
}

function hasAny(value: string, keywords: string[]) {
  return keywords.some((keyword) => value.includes(keyword));
}

const fallbackRules: FallbackRule[] = [
  {
    match: (question) => hasAny(question, ["chameleon", "хамелеон", "42"]),
    answer:
      "В Chameleon 42 Артем собрал документацию с нуля, описывал core/meta loop, сценарии, фичи и LiveOps-события. Также он проектировал PvP/PvE-логику вместе с баланс-геймдизайнером, выступал game/product owner по части фич, подготовил карту экранов в Figma и довел проект до согласованного milestone.",
    suggestedCta: "telegram",
  },
  {
    match: (question) =>
      hasAny(question, ["процент", "%", "точн", "retention", "ретенш", "рост"]) &&
      hasAny(question, ["retention", "ретенш", "time spent", "dau", "arpdau", "a/b", "ab", "метрик"]),
    answer:
      "Точные проценты роста в CV-базе не указаны. Есть только подтвержденный факт, что после A/B-итераций улучшались retention, time spent, DAU и ARPDAU, поэтому проценты лучше не додумывать и уточнить у Артема напрямую.",
    suggestedCta: "telegram",
  },
  {
    match: (question) => hasAny(question, ["python", "c#", "c sharp", "csharp", "sql", "программ"]),
    answer:
      "В CV-базе нет подтверждения уверенного коммерческого программирования на Python, C# или SQL. Есть опыт vibe-coding, AI-assisted prototyping, Telegram-ботов, rapid MVP, basic Unity/Cocos, NerveEngine и работы с конфигами в Google Sheets/Excel.",
    suggestedCta: "telegram",
  },
  {
    match: (question) => hasAny(question, ["англий", "english", "язык"]),
    answer:
      "По CV-базе Артем уверенно читает документацию и статьи по теме. Разговорный английский слабый, поэтому не стоит заявлять уровень выше этого.",
    suggestedCta: "telegram",
  },
  {
    match: (question) => hasAny(question, ["meowmeals", "meow meals", "meow", "мяу", "бот для контроля веса"]),
    answer:
      "MeowMeals - pet-проект Артема: Telegram-бот для контроля веса с быстрым логом еды, шагов и тренировок, AI-оценкой еды по тексту/фото, ежедневными рекомендациями и недельными отчетами. В проекте также заложены Telegram Stars, onboarding, уведомления, Pro-функции и аналитическая обвязка на базе LLM.",
    suggestedCta: "telegram",
  },
  {
    match: (question) =>
      hasAny(question, ["mobile f2p", "f2p", "мобил", "mobile"]) &&
      hasAny(question, ["подходит", "роль", "ваканси", "позици", "найм"]),
    answer:
      "Опыт Артема хорошо сопоставляется с mobile F2P задачами: mobile games, FTUE, первые сессии, уровни, LiveOps, offers, rewards, progression, analytics и A/B tests. Я бы не говорил за работодателя, что он точно подходит, но вакансию стоит обсудить напрямую в Telegram.",
    suggestedCta: "telegram",
  },
  {
    match: (question) => hasAny(question, ["generalist", "полез", "закрывает", "сильн", "чем артем полезен"]),
    answer:
      "Как Game Designer Generalist Артем закрывает документацию, FTUE, first sessions, level design, LiveOps, F2P systems, аналитику, A/B tests и AI-assisted prototyping. Если нужно быстро сопоставить его опыт с ролью, лучше написать Артему в Telegram.",
    suggestedCta: "telegram",
  },
  {
    match: (question) => hasAny(question, ["обсудить", "ваканси", "нанять", "найм", "интервью", "связаться", "контакт"]),
    answer: "Да, вакансию лучше обсудить напрямую с Артемом в Telegram: https://t.me/Artem_Kondratenko",
    suggestedCta: "telegram",
  },
];

export function findAssistantFallbackAnswer(question: string): AssistantFallbackAnswer | null {
  const normalizedQuestion = normalize(question);
  const rule = fallbackRules.find((candidate) => candidate.match(normalizedQuestion));

  return rule
    ? {
        answer: rule.answer,
        suggestedCta: rule.suggestedCta,
      }
    : null;
}
