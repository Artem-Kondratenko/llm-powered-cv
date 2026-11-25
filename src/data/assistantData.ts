import type { AssistantData } from "../types/cv";
import { cvData } from "./cvData";

export const currentProjectAnswer =
  "Артём работает как Independent Game Designer и с помощью ИИ-инструментов разрабатывает собственную игру ORGANIZM — автобатлер с merge-механикой. Игрок размещает и объединяет одинаковые патчи в Матрице адаптации. Организм автоматически отражает волны вирусов, а мутации усиливают его перед следующими секторами. В раннюю мету входят органеллы (артефакты) и ядра (типы героев со своими способностями). За подробностями лучше написать Артёму в Telegram.";

export const aiPrototypingAnswer =
  "Артём использует ИИ-инструменты для разработки ORGANIZM и быстрой проверки гипотез. Среди других его проектов — MeowMeals (Telegram-бот с AI-оценкой еды) и CombuchAI (инструмент для поиска и анализа органического трафика).";

export const assistantData: AssistantData = {
  identity:
    "Я CV-ассистент Артёма. Отвечаю по его опыту, проектам и стеку. Если нужны подробности, предложу написать ему в Telegram.",
  basicIdentity:
    "Сейчас отвечаю в сокращённом режиме: часть данных временно недоступна из-за связи с сервером. Для деталей лучше написать Артёму в Telegram.",
  quickQuestions: [
    {
      id: "current-project",
      label: "Над чем сейчас работает Артём?",
      isExample: true,
    },
    {
      id: "value",
      label: "Чем Артём полезен как Game Designer Generalist?",
    },
    {
      id: "ftue",
      label: "Какой у него опыт с FTUE и первыми сессиями?",
    },
    {
      id: "chameleon",
      label: "Что он делал в Chameleon 42?",
    },
    {
      id: "liveops",
      label: "Есть ли опыт с LiveOps?",
    },
    {
      id: "monetization",
      label: "Есть ли опыт с монетизацией?",
    },
    {
      id: "ab-tests",
      label: "Работал ли он с A/B-тестами?",
    },
    {
      id: "projects",
      label: "Какие проекты можно посмотреть?",
      isExample: true,
    },
    {
      id: "mobile-f2p",
      label: "Какой у него опыт в mobile F2P?",
      isExample: true,
    },
    {
      id: "ai",
      label: "Как он использует ИИ в работе?",
      isExample: true,
    },
    {
      id: "english",
      label: "Какой у него английский?",
    },
    {
      id: "work-format",
      label: "Какие форматы работы он рассматривает?",
      isExample: true,
    },
    {
      id: "salary",
      label: "Какая зарплата?",
    },
    {
      id: "meowmeals",
      label: "Что такое MeowMeals?",
    },
    {
      id: "combuchai",
      label: "Что такое CombuchAI?",
    },
    {
      id: "contact",
      label: "Как с ним связаться?",
    },
  ],
  answers: {
    "current-project": currentProjectAnswer,
    value:
      "Артём закрывает широкий стек задач Game Designer Generalist для mobile F2P и Telegram games: документация, FTUE, first sessions, level design, core/meta loop, LiveOps, F2P systems, аналитика, A/B tests и AI-assisted prototyping. Его сильная сторона — доводить идеи до работающих фич через документацию, постановку задач, настройку и итерации по метрикам.",
    ftue:
      "У Артёма есть практический опыт с FTUE, туториалами, первыми уровнями и кривой сложности. В Catch The Candy он участвовал в A/B-итерациях после запуска: менял туториалы, магазин, сложность и внедрял босс/бонусные уровни. По итогам тестов улучшались retention, time spent, DAU и ARPDAU.",
    chameleon:
      "В Chameleon 42 Артём работал project-based над Telegram strategy battler / auto-battler. Он собрал проектную документацию с нуля, проектировал PvP/PvE-логику совместно с баланс-геймдизайнером, описывал core/meta loop, игровые сценарии, фичи и LiveOps-события, подготовил карту экранов в Figma и довёл проект до согласованного milestone. Остальные детали проекта под NDA до релиза.",
    liveops:
      "Да. Артём описывал LiveOps-события в Chameleon 42, участвовал в задачах по LiveOps после запуска GameDev Masters в экосистеме Hamster Kombat и работал с пострелизными итерациями в Nerve Games.",
    monetization:
      "Да, в рамках F2P-дизайна он работал с офферами, наградами, прогрессией, магазином и базовой экономикой. В MeowMeals также заложена монетизация через Telegram Stars.",
    "ab-tests":
      "Да. В Nerve Games Артём провёл около 10 итераций после запуска с A/B-тестами: менял туториалы, магазин, кривую сложности и систему босс/бонусных уровней. Публично можно говорить об улучшении retention и DAU примерно на 10-15% по удачным итерациям, а также о retention 40/20/10 для Short/Mid/Long по итогам тестов туториала и кривой сложности; дополнительные внутренние цифры не раскрываются.",
    ai: aiPrototypingAnswer,
    projects:
      "В разделе «Проекты» есть карточка ORGANIZM с визуальными макетами, а в Proof-of-work можно открыть игровой прототип. Также можно посмотреть Catch The Candy и Game To Think в Google Play, GameDev Masters / Gamedev Heroes в экосистеме Hamster Kombat и Telegram-бот MeowMeals: https://t.me/meow_meals_bot.",
    "mobile-f2p":
      "Да. Его опыт хорошо ложится на mobile F2P: level design, FTUE, первые сессии, LiveOps, прогрессия, награды, офферы, магазин, A/B-тесты и итерации по retention, time spent, DAU и ARPDAU.",
    english:
      "Артём уверенно читает документацию и профессиональные материалы на английском. Разговорный английский у него базовый; для роли с активными созвонами лучше уточнить детали напрямую.",
    "work-format":
      "Артём открыт к full-time, project-based/contract и remote. Также можно обсуждать офис в Минске; остальные условия лучше согласовать напрямую.",
    salary:
      "Зарплата зависит от формата и задач. В резюме указан ориентир от $2000 в месяц, но это не финальные условия — детали лучше обсудить напрямую с Артёмом.",
    meowmeals:
      "MeowMeals — pet-проект Артёма: Telegram-бот для контроля веса с быстрым логом еды, шагов и тренировок, AI-оценкой еды по тексту/фото, ежедневными рекомендациями и недельными отчётами. Артём проектировал продуктовую логику, onboarding, уведомления, Pro-функции, монетизацию через Telegram Stars и AI-аналитику проекта.",
    combuchai:
      "CombuchAI — pet-проект / AI tool для поиска и анализа органического трафика для SaaS-проектов. В нём есть AI workflows, поиск organic traffic entry points, LLM-assisted content generation и работа с контекстом площадок, болями аудитории и нативными CTA.",
    contact: `Лучше всего написать Артёму в Telegram: ${cvData.contacts.telegram}`,
  },
  fallbackAnswer:
    "За подробностями по этому вопросу лучше написать Артёму в Telegram.",
};
