export type AssistantSuggestedCta = "telegram" | "linkedin" | "email" | null;

export type DeterministicAssistantAnswer = {
  answer: string;
  suggestedCta: AssistantSuggestedCta;
};

export type AssistantCandidateType =
  | "type1_known_or_derived_fact"
  | "type2_related_or_general"
  | "type3_no_verified_data";

export type DeterministicIntent =
  | "age"
  | "birth_date"
  | "location"
  | "contacts"
  | "telegram"
  | "linkedin"
  | "email"
  | "pdf"
  | "salary"
  | "work_format"
  | "english"
  | "status"
  | "availability"
  | "relocation"
  | "programming"
  | "exact_metrics"
  | "nda_details"
  | "experience_years"
  | "years_ago"
  | "topic_experience"
  | "assistant_mode"
  | null;

export type DerivedFacts = {
  birthDate: string;
  currentDate: string;
  currentAge: number;
  location: string;
  status: string;
  salaryRange: string;
  workFormats: string[];
  english: string;
  contacts: typeof CONTACTS;
  protectedTopics: string[];
  documentedExperience: {
    firstCommercialYear: number;
    calendarYearsSinceFirstCommercialExperience: number;
    note: string;
  };
};

export type KnownFactMatch = {
  topic: string;
  title: string;
  context: string;
};

export type AssistantContextResult = {
  normalizedQuestion: string;
  candidateType: AssistantCandidateType;
  matchedTopics: string[];
  deterministicIntent: DeterministicIntent;
  derivedFacts: DerivedFacts;
  relevantContext: string;
  deterministicAnswer: DeterministicAssistantAnswer | null;
  isRiskyProfessionalQuestion: boolean;
};

const BIRTH_DATE = {
  day: 23,
  monthIndex: 10,
  year: 1989,
};

const CONTACTS = {
  telegram: "https://t.me/Artem_Kondratenko",
  linkedIn: "https://www.linkedin.com/in/artem-kondratenko231189/",
  email: "Anderson892311@gmail.com",
  pdf: "/files/Artem_Kondratenko_GameDesigner_CV.pdf",
};

const FIRST_COMMERCIAL_EXPERIENCE_YEAR = 2022;

const EVENT_YEARS = [
  {
    aliases: ["chameleon", "хамелеон", "42"],
    label: "Chameleon 42",
    year: 2025,
  },
  {
    aliases: ["nerve games", "нерв", "catch the candy", "game to think"],
    label: "Nerve Games",
    year: 2024,
  },
  {
    aliases: ["hamster", "хамстер", "kombat", "combat", "game dev masters", "gamedev masters", "gamedev heroes", "playducky"],
    label: "Hamster Kombat / GameDev Masters / Playducky",
    year: 2024,
  },
  {
    aliases: ["tobee", "to bee", "lifebalance", "life balance"],
    label: "ToBee Live",
    year: 2022,
  },
  {
    aliases: ["meowmeals", "meow meals", "meow", "мяу"],
    label: "MeowMeals",
    year: 2025,
  },
  {
    aliases: ["combuchai", "комбуч"],
    label: "CombuchAI",
    year: 2025,
  },
];

type TopicDefinition = {
  topic: string;
  title: string;
  aliases: string[];
  context: () => string;
};

export function normalizeQuestion(message: string) {
  return message
    .trim()
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/c sharp/g, "c#")
    .replace(/csharp/g, "c#")
    .replace(/a\/b/g, "ab")
    .replace(/[^a-zа-я0-9#%$+]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeAlias(alias: string) {
  return normalizeQuestion(alias);
}

function hasAny(normalizedQuestion: string, aliases: string[]) {
  return aliases.some((alias) => normalizedQuestion.includes(normalizeAlias(alias)));
}

function hasAll(normalizedQuestion: string, aliases: string[]) {
  return aliases.every((alias) => normalizedQuestion.includes(normalizeAlias(alias)));
}

function calculateAge(now = new Date()) {
  let age = now.getFullYear() - BIRTH_DATE.year;
  const birthdayThisYear = new Date(now.getFullYear(), BIRTH_DATE.monthIndex, BIRTH_DATE.day);

  if (now < birthdayThisYear) {
    age -= 1;
  }

  return age;
}

function calculateCalendarYearsSince(year: number, now = new Date()) {
  return Math.max(0, now.getFullYear() - year);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
}

function formatIsoDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function buildDerivedFacts(now = new Date()): DerivedFacts {
  const calendarYearsSinceFirstCommercialExperience = calculateCalendarYearsSince(
    FIRST_COMMERCIAL_EXPERIENCE_YEAR,
    now,
  );

  return {
    birthDate: "1989-11-23",
    currentDate: formatIsoDate(now),
    currentAge: calculateAge(now),
    location: "Минск, Беларусь",
    status: "Открыт к предложениям, если роль и проект подходят по задачам; точную доступность нужно уточнять напрямую.",
    salaryRange: "Ориентир от $2000 в месяц; зависит от формата, задач и уровня ответственности.",
    workFormats: ["remote", "full-time", "project-based/contract", "офис в Минске обсуждаемо"],
    english:
      "Артём уверенно читает документацию и профессиональные материалы на английском. Разговорный английский у него базовый; для роли с активными созвонами лучше уточнить детали напрямую.",
    contacts: CONTACTS,
    protectedTopics: [
      "NDA-детали Chameleon 42",
      "точные внутренние метрики и отчёты",
      "точная availability / дата выхода",
      "финальные условия и зарплата как фиксированное требование",
      "уверенное программирование на Python/C#/SQL",
    ],
    documentedExperience: {
      firstCommercialYear: FIRST_COMMERCIAL_EXPERIENCE_YEAR,
      calendarYearsSinceFirstCommercialExperience,
      note:
        "В базе подтвержден коммерческий/проектный опыт с 2022 года. Месяцы не указаны, поэтому длительность можно формулировать как календарный период, а не точный стаж до месяца.",
    },
  };
}

function ageContext() {
  const derivedFacts = buildDerivedFacts();

  return [
    "Дата рождения: 23.11.1989.",
    `Безопасный производный факт: на ${formatDate(new Date())} Артему ${derivedFacts.currentAge} лет.`,
    "Возраст нужно считать динамически от даты рождения, а не хранить как статичное число.",
  ].join(" ");
}

const topicDefinitions: TopicDefinition[] = [
  {
    topic: "age_birth_date",
    title: "Возраст и дата рождения",
    aliases: ["сколько лет", "возраст", "age", "когда родился", "дата рождения", "день рождения", "родился"],
    context: ageContext,
  },
  {
    topic: "location",
    title: "Локация",
    aliases: ["где находится", "где живет", "где живёт", "локация", "location", "город", "страна", "минск", "беларус"],
    context: () =>
      "Артем находится в Минске, Беларусь. Приоритетные рынки: СНГ/русскоязычные команды и Европа/remote.",
  },
  {
    topic: "english",
    title: "Английский",
    aliases: ["англий", "english", "язык", "speaking", "fluent", "intermediate"],
    context: () =>
      "Английский: Артем уверенно читает документацию и профессиональные материалы. Разговорный английский базовый; для роли с активными созвонами лучше уточнить детали напрямую.",
  },
  {
    topic: "status",
    title: "Актуальный статус",
    aliases: ["статус", "актуальн", "ищет работу", "открыт", "available", "open to", "рассматривает предложения"],
    context: () =>
      "Актуальный статус: Артем открыт к предложениям, если роль и проект подходят по задачам. Точную availability и дату выхода нельзя обещать от его лица.",
  },
  {
    topic: "work_format",
    title: "Форматы работы",
    aliases: ["формат", "full time", "full-time", "контракт", "contract", "project based", "project-based", "remote", "удален", "удаленка", "офис"],
    context: () =>
      "Форматы работы: Артем открыт к full-time, project-based/contract и remote. Офис в Минске обсуждаемо. Релокация и остальные условия - только через личное обсуждение.",
  },
  {
    topic: "relocation",
    title: "Релокация",
    aliases: ["релокац", "relocation", "переезд", "переехать", "relocate"],
    context: () =>
      "Релокация: только личное обсуждение с Артемом. Подтвержденные форматы из базы: remote, full-time, project-based/contract, офис в Минске обсуждаемо.",
  },
  {
    topic: "salary",
    title: "Зарплата",
    aliases: ["зарплат", "salary", "ставк", "rate", "оклад", "гонорар", "$", "2000", "сколько хочет", "компенсац"],
    context: () =>
      "Зарплата зависит от формата, задач и уровня ответственности. Ориентир в CV-базе: от $2000 в месяц. Это не финальные условия; детали нужно обсуждать напрямую.",
  },
  {
    topic: "contacts",
    title: "Контакты",
    aliases: ["telegram", "телеграм", "linkedin", "линкедин", "email", "почт", "контакт", "связаться", "написать", "обсудить вакансию", "можно обсудить"],
    context: () =>
      `Контакты: Telegram ${CONTACTS.telegram}; LinkedIn ${CONTACTS.linkedIn}; Email ${CONTACTS.email}. Telegram - главный CTA, LinkedIn - дополнительный.`,
  },
  {
    topic: "pdf",
    title: "PDF CV",
    aliases: ["pdf", "резюме", "скачать", "download"],
    context: () => `PDF CV доступен по пути ${CONTACTS.pdf}.`,
  },
  {
    topic: "programming",
    title: "Программирование, Unity и Cocos",
    aliases: ["python", "c#", "sql", "программ", "код", "developer", "разработчик"],
    context: () =>
      "Unity и Cocos - базовый уровень: может читать и понимать структуру проекта, делать простые правки и прототипы через AI. Нельзя утверждать, что Артем является уверенным Python/C#/SQL developer. Корректная формулировка: AI-assisted prototyping / vibe-coding, а не classic software engineering. NerveEngine - глубокий production experience.",
  },
  {
    topic: "tools",
    title: "Инструменты",
    aliases: ["tools", "инструмент", "confluence", "notion", "asana", "trello", "figma", "miro", "google docs", "google sheets", "excel"],
    context: () =>
      "Инструменты: Confluence, Notion, Asana, Trello, Figma, Miro, Google Docs, Google Sheets, Excel. Также есть работа с AppMetrica, devtodev и внутренними дашбордами.",
  },
  {
    topic: "engines",
    title: "Движки",
    aliases: ["engine", "движк", "unity", "cocos", "nerveengine", "nerve engine"],
    context: () =>
      "Движки и конфиги: Unity basic, Cocos basic, NerveEngine deep production experience. В NerveEngine занимался разработкой и улучшением движка, создавал уровни и настраивал игровые сущности.",
  },
  {
    topic: "mobile_f2p",
    title: "Mobile F2P",
    aliases: ["mobile f2p", "f2p", "мобильн", "mobile", "мобайл", "free to play"],
    context: () =>
      "Для mobile F2P есть релевантный опыт: Nerve Games, Catch The Candy, Game To Think, FTUE, первые сессии, level design, кривая сложности, LiveOps, offers, rewards, progression, ads monetization, analytics и A/B tests.",
  },
  {
    topic: "ftue_tutorials",
    title: "FTUE, туториалы и onboarding",
    aliases: ["ftue", "tutorial", "туториал", "онбординг", "onboarding", "первые сесс", "first session", "первый запуск", "обучение"],
    context: () =>
      "FTUE и onboarding: Артем работал с туториалами, первыми уровнями, первыми сессиями и выводом игрока на core loop. В Nerve Games работал с FTUE, туториалами и кривой сложности; в Chameleon 42 работал над tutorial/onboarding; в ToBee Live проектировал UX-путь от первого запуска до регулярного использования.",
  },
  {
    topic: "monetization",
    title: "Монетизация",
    aliases: ["монетизац", "economy", "эконом", "offer", "оффер", "battle pass", "магазин", "shop", "rewarded", "ads", "реклам", "stars", "telegram stars", "платеж"],
    context: () =>
      "Монетизация: F2P systems, прогрессия, награды, офферы, battle pass, магазин и базовая экономика. В Chameleon 42 описывал магазин и офферы; в Nerve Games работал с магазином и офферами; есть опыт с interstitial ads и rewarded video; в MeowMeals заложена монетизация через Telegram Stars.",
  },
  {
    topic: "analytics_ab_tests",
    title: "Аналитика и A/B-тесты",
    aliases: ["аналитик", "a b", "ab", "a/b", "тест", "метрик", "retention", "ретенш", "time spent", "dau", "arpdau", "appmetrica", "devtodev", "воронк"],
    context: () =>
      "Аналитика: AppMetrica, devtodev, внутренние дашборды, Google Sheets/Excel, воронки, retention, time spent, DAU, ARPDAU. В Nerve Games провел около 10 итераций после запуска с A/B-тестами. Публично можно говорить только о разрешенных метриках из базы и не выдумывать дополнительные проценты или внутренние отчеты.",
  },
  {
    topic: "ai_prototyping",
    title: "AI prototyping",
    aliases: ["llm", "gemini", "openai", "прототип", "prototype", "prototyping", "vibe", "вайб", "mvp", "ai assisted", "artificial intelligence", "искусственн"],
    context: () =>
      "AI/prototyping: Артем использует AI-assisted prototyping и vibe-coding для быстрых MVP, Telegram-ботов и AI-инструментов. Примеры: MeowMeals, CombuchAI, LLM-аналитика и продуктовая сборка прототипов. Не позиционировать как classic software engineering.",
  },
  {
    topic: "chameleon_42",
    title: "Chameleon 42",
    aliases: ["chameleon", "хамелеон", "42", "strategy battler", "auto battler", "автобатлер", "pvp", "pve", "disciples"],
    context: () =>
      "Chameleon 42: 2025, project-based, Telegram strategy battler / auto-battler. Артем собрал документацию с нуля, проектировал PvP/PvE-логику совместно с баланс-геймдизайнером, описывал core/meta loop, игровые сценарии, фичи, LiveOps-события, магазин, офферы, боевую систему, артефакты, уровни и прокачку юнитов, подготовил карту экранов в Figma и довел проект до согласованного milestone. Детали LiveOps-событий, reward-систем и часть проектных решений под NDA.",
  },
  {
    topic: "nerve_games",
    title: "Nerve Games",
    aliases: ["nerve games", "нерв", "catch the candy", "game to think", "candy", "levels", "уровн"],
    context: () =>
      "Nerve Games: 2024-2025, Game Designer / Level Designer. Проекты: Catch The Candy, Game To Think. Создал и настроил около 100 уровней для Game To Think, собрал кривую сложности для soft launch, создал и настроил около 50 уровней для Catch The Candy, провел около 10 post-launch итераций с A/B-тестами, работал с FTUE, туториалами, магазином, кривой сложности, внедрил босс- и бонусные уровни.",
  },
  {
    topic: "hamster_playducky",
    title: "Hamster Kombat / Playducky",
    aliases: ["hamster", "хамстер", "kombat", "combat", "комбат", "game dev masters", "gamedev masters", "gamedev heroes", "heroes", "playducky", "плейдаки"],
    context: () =>
      "Hamster Kombat / Playducky: 2024, Game Designer / Геймдизайнер. Проект в экосистеме Hamster Kombat; на Артеме была разработка под-проекта GameDev Masters, который frontend может также называть Gamedev Heroes. Он участвовал в подготовке проекта до beta stage, писал документацию совместно с продюсером, работал с dev- и art-командами до запуска, участвовал в LiveOps после запуска, описывал фичи, события, награды и прогрессию.",
  },
  {
    topic: "tobee_live",
    title: "ToBee Live",
    aliases: ["tobee", "to bee", "life balance", "lifebalance", "геолокац", "rpg"],
    context: () =>
      "ToBee Live: 2022-2024, Game Designer. Mobile RPG-прототип с геолокацией и системой LifeBalance. Артем участвовал в разработке концепции, прорабатывал core/meta loop, описывал LifeBalance, готовил GDD и мокапы экранов, участвовал в проектировании UX-пути от первого запуска до регулярного использования.",
  },
  {
    topic: "meowmeals",
    title: "MeowMeals",
    aliases: ["meowmeals", "meow meals", "meow", "мяу", "бот для контроля веса", "вес", "еда", "telegram bot"],
    context: () =>
      "MeowMeals: pet-проект / личный продукт Артема, Telegram bot / AI-assisted product. Бот для контроля веса: лог еды, шагов и тренировок, AI-оценка еды по тексту/фото, ежедневные рекомендации и недельные отчеты. Артем проектировал продуктовую логику, AI-интеграцию, onboarding, уведомления, Pro-функции, монетизацию через Telegram Stars и LLM-аналитику проекта. Link: https://t.me/meow_meals_bot.",
  },
  {
    topic: "combuchai",
    title: "CombuchAI",
    aliases: ["combuchai", "комбуч", "organic", "органическ", "traffic", "трафик", "saas", "reddit", "youtube"],
    context: () =>
      "CombuchAI: pet-проект / AI tool / прототип для поиска и анализа органических точек входа для SaaS-проектов. Поддерживаемые направления/источники в прототипе: Telegram, YouTube, Reddit. Демонстрирует AI workflows, поиск organic traffic entry points, LLM-assisted content generation, работу с контекстом площадок, болями аудитории и нативными CTA.",
  },
  {
    topic: "generalist_value",
    title: "Game Designer Generalist",
    aliases: ["generalist", "дженералист", "полез", "сильн", "закрывает", "ценность", "чем полезен", "позиционирование"],
    context: () =>
      "Позиционирование: Game Designer Generalist для mobile F2P и Telegram games. Сильные стороны: документация, FTUE, first sessions, level design, core/meta loop, LiveOps, F2P systems, аналитика, A/B tests, AI-assisted prototyping/vibe-coding. Умеет доводить идеи до работающих фич через документацию, постановку задач, настройку, проверку реализации и итерации по метрикам.",
  },
  {
    topic: "telegram_games",
    title: "Telegram games / products",
    aliases: ["telegram games", "telegram game", "telegram products", "telegram", "tma", "телеграм игр", "телеграм продукт"],
    context: () =>
      "Опыт Telegram games / products подтвержден Chameleon 42, Hamster Kombat / GameDev Masters и MeowMeals. Это безопасный производный вывод из базы.",
  },
  {
    topic: "liveops",
    title: "LiveOps",
    aliases: ["liveops", "live ops", "ивент", "событ", "сезон", "daily", "квест", "награды"],
    context: () =>
      "LiveOps: Артем описывал LiveOps-события в Chameleon 42, участвовал в LiveOps после запуска GameDev Masters в экосистеме Hamster Kombat, работал с post-launch итерациями в Nerve Games, событиями, наградами, прогрессией и вовлекающими механиками.",
  },
];

export function detectKnownFacts(message: string): KnownFactMatch[] {
  const normalizedQuestion = normalizeQuestion(message);
  const matches = topicDefinitions
    .filter((definition) => hasAny(normalizedQuestion, definition.aliases))
    .map((definition) => ({
      topic: definition.topic,
      title: definition.title,
      context: definition.context(),
    }));

  const uniqueMatches = new Map<string, KnownFactMatch>();

  for (const match of matches) {
    uniqueMatches.set(match.topic, match);
  }

  return [...uniqueMatches.values()];
}

export function detectRiskyProfessionalQuestion(message: string) {
  const question = normalizeQuestion(message);

  return (
    hasAny(question, [
      "точн",
      "внутрен",
      "метрик",
      "процент",
      "цифр",
      "отчет",
      "nda",
      "секрет",
      "подробн",
      "зарплат",
      "salary",
      "ставк",
      "rate",
      "доступ",
      "availability",
      "готов",
      "выйти",
      "завтра",
      "релокац",
      "переезд",
      "нанять",
      "ваканси",
      "интервью",
      "работал ли",
      "умеет ли",
      "есть ли опыт",
      "подходит ли",
      "команда",
      "сколько человек",
      "python",
      "c#",
      "sql",
      "разработчик",
    ]) || hasAll(question, ["chameleon", "детал"])
  );
}

function includesTopic(matches: KnownFactMatch[], topic: string) {
  return matches.some((match) => match.topic === topic);
}

function asksAboutInternalOrExactMetrics(question: string) {
  return (
    hasAny(question, ["точн", "внутрен", "абсолютн", "отчет", "отчеты", "разбивк", "секрет", "nda"]) &&
    hasAny(question, ["метрик", "цифр", "retention", "ретенш", "dau", "arpdau", "chameleon", "хамелеон", "процент"])
  );
}

function asksAboutNdaDetails(question: string) {
  return hasAny(question, ["nda", "ндаг", "под nda", "детал", "секрет", "раскрой", "закрыт"]) &&
    hasAny(question, ["chameleon", "хамелеон", "42", "liveops", "reward", "награ", "метрик", "meowmeals"]);
}

function asksAboutAvailability(question: string) {
  return hasAny(question, ["готов выйти", "выйти завтра", "завтра", "availability", "доступен", "доступность", "когда может выйти", "дата выхода"]);
}

function asksAboutStatus(question: string) {
  return hasAny(question, ["статус", "актуальн", "ищет работу", "открыт", "available", "open to", "рассматривает предложения"]);
}

function asksAboutRelocation(question: string) {
  return hasAny(question, ["релокац", "relocation", "переезд", "переехать", "relocate"]);
}

function asksAboutAssistantMode(question: string) {
  return (
    hasAny(question, ["fallback", "фолбек", "базовый режим", "режим ассистента", "режим ответов", "работает ли ассистент"]) ||
    hasAll(question, ["ассистент", "работает"])
  );
}

function asksAboutVacancyDiscussion(question: string) {
  return (
    (hasAny(question, ["обсудить", "нанять", "найм", "интервью", "связаться", "контакт"]) ||
      hasAll(question, ["ваканси", "обсуд"])) &&
    !hasAny(question, ["не обсуждать"])
  );
}

function asksAboutContacts(question: string) {
  return (
    hasAny(question, ["контакт", "связаться", "написать", "почт", "email", "linkedin", "линкедин", "telegram", "телеграм"]) &&
    !hasAny(question, ["telegram games", "telegram game", "telegram products", "игр", "продукт", "bot", "бот", "meowmeals", "hamster", "chameleon"])
  );
}

function asksForTelegram(question: string) {
  return hasAny(question, ["telegram", "телеграм"]) &&
    !hasAny(question, ["telegram games", "telegram game", "telegram products", "игр", "продукт", "bot", "бот"]);
}

function asksForLinkedIn(question: string) {
  return hasAny(question, ["linkedin", "линкедин", "linked in"]);
}

function asksForEmail(question: string) {
  return hasAny(question, ["email", "почт", "e mail", "mail"]);
}

function asksAboutAge(question: string) {
  return hasAny(question, ["сколько лет", "возраст", "age"]);
}

function asksAboutBirthDate(question: string) {
  return hasAny(question, ["когда родился", "дата рождения", "день рождения", "родился"]);
}

function asksAboutRetentionPercent(question: string) {
  return (
    hasAny(question, ["процент", "%", "точн", "retention", "ретенш", "рост"]) &&
    hasAny(question, ["ab", "a b", "a/b", "тест", "retention", "ретенш", "dau", "arpdau", "time spent"])
  );
}

function asksAboutExperienceYears(question: string) {
  return hasAny(question, [
    "стаж",
    "лет опыта",
    "years of experience",
    "experience years",
    "сколько опыта",
    "как давно в геймдизайне",
    "какой опыт по годам",
    "длительность работы",
  ]);
}

function asksHowManyYearsAgo(question: string) {
  return hasAny(question, ["сколько лет назад", "как давно", "когда было", "в каком году", "years ago"]);
}

function findEventYearMatch(question: string) {
  return EVENT_YEARS.find((event) => hasAny(question, event.aliases)) ?? null;
}

function isTopicExperienceQuestion(question: string, matches: KnownFactMatch[]) {
  return (
    matches.some((match) =>
      [
        "mobile_f2p",
        "ftue_tutorials",
        "monetization",
        "analytics_ab_tests",
        "liveops",
        "telegram_games",
        "ai_prototyping",
        "tools",
        "engines",
        "generalist_value",
      ].includes(match.topic),
    ) || hasAny(question, ["есть ли опыт", "работал ли", "подходит ли", "умеет ли", "чем полезен"])
  );
}

export function detectDeterministicIntent(message: string): DeterministicIntent {
  const question = normalizeQuestion(message);
  const matches = detectKnownFacts(question);

  if (asksAboutAssistantMode(question)) {
    return "assistant_mode";
  }

  if (asksHowManyYearsAgo(question) && findEventYearMatch(question)) {
    return "years_ago";
  }

  if (asksAboutExperienceYears(question)) {
    return "experience_years";
  }

  if (asksAboutAge(question)) {
    return "age";
  }

  if (asksAboutBirthDate(question)) {
    return "birth_date";
  }

  if (asksAboutAvailability(question)) {
    return "availability";
  }

  if (asksAboutNdaDetails(question)) {
    return "nda_details";
  }

  if (asksAboutInternalOrExactMetrics(question) || asksAboutRetentionPercent(question)) {
    return "exact_metrics";
  }

  if (asksForTelegram(question)) {
    return "telegram";
  }

  if (asksForLinkedIn(question)) {
    return "linkedin";
  }

  if (asksForEmail(question)) {
    return "email";
  }

  if (includesTopic(matches, "pdf")) {
    return "pdf";
  }

  if (includesTopic(matches, "english")) {
    return "english";
  }

  if (includesTopic(matches, "salary")) {
    return "salary";
  }

  if (asksAboutRelocation(question) || includesTopic(matches, "relocation")) {
    return "relocation";
  }

  if (includesTopic(matches, "location")) {
    return "location";
  }

  if (includesTopic(matches, "work_format")) {
    return "work_format";
  }

  if (asksAboutStatus(question) || includesTopic(matches, "status")) {
    return "status";
  }

  if (includesTopic(matches, "programming")) {
    return "programming";
  }

  if (asksAboutVacancyDiscussion(question) || (includesTopic(matches, "contacts") && asksAboutContacts(question))) {
    return "contacts";
  }

  if (isTopicExperienceQuestion(question, matches)) {
    return "topic_experience";
  }

  return null;
}

function getDeterministicAnswer(
  question: string,
  matches: KnownFactMatch[],
  deterministicIntent: DeterministicIntent,
  derivedFacts: DerivedFacts,
  isRiskyProfessionalQuestion: boolean,
): DeterministicAssistantAnswer | null {
  if (deterministicIntent === "assistant_mode") {
    return {
      answer: "Сейчас доступен базовый режим ответов. Для деталей лучше написать Артёму напрямую.",
      suggestedCta: "telegram",
    };
  }

  if (deterministicIntent === "availability") {
    return {
      answer:
        "В CV-базе нет подтверждённой даты доступности или обещания, что Артём готов выйти завтра. Такие условия лучше уточнить у Артёма напрямую в Telegram.",
      suggestedCta: "telegram",
    };
  }

  if (deterministicIntent === "nda_details") {
    return {
      answer:
        "Часть деталей Chameleon 42, LiveOps-событий, reward-систем и пользовательской статистики не раскрывается публично. Можно говорить о роли Артёма, зоне ответственности и общих типах задач; конкретику лучше обсудить с Артёмом напрямую.",
      suggestedCta: "telegram",
    };
  }

  if (deterministicIntent === "years_ago") {
    const event = findEventYearMatch(question);

    if (event) {
      const yearsAgo = calculateCalendarYearsSince(event.year);

      return {
        answer: `В базе CV для ${event.label} указан ${event.year} год. На ${derivedFacts.currentDate} это примерно ${yearsAgo} ${yearsAgo === 1 ? "год" : yearsAgo >= 2 && yearsAgo <= 4 ? "года" : "лет"} назад; точный месяц в базе не указан.`,
        suggestedCta: null,
      };
    }
  }

  if (deterministicIntent === "experience_years") {
    return {
      answer: `В базе подтверждён коммерческий и project-based опыт Артёма с ${derivedFacts.documentedExperience.firstCommercialYear} года. На ${derivedFacts.currentDate} это около ${derivedFacts.documentedExperience.calendarYearsSinceFirstCommercialExperience} лет календарного периода, но месяцы и пересечения проектов в базе не детализированы, поэтому точный стаж до месяца лучше не додумывать.`,
      suggestedCta: null,
    };
  }

  if (deterministicIntent === "exact_metrics") {
    const isChameleon = includesTopic(matches, "chameleon_42");

    if (asksAboutRetentionPercent(question)) {
      return {
        answer:
          "Публично можно говорить об улучшении retention и DAU примерно на 10–15% по успешным итерациям. Также указан ориентир retention 40/20/10 для Short/Mid/Long по итогам тестов туториала и кривой сложности; внутренние детали лучше обсудить напрямую.",
        suggestedCta: "telegram",
      };
    }

    return {
      answer: isChameleon
        ? "Точные внутренние метрики Chameleon 42 публично не раскрываются. Часть деталей проекта закрыта, поэтому лучше уточнить у Артёма напрямую, что можно обсуждать в рамках конкретной вакансии."
        : "Публично можно говорить только о подтверждённых метриках: улучшении retention и DAU примерно на 10–15% по успешным итерациям. Внутренние отчёты, абсолютные значения и детальную разбивку лучше обсудить напрямую.",
      suggestedCta: "telegram",
    };
  }

  if (deterministicIntent === "age") {
    return {
      answer: `В базе CV указана дата рождения Артёма: 23.11.1989. На ${derivedFacts.currentDate} ему ${derivedFacts.currentAge} лет.`,
      suggestedCta: null,
    };
  }

  if (deterministicIntent === "birth_date") {
    return {
      answer: "В базе CV указана дата рождения Артёма: 23.11.1989.",
      suggestedCta: null,
    };
  }

  if (deterministicIntent === "telegram") {
    return {
      answer: `Telegram Артёма: ${derivedFacts.contacts.telegram}`,
      suggestedCta: "telegram",
    };
  }

  if (deterministicIntent === "linkedin") {
    return {
      answer: `LinkedIn Артёма: ${derivedFacts.contacts.linkedIn}`,
      suggestedCta: "linkedin",
    };
  }

  if (deterministicIntent === "email") {
    return {
      answer: `Email для связи с Артёмом: ${derivedFacts.contacts.email}`,
      suggestedCta: "email",
    };
  }

  if (deterministicIntent === "location") {
    return {
      answer: "Артём находится в Минске, Беларусь. Приоритетные рынки — СНГ/русскоязычные команды и Европа/remote.",
      suggestedCta: null,
    };
  }

  if (deterministicIntent === "english") {
    return {
      answer: derivedFacts.english,
      suggestedCta: null,
    };
  }

  if (deterministicIntent === "status") {
    return {
      answer: derivedFacts.status,
      suggestedCta: "telegram",
    };
  }

  if (deterministicIntent === "salary") {
    return {
      answer: `${derivedFacts.salaryRange} Это не финальные условия от лица Артёма — детали лучше обсудить напрямую.`,
      suggestedCta: "telegram",
    };
  }

  if (deterministicIntent === "relocation") {
    return {
      answer:
        "По CV-базе релокация обсуждается только лично с Артёмом. Подтверждённые форматы: remote, full-time, project-based/contract и офис в Минске как обсуждаемый вариант.",
      suggestedCta: "telegram",
    };
  }

  if (deterministicIntent === "work_format") {
    return {
      answer: `Форматы работы: ${derivedFacts.workFormats.join(", ")}. Остальные условия лучше согласовать напрямую.`,
      suggestedCta: "telegram",
    };
  }

  if (deterministicIntent === "contacts") {
    return {
      answer: `Да, вакансию лучше обсудить напрямую с Артёмом в Telegram: ${derivedFacts.contacts.telegram}. Также доступны LinkedIn ${derivedFacts.contacts.linkedIn} и email ${derivedFacts.contacts.email}.`,
      suggestedCta: "telegram",
    };
  }

  if (deterministicIntent === "pdf") {
    return {
      answer: `PDF CV доступен по пути ${derivedFacts.contacts.pdf}. На сайте его лучше открывать через кнопку «Скачать PDF».`,
      suggestedCta: null,
    };
  }

  if (deterministicIntent === "programming") {
    return {
      answer:
        "Артём использует AI-инструменты для прототипирования и может работать с простыми техническими задачами, но не позиционируется как классический разработчик. Unity и Cocos у него на базовом уровне; Python/C#/SQL не стоит рассматривать как его основную специализацию.",
      suggestedCta: "telegram",
    };
  }

  if (includesTopic(matches, "analytics_ab_tests")) {
    return {
      answer:
        "Да. В CV-базе есть опыт с аналитикой и A/B-тестами: AppMetrica, devtodev, внутренние дашборды, воронки, retention, time spent, DAU и ARPDAU. В Nerve Games Артём провёл около 10 post-launch итераций с A/B-тестами; дополнительные внутренние отчёты и точные цифры не раскрываются.",
      suggestedCta: null,
    };
  }

  if (includesTopic(matches, "ai_prototyping")) {
    return {
      answer:
        "Да. Артём использует AI-assisted prototyping и vibe-coding для быстрых MVP, Telegram-ботов и AI-инструментов. Примеры из базы: MeowMeals, CombuchAI, LLM-аналитика и продуктовая сборка прототипов; это не нужно позиционировать как classic software engineering.",
      suggestedCta: null,
    };
  }

  if (includesTopic(matches, "tools")) {
    return {
      answer:
        "В базе указаны Confluence, Notion, Asana, Trello, Figma, Miro, Google Docs, Google Sheets и Excel. Также есть опыт с AppMetrica, devtodev и внутренними дашбордами.",
      suggestedCta: null,
    };
  }

  if (includesTopic(matches, "engines")) {
    return {
      answer:
        "По движкам: Unity и Cocos — базовый уровень, NerveEngine — глубокий production experience. В NerveEngine Артём занимался разработкой и улучшением движка, создавал уровни и настраивал игровые сущности.",
      suggestedCta: null,
    };
  }

  if (includesTopic(matches, "mobile_f2p")) {
    return {
      answer:
        "Да. Артём релевантен для mobile F2P-задач: у него есть опыт с Nerve Games, Catch The Candy и Game To Think, FTUE, первыми сессиями, level design, кривой сложности, LiveOps, офферами, наградами, прогрессией, рекламной монетизацией, аналитикой и A/B-тестами.",
      suggestedCta: null,
    };
  }

  if (includesTopic(matches, "ftue_tutorials")) {
    return {
      answer:
        "Да. У Артёма есть опыт с FTUE, туториалами, onboarding и первыми сессиями: в Nerve Games он работал с туториалами и кривой сложности, в Chameleon 42 — с tutorial/onboarding, а в ToBee Live проектировал UX-путь от первого запуска до регулярного использования.",
      suggestedCta: null,
    };
  }

  if (includesTopic(matches, "monetization")) {
    return {
      answer:
        "Да. В CV-базе есть опыт с F2P-монетизацией: офферы, rewards, progression, магазин, battle pass, базовая экономика, interstitial ads и rewarded video. В MeowMeals также заложена монетизация через Telegram Stars.",
      suggestedCta: null,
    };
  }

  if (includesTopic(matches, "chameleon_42")) {
    return {
      answer:
        "В Chameleon 42 Артём работал project-based над Telegram strategy battler / auto-battler. Он собрал документацию с нуля, проектировал PvP/PvE-логику совместно с баланс-геймдизайнером, описывал core/meta loop, игровые сценарии, фичи и LiveOps-события, подготовил карту экранов в Figma и довёл проект до согласованного milestone. Остальные детали проекта под NDA до релиза.",
      suggestedCta: "telegram",
    };
  }

  if (includesTopic(matches, "nerve_games")) {
    return {
      answer:
        "В Nerve Games Артём работал Game Designer / Level Designer в 2024–2025 над Catch The Candy и Game To Think. Он создал и настроил около 100 уровней для Game To Think, собрал кривую сложности для soft launch, создал около 50 уровней для Catch The Candy, провёл около 10 post-launch итераций с A/B-тестами, работал с FTUE, туториалами, магазином и внедрил босс- и бонусные уровни.",
      suggestedCta: null,
    };
  }

  if (includesTopic(matches, "hamster_playducky")) {
    return {
      answer:
        "В 2024 году Артём работал Game Designer / Геймдизайнером в Playducky над под-проектом GameDev Masters в экосистеме Hamster Kombat. Он участвовал в подготовке проекта до beta stage, писал документацию совместно с продюсером, работал с dev- и art-командами до запуска, а после запуска участвовал в LiveOps и описывал фичи, события, награды и прогрессию.",
      suggestedCta: null,
    };
  }

  if (includesTopic(matches, "tobee_live")) {
    return {
      answer:
        "В ToBee Live Артём работал Game Designer над mobile RPG-прототипом с геолокацией и системой LifeBalance. Он участвовал в разработке концепции, прорабатывал core/meta loop, описывал LifeBalance, готовил GDD и мокапы экранов, а также проектировал UX-путь от первого запуска до регулярного использования.",
      suggestedCta: null,
    };
  }

  if (includesTopic(matches, "meowmeals")) {
    return {
      answer:
        "MeowMeals — pet-проект Артёма: Telegram-бот для контроля веса с быстрым логом еды, шагов и тренировок, AI-оценкой еды по тексту/фото, ежедневными рекомендациями и недельными отчётами. Артём проектировал продуктовую логику, AI-интеграцию, onboarding, уведомления, Pro-функции, монетизацию через Telegram Stars и LLM-аналитику проекта.",
      suggestedCta: null,
    };
  }

  if (includesTopic(matches, "combuchai")) {
    return {
      answer:
        "CombuchAI — pet-проект / AI tool для поиска и анализа органического трафика для SaaS-проектов. В нём есть AI workflows, поиск organic traffic entry points, LLM-assisted content generation и работа с контекстом площадок, болями аудитории и нативными CTA.",
      suggestedCta: null,
    };
  }

  if (includesTopic(matches, "generalist_value")) {
    return {
      answer:
        "Как Game Designer Generalist Артём закрывает документацию, FTUE, first sessions, level design, core/meta loop, LiveOps, F2P systems, аналитику, A/B tests и AI-assisted prototyping. Его сильная сторона — доводить идеи до работающих фич через документацию, постановку задач, настройку и итерации по метрикам.",
      suggestedCta: null,
    };
  }

  if (includesTopic(matches, "liveops")) {
    return {
      answer:
        "Да. Артём описывал LiveOps-события в Chameleon 42, участвовал в задачах LiveOps после запуска GameDev Masters в экосистеме Hamster Kombat и работал с post-launch итерациями в Nerve Games.",
      suggestedCta: null,
    };
  }

  if (includesTopic(matches, "telegram_games")) {
    return {
      answer:
        "Да, в базе есть опыт с Telegram games и Telegram products: Chameleon 42, Hamster Kombat / GameDev Masters и собственный Telegram-бот MeowMeals. Это безопасный вывод из перечисленных проектов.",
      suggestedCta: null,
    };
  }

  if (isRiskyProfessionalQuestion && matches.length === 0) {
    return {
      answer:
        "В CV-базе нет подтверждённых данных по этому профессиональному вопросу. Чтобы не додумывать опыт или условия, лучше уточнить детали у Артёма напрямую в Telegram.",
      suggestedCta: "telegram",
    };
  }

  return null;
}

export function buildRelevantContext(message: string): AssistantContextResult {
  const normalizedQuestion = normalizeQuestion(message);
  const knownFacts = detectKnownFacts(message);
  const deterministicIntent = detectDeterministicIntent(message);
  const derivedFacts = buildDerivedFacts();
  const isRiskyProfessionalQuestion = detectRiskyProfessionalQuestion(message);
  const deterministicAnswer = getDeterministicAnswer(
    normalizedQuestion,
    knownFacts,
    deterministicIntent,
    derivedFacts,
    isRiskyProfessionalQuestion,
  );
  const candidateType: AssistantCandidateType = knownFacts.length
    ? "type1_known_or_derived_fact"
    : isRiskyProfessionalQuestion
      ? "type3_no_verified_data"
      : "type2_related_or_general";
  const relevantContext = [
    "## Server-side retrieval context",
    `normalizedQuestion: ${normalizedQuestion || "(empty)"}`,
    `deterministicIntent: ${deterministicIntent ?? "none"}`,
    `candidateType: ${candidateType}`,
    `matchedTopics: ${knownFacts.map((match) => match.topic).join(", ") || "none"}`,
    `riskyProfessionalQuestion: ${isRiskyProfessionalQuestion ? "yes" : "no"}`,
    "",
    "### Backend-derived facts - source of truth for calculations",
    `- birthDate: ${derivedFacts.birthDate}`,
    `- currentDate: ${derivedFacts.currentDate}`,
    `- currentAge: ${derivedFacts.currentAge}`,
    `- location: ${derivedFacts.location}`,
    `- status: ${derivedFacts.status}`,
    `- salaryRange: ${derivedFacts.salaryRange}`,
    `- workFormats: ${derivedFacts.workFormats.join(", ")}`,
    `- english: ${derivedFacts.english}`,
    `- contacts: Telegram ${derivedFacts.contacts.telegram}; LinkedIn ${derivedFacts.contacts.linkedIn}; Email ${derivedFacts.contacts.email}; PDF ${derivedFacts.contacts.pdf}`,
    `- documentedExperience: since ${derivedFacts.documentedExperience.firstCommercialYear}, about ${derivedFacts.documentedExperience.calendarYearsSinceFirstCommercialExperience} calendar years as of ${derivedFacts.currentDate}; ${derivedFacts.documentedExperience.note}`,
    `- protectedTopics: ${derivedFacts.protectedTopics.join("; ")}`,
    "",
    "### Relevant facts and safe derived facts",
    knownFacts.length
      ? knownFacts.map((match) => `- ${match.title}: ${match.context}`).join("\n")
      : "- No direct or derived fact was detected by the rule-based retrieval layer.",
    "",
    "### Routing guidance",
    "- Type 1: if the relevant facts answer the question, answer from them and do not say that the CV database has no data.",
    "- Type 2: if the question is broad but related, answer generally using the relevant facts and suggest Telegram only when personal details are needed.",
    "- Type 3: if there is no verified data and the question is professionally important, do not invent; say that the CV base has no confirmed data and suggest Telegram.",
    "- Do not calculate age, years of experience, years ago, dates or percentages yourself. Use backend-derived facts only.",
  ].join("\n");

  return {
    normalizedQuestion,
    candidateType,
    matchedTopics: knownFacts.map((match) => match.topic),
    deterministicIntent,
    derivedFacts,
    relevantContext,
    deterministicAnswer,
    isRiskyProfessionalQuestion,
  };
}
