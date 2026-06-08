import { EXPANSION_CELLS, MATRIX_GROWTH_BATCH_SIZE } from "./balance";
import type { MutationCombatStats, PatchTone } from "./types";

export type MutationId =
  | "core-pulse"
  | "aggressive-code"
  | "critical-glitch"
  | "impulse-overload"
  | "armor-membrane"
  | "double-protocol"
  | "accelerated-response"
  | "tissue-growth";

export type MutationConfig = {
  id: MutationId;
  title: string;
  shortTitle: string;
  tone: PatchTone;
  icon: string;
  description: string;
  firstBonus: string;
  repeatBonus: string;
};

export type MutationCounts = Partial<Record<MutationId, number>>;

export const MUTATION_COSTS = [10, 15, 25, 40, 60, 85];

export const MUTATION_ORDER: MutationId[] = [
  "core-pulse",
  "aggressive-code",
  "critical-glitch",
  "impulse-overload",
  "armor-membrane",
  "double-protocol",
  "accelerated-response",
  "tissue-growth",
];

export const MUTATIONS: Record<MutationId, MutationConfig> = {
  "core-pulse": {
    id: "core-pulse",
    title: "Пульс ядра",
    shortTitle: "HP",
    tone: "green",
    icon: "core",
    description: "Укрепляет ядро и увеличивает запас HP.",
    firstBonus: "+5% max HP",
    repeatBonus: "+2% max HP",
  },
  "aggressive-code": {
    id: "aggressive-code",
    title: "Агрессивный код",
    shortTitle: "ATK",
    tone: "pink",
    icon: "code",
    description: "Усиливает урон атакующих патчей.",
    firstBonus: "+5% урона",
    repeatBonus: "+2% урона",
  },
  "critical-glitch": {
    id: "critical-glitch",
    title: "Критический сбой",
    shortTitle: "CRIT",
    tone: "purple",
    icon: "glitch",
    description: "Даёт шанс нанести усиленный урон.",
    firstBonus: "+3% шанс крита",
    repeatBonus: "+1% шанс крита",
  },
  "impulse-overload": {
    id: "impulse-overload",
    title: "Перегрузка импульса",
    shortTitle: "X",
    tone: "orange",
    icon: "burst",
    description: "Увеличивает силу критических попаданий.",
    firstBonus: "+10% крит. урона",
    repeatBonus: "+3% крит. урона",
  },
  "armor-membrane": {
    id: "armor-membrane",
    title: "Бронемембрана",
    shortTitle: "ARM",
    tone: "blue",
    icon: "shield",
    description: "Снижает входящий урон по ядру.",
    firstBonus: "+1 броня",
    repeatBonus: "+1 броня за 2 повтора",
  },
  "double-protocol": {
    id: "double-protocol",
    title: "Двойной протокол",
    shortTitle: "2X",
    tone: "yellow",
    icon: "double",
    description: "Даёт шанс выпустить дополнительный заряд.",
    firstBonus: "+3% double-shot",
    repeatBonus: "+1% double-shot",
  },
  "accelerated-response": {
    id: "accelerated-response",
    title: "Ускоренный отклик",
    shortTitle: "SPD",
    tone: "teal",
    icon: "timer",
    description: "Ускоряет зарядку активных патчей.",
    firstBonus: "+4% скорости active",
    repeatBonus: "+1.5% скорости active",
  },
  "tissue-growth": {
    id: "tissue-growth",
    title: "Рост ткани",
    shortTitle: "CELL",
    tone: "cyan",
    icon: "cell",
    description: "Открывает следующий прямоугольный шаг Матрицы адаптации.",
    firstBonus: "+3 клетки / 4 x 3",
    repeatBonus: "ещё +3 клетки",
  },
};

export function getMutationCost(purchasedCount: number) {
  if (purchasedCount < MUTATION_COSTS.length) {
    return MUTATION_COSTS[purchasedCount];
  }

  return MUTATION_COSTS[MUTATION_COSTS.length - 1] + (purchasedCount - MUTATION_COSTS.length + 1) * 30;
}

export function getMutationConfig(id: MutationId) {
  return MUTATIONS[id];
}

export function getMutationStats(counts: MutationCounts): MutationCombatStats {
  const getCount = (id: MutationId) => counts[id] ?? 0;
  const core = getCount("core-pulse");
  const attack = getCount("aggressive-code");
  const crit = getCount("critical-glitch");
  const critDamage = getCount("impulse-overload");
  const armor = getCount("armor-membrane");
  const doubleShot = getCount("double-protocol");
  const haste = getCount("accelerated-response");
  const growth = getCount("tissue-growth");

  return {
    maxHealthPercent: core > 0 ? 5 + (core - 1) * 2 : 0,
    damagePercent: attack > 0 ? 5 + (attack - 1) * 2 : 0,
    critChancePercent: crit > 0 ? 3 + (crit - 1) * 1 : 0,
    critDamagePercent: critDamage > 0 ? 10 + (critDamage - 1) * 3 : 0,
    armorBonus: armor > 0 ? 1 + Math.floor((armor - 1) / 2) : 0,
    doubleShotChancePercent: doubleShot > 0 ? 3 + (doubleShot - 1) * 1 : 0,
    hastePercent: haste > 0 ? 4 + (haste - 1) * 1.5 : 0,
    unlockedCells: Math.min(EXPANSION_CELLS.length, growth * MATRIX_GROWTH_BATCH_SIZE),
  };
}

export function describeMutationLevel(id: MutationId, count: number) {
  const mutation = getMutationConfig(id);

  if (count <= 0) {
    return mutation.firstBonus;
  }

  return `${mutation.repeatBonus} · уровень ${count + 1}`;
}
