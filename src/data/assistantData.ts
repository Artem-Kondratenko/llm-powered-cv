import type { AssistantData } from "../types/cv";

export const assistantData: AssistantData = {
  identity:
    "Я CV-ассистент Артёма. Отвечаю по его опыту, проектам, стеку и pet-проектам. Если вопрос лучше обсудить лично — предложу написать ему в Telegram или LinkedIn.",
  basicIdentity:
    "Сейчас отвечаю в сокращённом режиме: часть данных временно недоступна из-за связи с сервером. Для деталей лучше написать Артёму в Telegram.",
  quickQuestions: [
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
      id: "ai",
      label: "Что он умеет в AI-прототипировании?",
    },
    {
      id: "projects",
      label: "Какие проекты можно посмотреть?",
    },
    {
      id: "mobile-f2p",
      label: "Подходит ли он для mobile F2P?",
    },
    {
      id: "english",
      label: "Какой у него английский?",
    },
    {
      id: "work-format",
      label: "Какие форматы работы рассматривает?",
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
      "Да. В Nerve Games Артём провёл около 10 итераций после запуска с A/B-тестами: менял туториалы, магазин, кривую сложности и систему босс/бонусных уровней. После тестов улучшались retention, time spent, DAU и ARPDAU, но точные проценты роста в CV-базе не указаны.",
    ai: "Артём активно использует LLM, AI-assisted prototyping и vibe-coding для быстрых MVP и продуктовых проверок. Среди pet-проектов — MeowMeals, Telegram-бот с AI-оценкой еды и аналитической обвязкой на базе LLM, а также CombuchAI — SaaS-like AI tool для поиска и анализа органического трафика.",
    projects:
      "Можно посмотреть Catch The Candy и Game To Think в Google Play, GameDev Masters / Gamedev Heroes в экосистеме Hamster Kombat, а также pet-проект MeowMeals: https://t.me/meow_meals_bot. CombuchAI пока описан как AI-инструмент для organic traffic research.",
    "mobile-f2p":
      "Да. Его опыт хорошо ложится на mobile F2P: level design, FTUE, первые сессии, LiveOps, прогрессия, награды, офферы, магазин, A/B-тесты и итерации по retention, time spent, DAU и ARPDAU.",
    english:
      "В CV-базе указано, что Артём уверенно читает документацию и статьи по теме. Разговорный английский — базовый; не стоит приукрашивать его до fluent или intermediate speaking.",
    "work-format":
      "Артём открыт к full-time, project-based/contract и remote. Также можно обсуждать офис в Минске; остальные условия лучше согласовать напрямую.",
    salary:
      "Зарплата зависит от формата и задач. В CV-базе указан ориентир от $2000 в месяц, но это не финальные условия — детали лучше обсудить напрямую с Артёмом.",
    meowmeals:
      "MeowMeals — pet-проект Артёма: Telegram-бот для контроля веса с быстрым логом еды, шагов и тренировок, AI-оценкой еды по тексту/фото, ежедневными рекомендациями и недельными отчётами. Артём проектировал продуктовую логику, onboarding, уведомления, Pro-функции, монетизацию через Telegram Stars и LLM-аналитику проекта.",
    combuchai:
      "CombuchAI — pet-проект / AI tool для поиска и анализа органического трафика для SaaS-проектов. В нём есть AI workflows, поиск organic traffic entry points, LLM-assisted content generation и работа с контекстом площадок, болями аудитории и нативными CTA.",
    contact:
      "Лучше всего написать Артёму в Telegram: https://t.me/Artem_Kondratenko. Также можно открыть LinkedIn: https://www.linkedin.com/in/artem-kondratenko231189/ или написать на email: Anderson892311@gmail.com.",
  },
  fallbackAnswer:
    "В базовой CV-базе нет точного ответа на этот вопрос. Чтобы не додумывать опыт, метрики или условия, лучше уточнить у Артёма напрямую в Telegram или LinkedIn.",
};
