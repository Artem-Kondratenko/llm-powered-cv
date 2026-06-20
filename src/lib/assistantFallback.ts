import type { AssistantSuggestedCta } from "../types/cv";

export type AssistantFallbackAnswer = {
  answer: string;
  suggestedCta: AssistantSuggestedCta;
};

type FallbackRule = {
  match: (normalizedQuestion: string) => boolean;
  answer: string | ((normalizedQuestion: string) => string);
  suggestedCta: AssistantSuggestedCta;
};

const birthDate = {
  day: 23,
  monthIndex: 10,
  year: 1989,
};

const firstCommercialExperienceYear = 2022;

const eventYears = [
  { aliases: ["chameleon", "хамелеон", "42"], label: "Chameleon 42", year: 2025 },
  { aliases: ["nerve games", "нерв", "catch the candy", "game to think"], label: "Nerve Games", year: 2024 },
  { aliases: ["hamster", "хамстер", "kombat", "combat", "game dev masters", "gamedev masters", "gamedev heroes", "playducky"], label: "Hamster Kombat / GameDev Masters / Playducky", year: 2024 },
  { aliases: ["tobee", "to bee", "lifebalance", "life balance"], label: "ToBee Live", year: 2022 },
  { aliases: ["meowmeals", "meow meals", "meow", "мяу"], label: "MeowMeals", year: 2025 },
  { aliases: ["combuchai", "комбуч"], label: "CombuchAI", year: 2025 },
];

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

function calculateAge(now = new Date()) {
  let age = now.getFullYear() - birthDate.year;
  const birthdayThisYear = new Date(now.getFullYear(), birthDate.monthIndex, birthDate.day);

  if (now < birthdayThisYear) {
    age -= 1;
  }

  return age;
}

function currentIsoDate(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function calendarYearsSince(year: number, now = new Date()) {
  return Math.max(0, now.getFullYear() - year);
}

function findEventYear(question: string) {
  return eventYears.find((event) => hasAny(question, event.aliases)) ?? null;
}

const fallbackRules: FallbackRule[] = [
  {
    match: (question) => hasAny(question, ["сколько лет назад", "как давно", "когда было", "в каком году", "years ago"]) && Boolean(findEventYear(question)),
    answer: (question) => {
      const event = findEventYear(question);
      if (!event) {
        return "В CV-базе нет точного года для этого события. Лучше уточнить у Артёма напрямую.";
      }

      const yearsAgo = calendarYearsSince(event.year);
      return `В базе CV для ${event.label} указан ${event.year} год. На ${currentIsoDate()} это примерно ${yearsAgo} ${yearsAgo === 1 ? "год" : yearsAgo >= 2 && yearsAgo <= 4 ? "года" : "лет"} назад; точный месяц в базе не указан.`;
    },
    suggestedCta: null,
  },
  {
    match: (question) => hasAny(question, ["стаж", "лет опыта", "years of experience", "experience years", "сколько опыта", "как давно в геймдизайне", "длительность работы"]),
    answer: () =>
      `В базе подтверждён коммерческий и project-based опыт Артёма с ${firstCommercialExperienceYear} года. На ${currentIsoDate()} это около ${calendarYearsSince(firstCommercialExperienceYear)} лет календарного периода, но месяцы и пересечения проектов в базе не детализированы, поэтому точный стаж до месяца лучше не додумывать.`,
    suggestedCta: null,
  },
  {
    match: (question) => hasAny(question, ["статус", "актуальн", "ищет работу", "открыт", "available", "open to"]),
    answer:
      "Артём открыт к предложениям, если роль и проект подходят по задачам. Точную availability и дату выхода нельзя обещать от его лица — это лучше уточнить напрямую.",
    suggestedCta: "telegram",
  },
  {
    match: (question) => hasAny(question, ["готов выйти", "выйти завтра", "завтра", "availability", "доступен", "доступность", "дата выхода"]),
    answer:
      "В CV-базе нет подтверждённой даты доступности или обещания, что Артём готов выйти завтра. Такие условия лучше уточнить у Артёма напрямую в Telegram.",
    suggestedCta: "telegram",
  },
  {
    match: (question) =>
      hasAny(question, ["nda", "детал", "секрет", "раскрой", "закрыт"]) &&
      hasAny(question, ["chameleon", "хамелеон", "42", "liveops", "reward", "награ", "метрик", "meowmeals"]),
    answer:
      "NDA-детали Chameleon 42, LiveOps-событий, reward-систем и части пользовательской статистики публично не раскрываются. В базе можно говорить только о роли Артёма, зоне ответственности и общих типах задач; конкретику лучше уточнить напрямую.",
    suggestedCta: "telegram",
  },
  {
    match: (question) =>
      hasAny(question, ["внутрен", "абсолютн", "отчет", "отчеты", "разбивк", "nda", "секрет"]) &&
      hasAny(question, ["метрик", "цифр", "retention", "ретенш", "dau", "arpdau", "chameleon", "хамелеон", "процент"]),
    answer:
      "Точные внутренние метрики и дополнительные проектные цифры в публичной CV-базе не раскрываются. Лучше уточнить у Артёма напрямую, что можно обсуждать в рамках конкретной вакансии.",
    suggestedCta: "telegram",
  },
  {
    match: (question) => hasAny(question, ["сколько лет", "возраст", "age"]),
    answer: () => `В базе CV указана дата рождения Артёма: 23.11.1989. На ${currentIsoDate()} ему ${calculateAge()} лет.`,
    suggestedCta: null,
  },
  {
    match: (question) => hasAny(question, ["когда родился", "дата рождения", "день рождения", "родился"]),
    answer: "В базе CV указана дата рождения Артёма: 23.11.1989.",
    suggestedCta: null,
  },
  {
    match: (question) => hasAny(question, ["telegram", "телеграм"]) && !hasAny(question, ["telegram games", "telegram game", "telegram products", "игр", "продукт", "bot", "бот"]),
    answer: "Telegram Артёма: https://t.me/Artem_Kondratenko",
    suggestedCta: "telegram",
  },
  {
    match: (question) => hasAny(question, ["linkedin", "линкедин", "linked in"]),
    answer: "LinkedIn Артёма: https://www.linkedin.com/in/artem-kondratenko231189/",
    suggestedCta: "linkedin",
  },
  {
    match: (question) => hasAny(question, ["email", "почт", "e mail", "mail"]),
    answer: "Email для связи с Артёмом: Anderson892311@gmail.com",
    suggestedCta: "email",
  },
  {
    match: (question) => hasAny(question, ["pdf", "резюме", "скачать", "download"]),
    answer: "PDF CV доступен по пути /files/Artem_Kondratenko_GameDesigner_CV.pdf. На сайте его лучше открывать через кнопку «Скачать PDF».",
    suggestedCta: null,
  },
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
    match: (question) => hasAny(question, ["nerve games", "нерв", "catch the candy", "game to think"]),
    answer:
      "В Nerve Games Артём работал Game Designer / Level Designer в 2024–2025 над Catch The Candy и Game To Think. Он создал и настроил около 100 уровней для Game To Think, собрал кривую сложности для soft launch, создал около 50 уровней для Catch The Candy, провёл около 10 post-launch итераций с A/B-тестами, работал с FTUE, туториалами, магазином и внедрил босс- и бонусные уровни.",
    suggestedCta: null,
  },
  {
    match: (question) =>
      hasAny(question, ["процент", "%", "точн", "retention", "ретенш", "рост"]) &&
      hasAny(question, ["retention", "ретенш", "time spent", "dau", "arpdau", "a/b", "ab", "метрик"]),
    answer:
      "В CV-базе по Nerve Games разрешено говорить об улучшении retention и DAU примерно на 10-15% по удачным итерациям, а также о retention 40/20/10 для Short/Mid/Long по итогам тестов туториала и кривой сложности. Дополнительные точные проценты, абсолютные значения и внутренние отчёты не раскрываются.",
    suggestedCta: "telegram",
  },
  {
    match: (question) => hasAny(question, ["точн", "метрик", "цифр"]) && hasAny(question, ["метрик", "цифр", "процент"]),
    answer:
      "Публично можно говорить только о разрешённых метриках из CV-базы. Дополнительные точные проценты, абсолютные значения, внутренние отчёты и разбивку лучше не додумывать и уточнять у Артёма напрямую.",
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
    match: (question) => hasAny(question, ["ftue", "tutorial", "туториал", "онбординг", "onboarding", "первые сесс", "first session", "первый запуск"]),
    answer:
      "Да. У Артёма есть опыт с FTUE, туториалами, onboarding и первыми сессиями: в Nerve Games он работал с туториалами и кривой сложности, в Chameleon 42 — с tutorial/onboarding, а в ToBee Live проектировал UX-путь от первого запуска до регулярного использования.",
    suggestedCta: null,
  },
  {
    match: (question) =>
      hasAny(question, ["монетизац", "economy", "эконом", "offer", "оффер", "battle pass", "магазин", "shop", "rewarded", "ads", "реклам", "stars", "telegram stars"]),
    answer:
      "Да. В CV-базе есть опыт с F2P-монетизацией: офферы, rewards, progression, магазин, battle pass, базовая экономика, interstitial ads и rewarded video. В MeowMeals также заложена монетизация через Telegram Stars.",
    suggestedCta: null,
  },
  {
    match: (question) => hasAny(question, ["аналитик", "a b", "ab", "a/b", "тест", "метрик", "retention", "ретенш", "time spent", "dau", "arpdau", "appmetrica", "devtodev", "воронк"]),
    answer:
      "Да. В CV-базе есть опыт с аналитикой и A/B-тестами: AppMetrica, devtodev, внутренние дашборды, воронки, retention, time spent, DAU и ARPDAU. В Nerve Games Артём провёл около 10 post-launch итераций с A/B-тестами; дополнительные внутренние отчёты и точные цифры не раскрываются.",
    suggestedCta: null,
  },
  {
    match: (question) => hasAny(question, ["ai", "llm", "gemini", "openai", "прототип", "prototype", "vibe", "вайб", "mvp", "ai assisted", "искусственн"]),
    answer:
      "Да. Артём использует AI-assisted prototyping и vibe-coding для быстрых MVP, Telegram-ботов и AI-инструментов. Примеры из базы: MeowMeals, CombuchAI, LLM-аналитика и продуктовая сборка прототипов; это не нужно позиционировать как classic software engineering.",
    suggestedCta: null,
  },
  {
    match: (question) => hasAny(question, ["tools", "инструмент", "confluence", "notion", "asana", "trello", "figma", "miro", "google docs", "google sheets", "excel"]),
    answer:
      "В базе указаны Confluence, Notion, Asana, Trello, Figma, Miro, Google Docs, Google Sheets и Excel. Также есть опыт с AppMetrica, devtodev и внутренними дашбордами.",
    suggestedCta: null,
  },
  {
    match: (question) => hasAny(question, ["engine", "движк", "unity", "cocos", "nerveengine", "nerve engine"]),
    answer:
      "По движкам: Unity и Cocos — базовый уровень, NerveEngine — глубокий production experience. В NerveEngine Артём занимался разработкой и улучшением движка, создавал уровни и настраивал игровые сущности.",
    suggestedCta: null,
  },
  {
    match: (question) =>
      hasAny(question, ["mobile f2p", "f2p", "мобил", "mobile"]) &&
      hasAny(question, ["подходит", "роль", "ваканси", "позици", "найм"]),
    answer:
      "Да, по CV-базе Артём релевантен для mobile F2P-задач: у него есть опыт с Nerve Games, Catch The Candy и Game To Think, FTUE, первыми сессиями, level design, кривой сложности, LiveOps, офферами, наградами, прогрессией, рекламной монетизацией, аналитикой и A/B-тестами.",
    suggestedCta: null,
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
    match: (question) => hasAny(question, ["релокац", "relocation", "переезд", "переехать", "relocate"]),
    answer:
      "По CV-базе релокация обсуждается только лично с Артёмом. Подтверждённые форматы: remote, full-time, project-based/contract и офис в Минске как обсуждаемый вариант.",
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
        answer: typeof rule.answer === "function" ? rule.answer(normalizedQuestion) : rule.answer,
        suggestedCta: rule.suggestedCta,
      }
    : null;
}
