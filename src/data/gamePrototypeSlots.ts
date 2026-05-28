export type GamePrototypeSlotStatus = "prototype" | "reserved";

export type GamePrototypeSlot = {
  title: string;
  status: GamePrototypeSlotStatus;
  statusLabel: string;
  description: string;
  ctaLabel: string;
};

export const gamePrototypeSlots: GamePrototypeSlot[] = [
  {
    title: "Стройка века",
    status: "prototype",
    statusLabel: "В разработке",
    description:
      "Будущая puzzle-игра про строительство советских ретро-футуристических зданий на необычных игровых полях.",
    ctaLabel: "Скоро",
  },
  {
    title: "Следующий прототип",
    status: "reserved",
    statusLabel: "Зарезервировано",
    description:
      "Место для следующей небольшой игры или интерактивной идеи, которая дополнит CV-лендинг.",
    ctaLabel: "Скоро",
  },
];
