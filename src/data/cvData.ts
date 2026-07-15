import type { CvData } from "../types/cv";

const catchTheCandyImages = [
  {
    src: "/images/projects/catch-the-candy/01.webp",
    thumbSrc: "/images/projects/catch-the-candy/thumbs/01.webp",
    alt: "Catch The Candy gameplay screenshot 1",
  },
  {
    src: "/images/projects/catch-the-candy/02.webp",
    thumbSrc: "/images/projects/catch-the-candy/thumbs/02.webp",
    alt: "Catch The Candy gameplay screenshot 2",
  },
  {
    src: "/images/projects/catch-the-candy/03.webp",
    thumbSrc: "/images/projects/catch-the-candy/thumbs/03.webp",
    alt: "Catch The Candy gameplay screenshot 3",
  },
  {
    src: "/images/projects/catch-the-candy/04.webp",
    thumbSrc: "/images/projects/catch-the-candy/thumbs/04.webp",
    alt: "Catch The Candy gameplay screenshot 4",
  },
];

const gameToThinkImages = [
  {
    src: "/images/projects/game-to-think/01.webp",
    thumbSrc: "/images/projects/game-to-think/thumbs/01.webp",
    alt: "Game To Think gameplay screenshot 1",
  },
  {
    src: "/images/projects/game-to-think/02.webp",
    thumbSrc: "/images/projects/game-to-think/thumbs/02.webp",
    alt: "Game To Think gameplay screenshot 2",
  },
  {
    src: "/images/projects/game-to-think/03.webp",
    thumbSrc: "/images/projects/game-to-think/thumbs/03.webp",
    alt: "Game To Think gameplay screenshot 3",
  },
  {
    src: "/images/projects/game-to-think/04.webp",
    thumbSrc: "/images/projects/game-to-think/thumbs/04.webp",
    alt: "Game To Think gameplay screenshot 4",
  },
];

const hamsterCombatImages = [
  {
    src: "/images/projects/hamster-combat/01.webp",
    thumbSrc: "/images/projects/hamster-combat/thumbs/01.webp",
    alt: "Hamster Kombat GameDev Masters screenshot 1",
  },
  {
    src: "/images/projects/hamster-combat/02.webp",
    thumbSrc: "/images/projects/hamster-combat/thumbs/02.webp",
    alt: "Hamster Kombat GameDev Masters screenshot 2",
  },
  {
    src: "/images/projects/hamster-combat/03.webp",
    thumbSrc: "/images/projects/hamster-combat/thumbs/03.webp",
    alt: "Hamster Kombat GameDev Masters screenshot 3",
  },
  {
    src: "/images/projects/hamster-combat/04.webp",
    thumbSrc: "/images/projects/hamster-combat/thumbs/04.webp",
    alt: "Hamster Kombat GameDev Masters screenshot 4",
  },
];

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
      "Game Designer Generalist для mobile F2P и Telegram games, который умеет не только описывать идеи, но и доводить их до работающей фичи. Основной опыт - мобильные и Telegram-игры: геймдизайн документация полного цикла, lvl-design, FTUE, core/meta loop, PvP/PvE, LiveOps, офферы, награды, прогрессия и, как результат, монетизация.",
      "Работал с A/B-тестами, аналитикой и доработками на пост-релизе: усиливал туториалы, менял кривую сложности уровней, модернизировал магазин, создавал дополнительные системы для увеличения вовлечения и удержания игрока.",
      "Активно использую AI-инструменты для прототипирования и быстрой проверки гипотез. Самостоятельно сделал и развиваю умного TG-бота MeowMeals и разрабатываю CombuchAI для поиска точек органического трафика.",
    ],
  },
  contacts: {
    telegram: "https://t.me/Artem_Kondratenko",
    linkedIn: "https://www.linkedin.com/in/artem-kondratenko-game-designer/",
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
      period: "2025 · проектная занятость",
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
      company: "Playducky",
      role: "Game Designer / Геймдизайнер",
      period: "2024",
      project: "Проект в экосистеме Hamster Kombat: GameDev Masters / Gamedev Heroes.",
      bullets: [
        "На Артёме была разработка под-проекта GameDev Masters.",
        "Участвовал в подготовке проекта до beta stage.",
        "Писал документацию совместно с продюсером.",
        "Работал с dev- и art-командами до запуска.",
        "Участвовал в задачах по LiveOps после запуска.",
        "Описывал фичи, события, награды и прогрессию.",
      ],
      links: [
        {
          label: "TMA",
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
      images: catchTheCandyImages,
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
      images: gameToThinkImages,
    },
    {
      title: "Hamster Kombat: GameDev Masters",
      type: "Telegram game",
      focus: "documentation, features, events, rewards, progression, beta stage, LiveOps.",
      description:
        "Участвовал в подготовке под-проекта GameDev Masters в экосистеме Hamster Kombat до beta stage: документация, события, фичи, награды, прогрессия, взаимодействие с dev/art-командами и LiveOps после запуска.",
      link: {
        label: "TMA",
        href: "https://t.me/hamster_kombat_bot?profile",
      },
      images: hamsterCombatImages,
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
        "AI-assisted product building / vibe-coding без позиционирования как классическая backend/frontend-разработка",
      ],
      analyticsNote:
        "Создана система аналитики, которая на базе LLM обрабатывает данные проекта и предоставляет готовые отчёты по нужным метрикам. Это помогает быстрее видеть поведение пользователей, проблемные места и точки для продуктовых итераций.",
    },
    {
      title: "CombuchAI",
      type: "Pet-проект · AI tool · organic traffic research",
      description:
        "SaaS-like AI-инструмент для поиска и анализа органического трафика для SaaS-проектов.",
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
        "NerveEngine - deep dive",
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
        "Vibe-coding",
        "AI product workflows",
        "Telegram bots",
        "Rapid MVPs",
		"Codex",
		"Claude",
		"Replit",
      ],
    },
  ],
};
