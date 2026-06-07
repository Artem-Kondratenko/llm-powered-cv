import stroikaPreview from "../assets/stroika/preview/stroika-preview.webp";
import organizmPreview from "../assets/organizm/preview/organizm-preview.png";

export type GamePrototypeSlotStatus = "prototype" | "reserved";

export type GamePrototypeSlot = {
  id: string;
  title: string;
  status: GamePrototypeSlotStatus;
  statusLabel: string;
  description: string;
  ctaLabel: string;
  previewKind?: "stroika" | "organizm" | "placeholder";
  previewImage?: string;
  previewAlt?: string;
};

export const gamePrototypeSlots: GamePrototypeSlot[] = [
  {
    id: "organizm",
    title: "Organizm",
    status: "prototype",
    statusLabel: "MVP",
    description:
      "Пиксельный автобатлер про цифровой организм. Размещай патчи, запускай защиту и переживи волну вирусов.",
    ctaLabel: "Запустить",
    previewKind: "organizm",
    previewImage: organizmPreview,
    previewAlt: "Неоновое пиксельное превью игры Organizm с ядром организма, патчами и атакующими вирусами",
  },
  {
    id: "stroika-veka",
    title: "Стройка века",
    status: "prototype",
    statusLabel: "Прототип",
    description:
      "Короткая puzzle-игра про строительство города будущего по плану пятилетки.",
    ctaLabel: "Играть",
    previewKind: "stroika",
    previewImage: stroikaPreview,
    previewAlt: "Превью игры Стройка века в стиле советского ретро-футуризма",
  },
  {
    id: "next-prototype",
    title: "Следующий прототип",
    status: "reserved",
    statusLabel: "Зарезервировано",
    description:
      "Место для следующей небольшой игры или интерактивной идеи, которая дополнит CV-лендинг.",
    ctaLabel: "Скоро",
    previewKind: "placeholder",
  },
];
