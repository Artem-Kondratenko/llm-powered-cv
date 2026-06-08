import { MAX_PATCH_LEVEL } from "./balance";
import type { AttackVisual, PatchBaseId, PatchConfig, PatchInstance, PatchLevel, PassiveStats } from "./types";

export const PATCHES: Record<PatchBaseId, PatchConfig> = {
  "impulse-node": {
    id: "impulse-node",
    title: "Импульсный узел",
    shortTitle: "Узел",
    category: "attack",
    kind: "active",
    tone: "pink",
    motif: "impulse",
    shape: [{ x: 0, y: 0 }],
    role: "Базовая атака по одной цели.",
    levels: {
      1: { cooldownMs: 3000, damage: 8, effect: "8 урона ближайшему вирусу каждые 3 сек." },
      2: { cooldownMs: 2500, damage: 14, effect: "14 урона ближайшему вирусу каждые 2.5 сек." },
      3: { cooldownMs: 2000, damage: 22, effect: "22 урона ближайшему вирусу каждые 2 сек." },
    },
  },
  "laser-channel": {
    id: "laser-channel",
    title: "Лазерный канал",
    shortTitle: "Лазер",
    category: "attack",
    kind: "active",
    tone: "orange",
    motif: "laser",
    shape: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ],
    labelAnchor: { x: 0, y: 0 },
    role: "Сильный направленный урон.",
    levels: {
      1: { cooldownMs: 4000, damage: 10, effect: "10 лазерного урона ближайшей цели каждые 4 сек." },
      2: { cooldownMs: 3500, damage: 16, effect: "16 лазерного урона ближайшей цели каждые 3.5 сек." },
      3: { cooldownMs: 3000, damage: 24, effect: "24 лазерного урона ближайшей цели каждые 3 сек." },
    },
  },
  "plasma-burst": {
    id: "plasma-burst",
    title: "Плазменный выброс",
    shortTitle: "Плазма",
    category: "attack",
    kind: "active",
    tone: "purple",
    motif: "plasma",
    shape: [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
    labelAnchor: { x: 0, y: 0 },
    role: "Урон по небольшой области.",
    levels: {
      1: { cooldownMs: 5000, damage: 10, splashTargets: 3, effect: "10 урона по ближайшей цели и двум рядом." },
      2: { cooldownMs: 4500, damage: 16, splashTargets: 3, effect: "16 урона по ближайшей цели и двум рядом." },
      3: { cooldownMs: 4000, damage: 24, splashTargets: 3, effect: "24 урона по ближайшей цели и двум рядом." },
    },
  },
  "shard-discharge": {
    id: "shard-discharge",
    title: "Осколочный разряд",
    shortTitle: "Осколки",
    category: "attack",
    kind: "active",
    tone: "yellow",
    motif: "shards",
    shape: [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
    ],
    labelAnchor: { x: 0, y: 0 },
    role: "Несколько зарядов по слабым целям.",
    levels: {
      1: { cooldownMs: 3500, damage: 3, hits: 3, effect: "3 заряда по 3 урона разным ближайшим вирусам." },
      2: { cooldownMs: 3000, damage: 4, hits: 4, effect: "4 заряда по 4 урона разным ближайшим вирусам." },
      3: { cooldownMs: 2500, damage: 5, hits: 5, effect: "5 зарядов по 5 урона разным ближайшим вирусам." },
    },
  },
  membrane: {
    id: "membrane",
    title: "Мембрана",
    shortTitle: "Щит",
    category: "defense",
    kind: "passive",
    tone: "cyan",
    motif: "membrane",
    shape: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ],
    labelAnchor: { x: 0, y: 0 },
    role: "Увеличивает здоровье Organizm.",
    levels: {
      1: { maxHealthBonus: 25, effect: "+25 max HP." },
      2: { maxHealthBonus: 45, effect: "+45 max HP." },
      3: { maxHealthBonus: 75, effect: "+75 max HP." },
    },
  },
  "armor-loop": {
    id: "armor-loop",
    title: "Бронеконтур",
    shortTitle: "Броня",
    category: "defense",
    kind: "passive",
    tone: "blue",
    motif: "armor",
    shape: [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
    labelAnchor: { x: 0, y: 0 },
    role: "Снижает входящий урон.",
    levels: {
      1: { damageReduction: 1, effect: "-1 урона от каждого прорыва, минимум 1." },
      2: { damageReduction: 2, effect: "-2 урона от каждого прорыва, минимум 1." },
      3: { damageReduction: 3, effect: "-3 урона от каждого прорыва, минимум 1." },
    },
  },
  regenerator: {
    id: "regenerator",
    title: "Регенератор",
    shortTitle: "Реген",
    category: "defense",
    kind: "active",
    tone: "green",
    motif: "regen",
    shape: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ],
    labelAnchor: { x: 0, y: 0 },
    role: "Восстанавливает здоровье ядра.",
    levels: {
      1: { cooldownMs: 5000, heal: 4, effect: "+4 HP каждые 5 сек, не выше max HP." },
      2: { cooldownMs: 4500, heal: 7, effect: "+7 HP каждые 4.5 сек, не выше max HP." },
      3: { cooldownMs: 4000, heal: 11, effect: "+11 HP каждые 4 сек, не выше max HP." },
    },
  },
  synchronizer: {
    id: "synchronizer",
    title: "Синхронизатор",
    shortTitle: "Синхр",
    category: "special",
    kind: "passive",
    tone: "teal",
    motif: "sync",
    shape: [{ x: 0, y: 0 }],
    role: "Ускоряет активные патчи.",
    levels: {
      1: { hastePercent: 5, effect: "Активные патчи срабатывают на 5% быстрее." },
      2: { hastePercent: 8, effect: "Активные патчи срабатывают на 8% быстрее." },
      3: { hastePercent: 12, effect: "Активные патчи срабатывают на 12% быстрее." },
    },
  },
  quarantine: {
    id: "quarantine",
    title: "Карантин",
    shortTitle: "Карантин",
    category: "special",
    kind: "active",
    tone: "purple",
    motif: "quarantine",
    shape: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
    labelAnchor: { x: 0, y: 0 },
    role: "Временно замедляет вирусов.",
    levels: {
      1: { cooldownMs: 6000, slowPercent: 15, slowDurationMs: 2000, effect: "Замедляет вирусов на 15% на 2 сек." },
      2: { cooldownMs: 5500, slowPercent: 20, slowDurationMs: 2500, effect: "Замедляет вирусов на 20% на 2.5 сек." },
      3: { cooldownMs: 5000, slowPercent: 25, slowDurationMs: 3000, effect: "Замедляет вирусов на 25% на 3 сек." },
    },
  },
  "double-shot": {
    id: "double-shot",
    title: "Двойной выстрел",
    shortTitle: "Дубль",
    category: "special",
    kind: "passive",
    tone: "yellow",
    motif: "double",
    shape: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 1 },
    ],
    labelAnchor: { x: 1, y: 0 },
    role: "Даёт шанс дополнительного выстрела.",
    levels: {
      1: { doubleShotChance: 15, effect: "15% шанс дополнительного заряда у атакующих активных патчей." },
      2: { doubleShotChance: 25, effect: "25% шанс дополнительного заряда у атакующих активных патчей." },
      3: { doubleShotChance: 35, effect: "35% шанс дополнительного заряда у атакующих активных патчей." },
    },
  },
};

export const PATCH_ORDER: PatchBaseId[] = [
  "impulse-node",
  "laser-channel",
  "plasma-burst",
  "shard-discharge",
  "membrane",
  "armor-loop",
  "regenerator",
  "synchronizer",
  "quarantine",
  "double-shot",
];

export const STARTER_PATCHES: PatchBaseId[] = ["impulse-node", "impulse-node", "laser-channel", "membrane"];

export const REWARD_TABLE: PatchBaseId[][] = [
  ["impulse-node", "impulse-node", "plasma-burst"],
  ["laser-channel", "membrane", "synchronizer"],
  ["shard-discharge", "shard-discharge", "armor-loop", "quarantine"],
  ["double-shot", "regenerator", "plasma-burst", "quarantine", "impulse-node"],
];

const SECTOR_PATCH_POOLS: Record<number, PatchBaseId[]> = {
  1: ["impulse-node", "laser-channel", "membrane", "synchronizer"],
  2: ["impulse-node", "laser-channel", "membrane", "synchronizer", "plasma-burst", "armor-loop", "regenerator", "quarantine"],
  3: [
    "impulse-node",
    "laser-channel",
    "membrane",
    "synchronizer",
    "plasma-burst",
    "armor-loop",
    "regenerator",
    "quarantine",
    "shard-discharge",
    "double-shot",
  ],
};

const SECTOR_REWARD_TABLES: Record<number, PatchBaseId[][]> = {
  1: [
    ["impulse-node", "laser-channel", "synchronizer"],
    ["membrane", "impulse-node", "laser-channel"],
    ["synchronizer", "membrane", "impulse-node", "laser-channel"],
    ["laser-channel", "impulse-node", "membrane", "synchronizer", "impulse-node"],
  ],
  2: [
    ["impulse-node", "laser-channel", "plasma-burst"],
    ["membrane", "synchronizer", "armor-loop"],
    ["regenerator", "laser-channel", "quarantine", "impulse-node"],
    ["plasma-burst", "membrane", "armor-loop", "synchronizer", "laser-channel"],
  ],
  3: [
    ["impulse-node", "laser-channel", "plasma-burst"],
    ["membrane", "synchronizer", "armor-loop"],
    ["regenerator", "shard-discharge", "quarantine", "laser-channel"],
    ["double-shot", "plasma-burst", "shard-discharge", "quarantine", "impulse-node"],
  ],
};

export function getStarterPatchIdsForSector(sectorIndex: number) {
  if (sectorIndex <= 1) {
    return STARTER_PATCHES;
  }

  return ["impulse-node", "laser-channel", "membrane", sectorIndex >= 3 ? "plasma-burst" : "synchronizer"] satisfies PatchBaseId[];
}

export function getRewardPatchPool(sectorIndex: number) {
  return SECTOR_PATCH_POOLS[sectorIndex] ?? PATCH_ORDER;
}

export function getWaveRewardPatchIds(sectorIndex: number, completedWaveIndex: number, rewardCount: number) {
  const sectorTable = SECTOR_REWARD_TABLES[sectorIndex] ?? REWARD_TABLE;
  const allowedPool = getRewardPatchPool(sectorIndex);
  const configuredIds = sectorTable[completedWaveIndex] ?? REWARD_TABLE[completedWaveIndex] ?? [];
  const rewards = configuredIds.filter((patchId) => allowedPool.includes(patchId)).slice(0, rewardCount);

  while (rewards.length < rewardCount) {
    const fallback = allowedPool[(completedWaveIndex + rewards.length) % allowedPool.length];
    rewards.push(fallback);
  }

  return rewards;
}

export function levelToRoman(level: PatchLevel) {
  return level === 1 ? "I" : level === 2 ? "II" : "III";
}

export function getPatchConfig(itemOrId: PatchInstance | PatchBaseId) {
  return PATCHES[typeof itemOrId === "string" ? itemOrId : itemOrId.patchId];
}

export function getPatchStats(item: PatchInstance) {
  return getPatchConfig(item).levels[item.level];
}

export function getPatchBounds(itemOrId: PatchInstance | PatchBaseId) {
  const patch = getPatchConfig(itemOrId);

  return {
    width: Math.max(...patch.shape.map((cell) => cell.x)) + 1,
    height: Math.max(...patch.shape.map((cell) => cell.y)) + 1,
  };
}

export function getPatchKindLabel(patch: PatchConfig) {
  return patch.kind === "active" ? "активный" : "пассивный";
}

export function getPatchCategoryLabel(patch: PatchConfig) {
  if (patch.category === "attack") {
    return "Атака";
  }

  if (patch.category === "defense") {
    return "Защита";
  }

  return "Особый";
}

export function formatCooldown(ms?: number) {
  if (!ms) {
    return "пассивно";
  }

  return `${(ms / 1000).toFixed(ms % 1000 === 0 ? 0 : 1)} сек`;
}

export function getAttackVisual(patchId: PatchBaseId): AttackVisual {
  if (patchId === "laser-channel") {
    return "laser";
  }

  if (patchId === "plasma-burst") {
    return "plasma";
  }

  if (patchId === "shard-discharge") {
    return "shard";
  }

  return "impulse";
}

export function getPassiveStats(boardPatches: PatchInstance[]): PassiveStats {
  return boardPatches.reduce<PassiveStats>(
    (stats, item) => {
      const patch = getPatchConfig(item);
      const levelStats = getPatchStats(item);

      if (patch.kind !== "passive") {
        return stats;
      }

      return {
        maxHealthBonus: stats.maxHealthBonus + (levelStats.maxHealthBonus ?? 0),
        damageReduction: stats.damageReduction + (levelStats.damageReduction ?? 0),
        hastePercent: stats.hastePercent + (levelStats.hastePercent ?? 0),
        doubleShotChance: stats.doubleShotChance + (levelStats.doubleShotChance ?? 0),
      };
    },
    { maxHealthBonus: 0, damageReduction: 0, hastePercent: 0, doubleShotChance: 0 },
  );
}

export function canMergeItems(a: PatchInstance | undefined, b: PatchInstance | undefined) {
  return Boolean(a && b && a.uid !== b.uid && a.patchId === b.patchId && a.level === b.level && a.level < MAX_PATCH_LEVEL);
}

export function levelUp(item: PatchInstance): PatchInstance {
  return {
    ...item,
    level: Math.min(MAX_PATCH_LEVEL, item.level + 1) as PatchLevel,
  };
}
