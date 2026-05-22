import type { CvData } from "../types/cv";

export const cvData: CvData = {
  profile: {
    name: "Артём Кондратенко",
    role: "Game Designer Generalist",
    photoPath: "/images/artem-photo.jpg",
    tags: [
      "Mobile Games",
      "Telegram Games",
      "FTUE",
      "Level Design",
      "LiveOps",
      "F2P Systems",
      "AI Prototyping",
    ],
    pitch: [
      "Game Designer Generalist, который умеет не только описывать идеи, но и доводить их до работающей фичи. Основной опыт - мобильные и Telegram-игры: lvl-design, FTUE, core/meta loop, PvP/PvE, LiveOps, офферы, награды, прогрессия и, как результат, монетизация.",
      "Работал с A/B-тестами, аналитикой и доработками после релиза: менял туториалы, кривую сложности, магазин, внедрил систему босс/бонусных уровней. Хорошо чувствую первые сессии и короткие игровые циклы.",
      "Активно использую AI-инструменты для прототипирования: самостоятельно сделал TG-бота MeowMeals и разрабатываю CombuchAI для поиска точек органического трафика.",
    ],
  },
  contacts: {
    telegram: "https://t.me/Artem_Kondratenko",
    linkedIn: "https://www.linkedin.com/in/artem-kondratenko231189/",
    email: "Anderson892311@gmail.com",
    pdfPath: "/files/Artem_Kondratenko_GameDesigner_CV.pdf",
  },
  skills: [
    {
      title: "Game Design Documentation",
      description:
        "Концепты, GDD, feature docs, UX-flow, описание механик, постановка задач для dev/art-команд.",
    },
    {
      title: "FTUE & First Sessions",
      description:
        "Туториалы, первые уровни, onboarding, вывод игрока на core loop, снижение отвалов в первых сессиях.",
    },
    {
      title: "Level Design",
      description:
        "Структура уровней, темп, кривая сложности, обучение через геймплей, итерации по метрикам.",
    },
    {
      title: "F2P Systems",
      description:
        "Прогрессия, награды, офферы, battle pass, апгрейды, монетизация и базовая экономика.",
    },
    {
      title: "LiveOps",
      description:
        "Ивенты, сезонные активности, вовлекающие механики, реварды и работа с проектом после запуска.",
    },
    {
      title: "Analytics & A/B Tests",
      description:
        "AppMetrica, devtodev, внутренние дашборды, Google Sheets/Excel, воронки, retention, time spent, ARPDAU.",
    },
    {
      title: "AI Prototyping",
      description:
        "Vibe-coding, LLM-assisted prototyping, Telegram-боты, AI-инструменты, быстрые MVP для проверки гипотез.",
    },
  ],
  experience: [
    {
      company: "Chameleon 42",
      role: "Game Designer Generalist / Game & Product Owner по фичам",
      period: "2025 · project-based",
      project: "Telegram-баттлер в духе Disciples 2.",
      bullets: [
        "Собрал проектную документацию с нуля.",
        "Проектировал PvP/PvE-логику совместно с баланс-геймдизайнером.",
        "Описывал core/meta loop, игровые сценарии, фичи и LiveOps-события.",
        "Выступал в роли game/product owner по части фич: формулировал логику, приоритеты, документацию и задачи для команды.",
        "Подготовил прототип карты экранов в Figma.",
        "Довёл проект до заранее согласованного milestone.",
      ],
    },
    {
      company: "Nerve Games",
      role: "Game Designer / Level Designer",
      period: "2024–2025",
      project: "Catch The Candy, Game To Think",
      bullets: [
        "Создал и настроил около 100 уровней для Game To Think.",
        "Собрал кривую сложности для soft launch.",
        "Создал и настроил около 50 уровней для Catch The Candy.",
        "Провёл около 10 итераций после запуска с A/B-тестами.",
        "Работал с FTUE, туториалами, магазином, кривой сложности.",
        "Внедрил систему босс- и бонусных уровней.",
        "После тестов улучшались retention, time spent, DAU и ARPDAU.",
      ],
      links: [
        {
          label: "Catch The Candy",
          href: "https://play.google.com/store/apps/details?id=com.hc.cut.arcade.catchthecandy",
        },
        {
          label: "Game To Think",
          href: "https://play.google.com/store/apps/details?id=com.nerve.gametothink",
        },
      ],
    },
    {
      company: "Hamster Combat Gamedev Heroes",
      role: "Game Designer",
      period: "project-based",
      project: "Telegram game / gamedev-themed season.",
      bullets: [
        "Участвовал в подготовке проекта до beta stage.",
        "Писал документацию совместно с продюсером.",
        "Работал с dev- и art-командами до запуска.",
        "Участвовал в задачах по LiveOps после запуска.",
        "Описывал фичи, события, награды и прогрессию.",
      ],
      links: [
        {
          label: "Telegram bot",
          href: "https://t.me/hamster_kombat_bot?profile",
        },
      ],
    },
    {
      company: "ToBee Live",
      role: "Game Designer",
      period: "2022–2024",
      project: "Mobile RPG-прототип с геолокацией и системой LifeBalance.",
      bullets: [
        "Участвовал в разработке общей концепции.",
        "Прорабатывал core loop и meta loop.",
        "Описывал систему LifeBalance: как действия игрока в реальной жизни конвертируются в игровой прогресс.",
        "Готовил GDD и мокапы экранов.",
        "Участвовал в проектировании UX-пути от первого запуска до регулярного использования.",
      ],
    },
  ],
  projects: [
    {
      title: "Catch The Candy",
      type: "Mobile 2D platformer-puzzle",
      focus: "level design, post-launch iterations, A/B tests, retention.",
      description:
        "Создавал и настраивал уровни, работал с кривой сложности, туториалами, магазином и доработками после запуска. Проводил итерации на основе A/B-тестов и продуктовых метрик.",
      link: {
        label: "Google Play",
        href: "https://play.google.com/store/apps/details?id=com.hc.cut.arcade.catchthecandy",
      },
    },
    {
      title: "Game To Think",
      type: "Mobile casual puzzle with meta",
      focus: "level design, difficulty curve, soft launch preparation, FTUE.",
      description:
        "Создал около 100 уровней, подготовил кривую сложности для soft launch, работал с первыми сессиями и понятным введением игрока в механику.",
      link: {
        label: "Google Play",
        href: "https://play.google.com/store/apps/details?id=com.nerve.gametothink",
      },
    },
    {
      title: "Hamster Combat Gamedev Heroes",
      type: "Telegram game",
      focus: "documentation, events, progression, rewards, beta stage, partial LiveOps.",
      description:
        "Участвовал в подготовке gamedev-themed Telegram-проекта до beta stage: документация, события, фичи, награды, прогрессия, взаимодействие с dev/art-командами.",
      link: {
        label: "TMA",
        href: "https://t.me/hamster_kombat_bot?profile",
      },
    },
    {
      title: "MeowMeals",
      type: "Pet-проект · Telegram bot · AI-assisted product",
      description:
        "Telegram-бот для контроля веса: быстрый лог еды, шагов и тренировок, AI-оценка еды по тексту/фото, ежедневные рекомендации и недельные отчёты.",
      link: {
        label: "Telegram bot",
        href: "https://t.me/meow_meals_bot",
      },
      demonstrates: [
        "продуктовая логика Telegram-бота",
        "AI-интеграция в пользовательский сценарий",
        "работа с ежедневными привычками и retention",
        "монетизация через Telegram Stars",
        "проектирование onboarding, уведомлений и Pro-функций",
        "аналитическая обвязка проекта",
      ],
      analyticsNote:
        "Создана система аналитики, которая на базе LLM обрабатывает данные проекта и предоставляет готовые отчёты по нужным метрикам. Это помогает быстрее видеть поведение пользователей, проблемные места и точки для продуктовых итераций.",
    },
    {
      title: "CombuchAI",
      type: "Pet-проект · AI tool · organic traffic research",
      description:
        "AI-инструмент для поиска точек органического трафика и подготовки нативных входов в обсуждения.",
      demonstrates: [
        "AI workflows",
        "поиск organic traffic entry points",
        "LLM-assisted content generation",
        "проектирование SaaS-like инструмента",
        "работа с контекстом площадок, болями аудитории и нативными CTA",
      ],
    },
  ],
  stackGroups: [
    {
      title: "Game Design",
      items: [
        "GDD",
        "feature docs",
        "UX-flow",
        "core/meta loop",
        "FTUE",
        "first sessions",
        "level design",
        "LiveOps",
        "progression",
        "rewards",
        "offers",
        "monetization",
        "PvP/PvE",
      ],
    },
    {
      title: "Tools",
      items: [
        "Confluence",
        "Notion",
        "Asana",
        "Trello",
        "Figma",
        "Miro",
        "Google Docs",
        "Google Sheets",
        "Excel",
      ],
    },
    {
      title: "Engines & Configs",
      items: [
        "Unity - basic",
        "Cocos - basic",
        "NerveEngine - deep production experience",
        "Google Sheets/Excel configs",
      ],
    },
    {
      title: "Analytics",
      items: [
        "AppMetrica",
        "devtodev",
        "internal dashboards",
        "A/B testing",
        "funnels",
        "retention",
        "time spent",
        "DAU",
        "ARPDAU",
      ],
    },
    {
      title: "AI / Prototyping",
      items: [
        "LLM-assisted prototyping",
        "vibe-coding",
        "AI product workflows",
        "Telegram bots",
        "rapid MVPs",
      ],
    },
  ],
  gamePlaceholder: {
    title: "Proof-of-work: мини-игра",
    teaser:
      "Здесь появится короткая карточная мини-игра про геймдев: soft launch, дедлайны, фичекрип, retention и попытку выжить до LiveOps. Да, первый забег, скорее всего, будет больно знакомым.",
    ctaLabel: "Скоро",
  },
};
