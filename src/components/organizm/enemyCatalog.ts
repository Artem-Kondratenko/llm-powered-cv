import type { EnemyConfig, EnemyTypeId, PatchTone, WaveEnemyGroup } from "./types";

export const ENEMIES: Record<EnemyTypeId, EnemyConfig> = {
  "triangular-swarm": {
    id: "triangular-swarm",
    title: "Треугольный рой",
    shortTitle: "рой",
    tone: "pink",
    attackKind: "melee",
    hp: 9,
    speed: 4.8,
    damage: 6,
    hitRadius: 3.2,
    size: 24,
    mutagens: 1,
    mutagenEveryKills: 3,
  },
  "square-brute": {
    id: "square-brute",
    title: "Квадратный броневик",
    shortTitle: "броневик",
    tone: "blue",
    attackKind: "melee",
    hp: 28,
    speed: 2.35,
    damage: 11,
    hitRadius: 4.1,
    size: 30,
    mutagens: 2,
  },
  "spiked-star": {
    id: "spiked-star",
    title: "Шипастый звездоид",
    shortTitle: "звездоид",
    tone: "orange",
    attackKind: "melee",
    hp: 17,
    speed: 3.55,
    damage: 15,
    hitRadius: 4,
    size: 30,
    mutagens: 1,
  },
  "worm-parasite": {
    id: "worm-parasite",
    title: "Червеобразный паразит",
    shortTitle: "паразит",
    tone: "green",
    attackKind: "moving",
    hp: 20,
    speed: 3.25,
    damage: 4,
    hitRadius: 4,
    size: 34,
    attackIntervalMs: 1700,
    firstAttackDelayMs: 900,
    swerve: 0.55,
    mutagens: 2,
  },
  "glitch-shard": {
    id: "glitch-shard",
    title: "Глитч-осколок",
    shortTitle: "осколок",
    tone: "yellow",
    attackKind: "ranged",
    hp: 11,
    speed: 4.15,
    damage: 5,
    hitRadius: 3.3,
    size: 23,
    stopDistance: 34,
    attackIntervalMs: 1450,
    firstAttackDelayMs: 640,
    mutagens: 1,
  },
  "glitch-capsule": {
    id: "glitch-capsule",
    title: "Глитч-капсула",
    shortTitle: "капсула",
    tone: "purple",
    attackKind: "ranged",
    hp: 165,
    speed: 1.62,
    damage: 9,
    hitRadius: 8,
    size: 58,
    stopDistance: 39,
    attackIntervalMs: 1550,
    firstAttackDelayMs: 780,
    boss: true,
    glitchIntervalMs: 4700,
    mutagens: 8,
  },
};

export function getEnemyConfig(typeId: EnemyTypeId) {
  return ENEMIES[typeId];
}

export function getEnemyTone(typeId: EnemyTypeId): PatchTone {
  return getEnemyConfig(typeId).tone;
}

export function buildWaveEnemySequence(groups: WaveEnemyGroup[]) {
  const remaining = groups.map((group) => ({ ...group }));
  const sequence: EnemyTypeId[] = [];

  while (remaining.some((group) => group.count > 0)) {
    remaining.forEach((group) => {
      if (group.count <= 0) {
        return;
      }

      sequence.push(group.typeId);
      group.count -= 1;
    });
  }

  return sequence;
}
