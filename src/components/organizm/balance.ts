import type { WaveConfig } from "./types";

export const BOARD_COLS = 6;
export const BOARD_ROWS = 5;
export const CORE_POINT = { x: 50, y: 50 };
export const VISIBLE_BATTLE_BOUNDS = { minX: 7, maxX: 93, minY: 7, maxY: 93 };
export const ATTACK_RADIUS = 64;
export const BASE_HEALTH = 100;
export const MAX_PATCH_LEVEL = 3;
export const MUTAGENS = 0;
export const LEVEL_TITLE = "Сектор 01: Первичное заражение";

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
