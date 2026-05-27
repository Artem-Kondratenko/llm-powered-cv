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
      "В Chameleon 42 Артем работал project-based над Telegram strategy battler / auto-battler. Он собрал документацию с нуля, проектировал PvP/PvE-логику вместе с баланс-геймдизайнером, описывал core/meta loop, фичи и LiveOps-события, подготовил карту экранов в Figma и довел проект до согласованного milestone. Остальные детали под NDA до релиза.",
    suggestedCta: "telegram",
  },
  {
    match: (question) =>
      hasAny(question, ["hamster", "хамстер", "combat", "kombat", "комбат", "game dev", "gamedev", "gamedev masters", "heroes", "геро"]) ||
      hasAny(question, ["playducky", "плейдаки"]),
    answer:
      "В 2024 году Артем работал Game Designer / Геймдизайнером в Playducky над под-проектом GameDev Masters в экосистеме Hamster Kombat. Он участвовал в подготовке до beta stage, писал документацию вместе с продюсером, работал с dev- и art-командами до запуска, а после запуска участвовал в LiveOps и описывал фичи, события, награды и прогрессию.",
    suggestedCta: null,
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
      "В CV-базе нет подтверждения, что Артем является уверенным Python/C#/SQL developer. Unity и Cocos у него на базовом уровне: он может читать структуру проекта и делать простые правки или прототипы через AI. Корректная формулировка — AI-assisted prototyping / vibe-coding, а не classic software engineering.",
    suggestedCta: "telegram",
  },
  {
    match: (question) => hasAny(question, ["англий", "english", "язык"]),
    answer:
      "По CV-базе Артем уверенно читает документацию и статьи по теме. Разговорный английский — базовый; не стоит приукрашивать его до fluent или intermediate speaking.",
    suggestedCta: null,
  },
  {
    match: (question) => hasAny(question, ["meowmeals", "meow meals", "meow", "мяу", "бот для контроля веса"]),
    answer:
      "MeowMeals - pet-проект Артема: Telegram-бот для контроля веса с быстрым логом еды, шагов и тренировок, AI-оценкой еды по тексту/фото, ежедневными рекомендациями и недельными отчетами. Артем проектировал продуктовую логику, AI-интеграцию, onboarding, уведомления, Pro-функции, монетизацию через Telegram Stars и LLM-аналитику проекта.",
    suggestedCta: null,
  },
  {
    match: (question) => hasAny(question, ["combuchai", "комбуч", "organic", "органическ", "traffic", "трафик", "saas"]),
    answer:
      "CombuchAI - pet-проект / AI tool для поиска и анализа органического трафика для SaaS-проектов. В нем есть AI workflows, поиск organic traffic entry points, LLM-assisted content generation и работа с контекстом площадок, болями аудитории и нативными CTA.",
    suggestedCta: null,
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
    suggestedCta: null,
  },
  {
    match: (question) => hasAny(question, ["зарплат", "salary", "ставк", "rate", "$", "2000", "деньг", "гонорар"]),
    answer:
      "Зарплата зависит от формата и задач. В CV-базе указан ориентир от $2000 в месяц, но это не финальные условия от лица Артема — детали лучше обсудить напрямую.",
    suggestedCta: "telegram",
  },
  {
    match: (question) =>
      hasAny(question, ["формат", "full time", "full-time", "contract", "контракт", "project based", "project-based", "remote", "ремоут", "офис"]),
    answer:
      "Артем открыт к full-time, project-based/contract и remote. Также можно обсуждать работу в офисе Минска; остальные условия лучше согласовать напрямую.",
    suggestedCta: "telegram",
  },
  {
    match: (question) => hasAny(question, ["где находится", "локац", "город", "минск", "беларус", "географ", "рынк"]),
    answer:
      "Артем находится в Минске, Беларусь. Приоритетные рынки — СНГ/русскоязычные команды и Европа/remote.",
    suggestedCta: null,
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
