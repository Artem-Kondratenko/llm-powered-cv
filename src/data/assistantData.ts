import type { AssistantData } from "../types/cv";

export const assistantData: AssistantData = {
  identity:
    "Я CV-ассистент Артёма. Отвечаю по его опыту, проектам, стеку и pet-проектам. Если вопрос лучше обсудить лично — предложу написать ему в Telegram или LinkedIn.",
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
      id: "contact",
      label: "Как с ним связаться?",
    },
  ],
  answers: {
    value:
      "Артём закрывает широкий стек задач Game Designer Generalist: документация, core/meta loop, FTUE, level design, PvP/PvE, LiveOps, прогрессия, офферы, награды и базовая монетизация. Его сильная сторона — не только описывать идеи, но и доводить их до работающих фич через документацию, постановку задач, настройку и итерации по метрикам.",
    ftue:
      "У Артёма есть практический опыт с FTUE, туториалами, первыми уровнями и кривой сложности. В Catch The Candy он участвовал в A/B-итерациях после запуска: менял туториалы, магазин, сложность и внедрял босс/бонусные уровни. По итогам тестов улучшались retention, time spent, DAU и ARPDAU.",
    chameleon:
      "В Chameleon 42 Артём работал над Telegram-баттлером в духе Disciples 2. Он собрал проектную документацию с нуля, описывал core/meta loop, PvP/PvE-логику, фичи и LiveOps-события, подготовил прототип карты экранов в Figma и выступал как game/product owner по части фич.",
    liveops:
      "Да. Артём описывал LiveOps-события в Chameleon 42, участвовал в задачах по LiveOps после запуска Hamster Combat Gamedev Heroes и работал с пострелизными итерациями в Nerve Games.",
    monetization:
      "Да, в рамках F2P-дизайна он работал с офферами, наградами, прогрессией, магазином и базовой экономикой. В MeowMeals также заложена монетизация через Telegram Stars.",
    "ab-tests":
      "Да. В Nerve Games Артём провёл около 10 итераций после запуска с A/B-тестами: менял туториалы, магазин, кривую сложности и систему босс/бонусных уровней, отслеживая продуктовые метрики.",
    ai: "Артём активно использует AI-инструменты и vibe-coding для прототипирования. Среди pet-проектов — MeowMeals, Telegram-бот с AI-оценкой еды и аналитической обвязкой на базе LLM, а также CombuchAI — инструмент для поиска точек органического трафика и подготовки нативных входов в обсуждения.",
    projects:
      "Можно посмотреть Catch The Candy и Game To Think в Google Play, Hamster Combat Gamedev Heroes в Telegram, а также pet-проект MeowMeals: https://t.me/meow_meals_bot. CombuchAI пока описан как AI-инструмент в разработке.",
    "mobile-f2p":
      "Да. Его опыт хорошо ложится на mobile F2P: level design, FTUE, первые сессии, LiveOps, прогрессия, награды, офферы, магазин, A/B-тесты и итерации по retention, time spent, DAU и ARPDAU.",
    contact:
      "Лучше всего написать Артёму в Telegram: https://t.me/Artem_Kondratenko. Также можно открыть LinkedIn: https://www.linkedin.com/in/artem-kondratenko231189/ или написать на email: Anderson892311@gmail.com.",
  },
  fallbackAnswer:
    "В текущей CV-базе нет точного ответа на этот вопрос. Лучше уточнить у Артёма напрямую в Telegram или LinkedIn, чтобы не додумывать за него опыт, метрики или технологии.",
};
