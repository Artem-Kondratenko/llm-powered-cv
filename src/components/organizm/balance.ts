import type { BossVariant, WaveConfig } from "./types";

export const BOARD_START_COLS = 3;
export const BOARD_START_ROWS = 3;
export const BOARD_COLS = 6;
export const BOARD_ROWS = 4;
export const EXPANSION_CELLS = [
  { x: 3, y: 0 },
  { x: 3, y: 1 },
  { x: 3, y: 2 },
  { x: 4, y: 0 },
  { x: 4, y: 1 },
  { x: 4, y: 2 },
  { x: 5, y: 0 },
  { x: 5, y: 1 },
  { x: 5, y: 2 },
  { x: 0, y: 3 },
  { x: 1, y: 3 },
  { x: 2, y: 3 },
  { x: 3, y: 3 },
  { x: 4, y: 3 },
  { x: 5, y: 3 },
];
export const CORE_POINT = { x: 50, y: 50 };
export const VISIBLE_BATTLE_BOUNDS = { minX: 7, maxX: 93, minY: 7, maxY: 93 };
export const ATTACK_RADIUS = 64;
export const BASE_HEALTH = 100;
export const MAX_PATCH_LEVEL = 3;
export const MATRIX_GROWTH_BATCH_SIZE = 3;
export const WAVE_END_DELAY_MS = 800;
export const LEVEL_END_DELAY_MS = 900;
export const BOSS_END_DELAY_MS = 1600;
export const DEFEAT_DELAY_MS = 700;
export const SECTOR_TITLES = [
  "Первичное заражение",
  "Усиленное заражение",
  "Глубокий сбой",
  "Каскадная мутация",
  "Критический разлом",
];

function defineWave(wave: Omit<WaveConfig, "enemyCount">): WaveConfig {
  return {
    ...wave,
    enemyCount: wave.groups.reduce((total, group) => total + group.count, 0),
  };
}

export const WAVE_CONFIGS: WaveConfig[] = [
  defineWave({
    waveNumber: 1,
    title: "Первичный контакт",
    groups: [{ typeId: "triangular-swarm", count: 10 }],
    spawnIntervalMs: 1280,
    rewardCount: 3,
  }),
  defineWave({
    waveNumber: 2,
    title: "Бронированная проба",
    groups: [
      { typeId: "triangular-swarm", count: 10 },
      { typeId: "square-brute", count: 3 },
    ],
    spawnIntervalMs: 1180,
    rewardCount: 3,
  }),
  defineWave({
    waveNumber: 3,
    title: "Смешанное заражение",
    groups: [
      { typeId: "triangular-swarm", count: 9 },
      { typeId: "spiked-star", count: 5 },
      { typeId: "square-brute", count: 4 },
    ],
    spawnIntervalMs: 1040,
    rewardCount: 4,
  }),
  defineWave({
    waveNumber: 4,
    title: "Паразитный скачок",
    groups: [
      { typeId: "triangular-swarm", count: 8 },
      { typeId: "worm-parasite", count: 5 },
      { typeId: "glitch-shard", count: 5 },
      { typeId: "square-brute", count: 3 },
    ],
    spawnIntervalMs: 930,
    rewardCount: 5,
  }),
  defineWave({
    waveNumber: 5,
    title: "Глитч-капсула",
    groups: [
      { typeId: "triangular-swarm", count: 8 },
      { typeId: "spiked-star", count: 4 },
      { typeId: "worm-parasite", count: 4 },
      { typeId: "glitch-shard", count: 5 },
      { typeId: "glitch-capsule", count: 1 },
    ],
    spawnIntervalMs: 880,
    rewardCount: 0,
  }),
];

export function getSectorTitle(sectorIndex: number) {
  const sectorNumber = String(sectorIndex).padStart(2, "0");
  const title = SECTOR_TITLES[sectorIndex - 1] ?? `Заражение ${sectorNumber}`;

  return `Сектор ${sectorNumber}: ${title}`;
}

export function getShortSectorTitle(sectorIndex: number) {
  return `Сектор ${String(sectorIndex).padStart(2, "0")}`;
}

export function getBossVariant(sectorIndex: number): BossVariant {
  const variants: BossVariant[] = ["capsule", "colony", "corona"];

  return variants[(sectorIndex - 1) % variants.length];
}

export function getScaledWaveConfig(baseWave: WaveConfig, sectorIndex: number): WaveConfig {
  const extraCount = Math.max(0, sectorIndex - 1);
  const hpMultiplier = 1 + extraCount * 0.12;
  const damageMultiplier = 1 + extraCount * 0.1;
  const speedMultiplier = 1 + extraCount * 0.025;
  const groups = baseWave.groups.map((group, index) => ({
    ...group,
    count: group.count + (index === 0 ? extraCount : 0),
  }));

  return {
    ...baseWave,
    groups,
    enemyCount: groups.reduce((total, group) => total + group.count, 0),
    sectorIndex,
    bossVariant: getBossVariant(sectorIndex),
    enemyHpMultiplier: hpMultiplier,
    enemyDamageMultiplier: damageMultiplier,
    enemySpeedMultiplier: speedMultiplier,
  };
}
