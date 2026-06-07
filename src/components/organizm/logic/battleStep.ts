import { CORE_POINT } from "../balance";
import { buildWaveEnemySequence, getEnemyConfig } from "../enemyCatalog";
import { getAttackVisual, getPatchConfig, getPatchStats } from "../patchCatalog";
import type {
  AttackVisual,
  BattleEffect,
  BattleFloatNumber,
  BattleState,
  EnemyState,
  PassiveStats,
  PatchCooldowns,
  PatchTone,
  PlacedPatch,
  WaveConfig,
} from "../types";
import { getDistance, isEnemyInsideVisibleBounds, isEnemyTargetable, sortTargetableByDistance } from "./targeting";

const BEAM_LIFETIME_MS = 430;
const FLOATING_NUMBER_LIFETIME_MS = 760;
const CORE_BREACH_RADIUS = 4.2;
const BOSS_COOLDOWN_GLITCH_MS = 520;

type IdFactory = {
  next: () => number;
};

export type BattleStepInput = {
  current: BattleState;
  frameNow: number;
  lastFrameAt: number;
  health: number;
  maxHealth: number;
  passiveStats: PassiveStats;
  cooldowns: PatchCooldowns;
  idFactory: IdFactory;
  random?: () => number;
};

export type BattleStepResult = {
  battle: BattleState;
  health: number;
  cooldowns: PatchCooldowns;
};

export function createEnemy(index: number, wave: WaveConfig, frameNow = 0): EnemyState {
  const sequence = buildWaveEnemySequence(wave.groups);
  const typeId = sequence[index] ?? "triangular-swarm";
  const config = getEnemyConfig(typeId);
  const lane = config.boss ? 50 : [16, 31, 47, 64, 82][index % 5];
  const edge = config.boss ? 0 : index % 4;
  const coordinates =
    edge === 0
      ? { x: lane, y: 5 }
      : edge === 1
        ? { x: 95, y: lane }
        : edge === 2
          ? { x: 100 - lane, y: 95 }
          : { x: 5, y: 100 - lane };

  return {
    id: index + 1,
    typeId,
    ...coordinates,
    hp: config.hp,
    maxHp: config.hp,
    hitRadius: config.hitRadius,
    damage: config.damage,
    speed: config.speed,
    lastKnownX: coordinates.x,
    lastKnownY: coordinates.y,
    isVisible: false,
    isAlive: true,
    nextAttackAt: frameNow + (config.firstAttackDelayMs ?? config.attackIntervalMs ?? 1200),
    nextGlitchAt: config.glitchIntervalMs ? frameNow + config.glitchIntervalMs : undefined,
    pathSeed: (index * 1.618 + wave.waveNumber * 0.73) % (Math.PI * 2),
    damageFlashUntil: 0,
  };
}

export function createBattleState(wave: WaveConfig, loadout: PlacedPatch[] = [], now = 0): BattleState {
  return {
    wave,
    loadout,
    enemies: [],
    beams: [],
    effects: [],
    floaters: [],
    spawnedCount: 0,
    killedCount: 0,
    breachedCount: 0,
    lastSpawnAt: now - wave.spawnIntervalMs,
    slowUntil: 0,
    slowMultiplier: 1,
    patchFlashUntil: {},
    patchReady: {},
    patchChargeProgress: {},
    tick: 0,
  };
}

function getEffectLifetime(effect: BattleEffect) {
  if (effect.type === "boss-collapse") {
    return 1120;
  }

  if (effect.type === "shatter" || effect.type === "boss-glitch") {
    return 680;
  }

  return 620;
}

function addEffect(
  effects: BattleEffect[],
  idFactory: IdFactory,
  type: BattleEffect["type"],
  x: number,
  y: number,
  frameNow: number,
  tone?: PatchTone,
  visual?: AttackVisual,
) {
  effects.push({
    id: idFactory.next(),
    type,
    x,
    y,
    tone,
    visual,
    createdAt: frameNow,
  });
}

function addFloatingNumber(
  floaters: BattleFloatNumber[],
  idFactory: IdFactory,
  value: string,
  x: number,
  y: number,
  frameNow: number,
  tone: PatchTone,
  kind: BattleFloatNumber["kind"],
) {
  floaters.push({
    id: idFactory.next(),
    x,
    y,
    value,
    tone,
    kind,
    createdAt: frameNow,
  });
}

function applyDamageToEnemy(
  enemies: EnemyState[],
  targetId: number,
  damage: number,
  frameNow: number,
  effects: BattleEffect[],
  floaters: BattleFloatNumber[],
  idFactory: IdFactory,
  tone: PatchTone,
  visual: AttackVisual,
) {
  let killed = 0;
  const nextEnemies = enemies
    .map((enemy) => {
      if (enemy.id !== targetId) {
        return enemy;
      }

      addEffect(effects, idFactory, "hit", enemy.x, enemy.y, frameNow, tone, visual);
      addFloatingNumber(floaters, idFactory, `-${damage}`, enemy.x, enemy.y - enemy.hitRadius - 2, frameNow, tone, "damage");

      return {
        ...enemy,
        hp: enemy.hp - damage,
        lastKnownX: enemy.x,
        lastKnownY: enemy.y,
        damageFlashUntil: frameNow + 210,
      };
    })
    .filter((enemy) => {
      if (enemy.hp > 0) {
        return true;
      }

      killed += 1;
      const config = getEnemyConfig(enemy.typeId);
      addEffect(effects, idFactory, "shatter", enemy.lastKnownX, enemy.lastKnownY, frameNow, config.tone, visual);

      if (config.boss) {
        addEffect(effects, idFactory, "boss-collapse", enemy.lastKnownX, enemy.lastKnownY, frameNow, config.tone, "boss");
      }

      return false;
    });

  return { enemies: nextEnemies, killed };
}

function markPatchReady(patchReady: Partial<Record<string, boolean>>, uid: string) {
  patchReady[uid] = true;
}

function markPatchFired(
  patchReady: Partial<Record<string, boolean>>,
  patchFlashUntil: Partial<Record<string, number>>,
  cooldowns: PatchCooldowns,
  uid: string,
  frameNow: number,
  flashDurationMs = 400,
) {
  patchReady[uid] = false;
  patchFlashUntil[uid] = frameNow + flashDurationMs;
  cooldowns[uid] = frameNow;
}

function getNormalizedMoveVector(enemy: EnemyState, frameNow: number, swerve = 0) {
  const distanceToCore = Math.max(0.001, getDistance(enemy, CORE_POINT));
  const directionX = (CORE_POINT.x - enemy.x) / distanceToCore;
  const directionY = (CORE_POINT.y - enemy.y) / distanceToCore;

  if (!swerve) {
    return { x: directionX, y: directionY };
  }

  const wobble = Math.sin(frameNow / 260 + enemy.pathSeed) * swerve;
  const mixedX = directionX + -directionY * wobble;
  const mixedY = directionY + directionX * wobble;
  const length = Math.max(0.001, Math.hypot(mixedX, mixedY));

  return { x: mixedX / length, y: mixedY / length };
}

export function runBattleStep({
  current,
  frameNow,
  lastFrameAt,
  health,
  maxHealth,
  passiveStats,
  cooldowns,
  idFactory,
  random = Math.random,
}: BattleStepInput): BattleStepResult {
  const deltaSeconds = Math.min(0.05, Math.max(0, (frameNow - lastFrameAt) / 1000));
  let enemies = [...current.enemies];
  let spawnedCount = current.spawnedCount;
  let lastSpawnAt = current.lastSpawnAt;
  let breachedDelta = 0;
  let killedDelta = 0;
  let slowUntil = current.slowUntil;
  let slowMultiplier = current.slowMultiplier;
  const beams = current.beams.filter((beam) => frameNow - beam.createdAt < BEAM_LIFETIME_MS);
  const effects = current.effects.filter((effect) => frameNow - effect.createdAt < getEffectLifetime(effect));
  const floaters = current.floaters.filter((floater) => frameNow - floater.createdAt < FLOATING_NUMBER_LIFETIME_MS);
  const patchFlashUntil = { ...current.patchFlashUntil };
  const patchReady = { ...current.patchReady };
  const patchChargeProgress: Partial<Record<string, number>> = {};
  const nextCooldowns = { ...cooldowns };
  let nextHealth = health;

  function applyCoreDamage(rawDamage: number, tone: PatchTone, x = CORE_POINT.x, y = CORE_POINT.y) {
    const incomingDamage = Math.max(1, rawDamage - passiveStats.damageReduction);
    nextHealth = Math.max(0, nextHealth - incomingDamage);
    breachedDelta += 1;
    addEffect(effects, idFactory, "breach", CORE_POINT.x, CORE_POINT.y, frameNow, tone);
    addFloatingNumber(floaters, idFactory, `-${incomingDamage}`, x, y - 7, frameNow, tone, "damage");
  }

  function fireEnemyAttack(enemy: EnemyState, visual: AttackVisual) {
    const config = getEnemyConfig(enemy.typeId);
    beams.push({
      id: idFactory.next(),
      source: "enemy",
      fromX: enemy.x,
      fromY: enemy.y,
      toX: CORE_POINT.x,
      toY: CORE_POINT.y,
      tone: config.tone,
      visual,
      createdAt: frameNow,
    });
    addEffect(effects, idFactory, "enemy-shot", enemy.x, enemy.y, frameNow, config.tone, visual);
    applyCoreDamage(enemy.damage, config.tone);
  }

  while (spawnedCount < current.wave.enemyCount && frameNow - lastSpawnAt >= current.wave.spawnIntervalMs) {
    lastSpawnAt += current.wave.spawnIntervalMs;
    const enemy = createEnemy(spawnedCount, current.wave, frameNow);
    enemies.push(enemy);
    addEffect(effects, idFactory, "spawn", enemy.x, enemy.y, frameNow, getEnemyConfig(enemy.typeId).tone);
    spawnedCount += 1;
  }

  const movementMultiplier = slowUntil > frameNow ? slowMultiplier : 1;

  enemies = enemies.flatMap((enemy) => {
    const config = getEnemyConfig(enemy.typeId);
    const distanceToCore = getDistance(enemy, CORE_POINT);
    const stepDistance = enemy.speed * movementMultiplier * deltaSeconds;
    const visible = isEnemyInsideVisibleBounds(enemy);
    let nextEnemy: EnemyState = {
      ...enemy,
      isVisible: visible,
      isAlive: enemy.hp > 0,
      lastKnownX: enemy.x,
      lastKnownY: enemy.y,
    };

    if (config.attackKind === "melee" && distanceToCore <= CORE_BREACH_RADIUS + enemy.hitRadius + stepDistance) {
      applyCoreDamage(enemy.damage, config.tone);
      return [];
    }

    if (config.attackKind === "ranged" && distanceToCore <= (config.stopDistance ?? 34)) {
      if (frameNow >= nextEnemy.nextAttackAt) {
        fireEnemyAttack(nextEnemy, config.boss ? "boss" : "enemy-shot");
        nextEnemy = {
          ...nextEnemy,
          nextAttackAt: frameNow + (config.attackIntervalMs ?? 1500),
        };
      }

      if (config.boss && config.glitchIntervalMs && nextEnemy.nextGlitchAt && frameNow >= nextEnemy.nextGlitchAt) {
        current.loadout.forEach((item) => {
          const patch = getPatchConfig(item);
          const stats = getPatchStats(item);

          if (patch.kind !== "active" || !stats.cooldownMs) {
            return;
          }

          const hasteMultiplier = Math.max(0.65, 1 - passiveStats.hastePercent / 100);
          const cooldownMs = stats.cooldownMs * hasteMultiplier;

          if (patchReady[item.uid]) {
            patchReady[item.uid] = false;
            nextCooldowns[item.uid] = frameNow - cooldownMs * 0.78;
            return;
          }

          nextCooldowns[item.uid] = (nextCooldowns[item.uid] ?? frameNow) + BOSS_COOLDOWN_GLITCH_MS;
        });

        addEffect(effects, idFactory, "boss-glitch", nextEnemy.x, nextEnemy.y, frameNow, config.tone, "boss");
        addEffect(effects, idFactory, "boss-glitch", CORE_POINT.x, CORE_POINT.y, frameNow, "cyan", "boss");
        nextEnemy = {
          ...nextEnemy,
          nextGlitchAt: frameNow + config.glitchIntervalMs,
        };
      }

      return [nextEnemy];
    }

    if (config.attackKind === "moving" && visible && frameNow >= nextEnemy.nextAttackAt) {
      fireEnemyAttack(nextEnemy, "parasite");
      nextEnemy = {
        ...nextEnemy,
        nextAttackAt: frameNow + (config.attackIntervalMs ?? 1700),
      };
    }

    if (distanceToCore <= CORE_BREACH_RADIUS + enemy.hitRadius + stepDistance) {
      applyCoreDamage(enemy.damage, config.tone);
      return [];
    }

    const direction = getNormalizedMoveVector(nextEnemy, frameNow, config.attackKind === "moving" ? config.swerve : 0);
    const movedEnemy = {
      ...nextEnemy,
      x: nextEnemy.x + direction.x * stepDistance,
      y: nextEnemy.y + direction.y * stepDistance,
    };

    return [
      {
        ...movedEnemy,
        isVisible: isEnemyInsideVisibleBounds(movedEnemy),
        lastKnownX: movedEnemy.x,
        lastKnownY: movedEnemy.y,
      },
    ];
  });

  current.loadout.forEach((item) => {
    const patch = getPatchConfig(item);
    const stats = getPatchStats(item);

    if (patch.kind !== "active" || !stats.cooldownMs) {
      return;
    }

    const hasteMultiplier = Math.max(0.65, 1 - passiveStats.hastePercent / 100);
    const cooldownMs = stats.cooldownMs * hasteMultiplier;
    const previousTrigger = nextCooldowns[item.uid] ?? Number.NEGATIVE_INFINITY;
    const chargeProgress = Math.max(0, Math.min(1, (frameNow - previousTrigger) / cooldownMs));
    patchChargeProgress[item.uid] = patchReady[item.uid] ? 1 : chargeProgress;

    if (frameNow - previousTrigger < cooldownMs) {
      patchReady[item.uid] = false;
      patchChargeProgress[item.uid] = chargeProgress;
      return;
    }

    patchChargeProgress[item.uid] = 1;

    if (stats.slowPercent && stats.slowDurationMs) {
      if (!enemies.some((enemy) => isEnemyTargetable(enemy, CORE_POINT))) {
        markPatchReady(patchReady, item.uid);
        patchChargeProgress[item.uid] = 1;
        return;
      }

      markPatchFired(patchReady, patchFlashUntil, nextCooldowns, item.uid, frameNow, 420);
      patchChargeProgress[item.uid] = 0;
      slowUntil = Math.max(slowUntil, frameNow + stats.slowDurationMs);
      slowMultiplier = 1 - stats.slowPercent / 100;
      addEffect(effects, idFactory, "slow", CORE_POINT.x, CORE_POINT.y, frameNow, "cyan");
      return;
    }

    if (patch.category === "attack" && stats.damage) {
      const visual = getAttackVisual(patch.id);
      const target = sortTargetableByDistance(enemies, CORE_POINT)[0] ?? null;

      if (!target) {
        markPatchReady(patchReady, item.uid);
        patchChargeProgress[item.uid] = 1;
        return;
      }

      markPatchFired(patchReady, patchFlashUntil, nextCooldowns, item.uid, frameNow, 380);
      patchChargeProgress[item.uid] = 0;

      const targetIds =
        stats.splashTargets && stats.splashTargets > 1
          ? enemies
              .filter((enemy) => isEnemyTargetable(enemy, CORE_POINT))
              .sort((a, b) => getDistance(a, target) - getDistance(b, target))
              .slice(0, stats.splashTargets)
              .map((enemy) => enemy.id)
          : sortTargetableByDistance(enemies, CORE_POINT)
              .slice(0, stats.hits ?? 1)
              .map((enemy) => enemy.id);

      targetIds.forEach((targetId) => {
        const liveTarget = enemies.find((enemy) => enemy.id === targetId && isEnemyTargetable(enemy, CORE_POINT));

        if (!liveTarget) {
          return;
        }

        beams.push({
          id: idFactory.next(),
          source: "patch",
          fromX: CORE_POINT.x,
          fromY: CORE_POINT.y,
          toX: liveTarget.x,
          toY: liveTarget.y,
          tone: patch.tone,
          targetId: liveTarget.id,
          visual,
          createdAt: frameNow,
        });

        const damageResult = applyDamageToEnemy(
          enemies,
          targetId,
          stats.damage!,
          frameNow,
          effects,
          floaters,
          idFactory,
          patch.tone,
          visual,
        );
        enemies = damageResult.enemies;
        killedDelta += damageResult.killed;
      });

      if (passiveStats.doubleShotChance > 0 && random() * 100 < passiveStats.doubleShotChance) {
        const extraTarget = sortTargetableByDistance(enemies, CORE_POINT)[0] ?? null;

        if (extraTarget) {
          beams.push({
            id: idFactory.next(),
            source: "patch",
            fromX: CORE_POINT.x,
            fromY: CORE_POINT.y,
            toX: extraTarget.x,
            toY: extraTarget.y,
            tone: "yellow",
            targetId: extraTarget.id,
            visual: "double",
            createdAt: frameNow,
          });
          const damageResult = applyDamageToEnemy(
            enemies,
            extraTarget.id,
            stats.damage,
            frameNow,
            effects,
            floaters,
            idFactory,
            "yellow",
            "double",
          );
          enemies = damageResult.enemies;
          killedDelta += damageResult.killed;
        }
      }

      return;
    }

    if (!stats.heal) {
      return;
    }

    if (nextHealth >= maxHealth) {
      markPatchReady(patchReady, item.uid);
      patchChargeProgress[item.uid] = 1;
      return;
    }

    const healAmount = Math.min(stats.heal, maxHealth - nextHealth);
    markPatchFired(patchReady, patchFlashUntil, nextCooldowns, item.uid, frameNow, 420);
    patchChargeProgress[item.uid] = 0;
    addEffect(effects, idFactory, "heal", CORE_POINT.x, CORE_POINT.y, frameNow, "green");
    addFloatingNumber(floaters, idFactory, `+${Math.round(healAmount)}`, CORE_POINT.x, CORE_POINT.y - 7, frameNow, "green", "heal");
    nextHealth = Math.min(maxHealth, nextHealth + stats.heal);
  });

  return {
    health: Math.round(nextHealth),
    cooldowns: nextCooldowns,
    battle: {
      wave: current.wave,
      loadout: current.loadout,
      enemies,
      beams,
      effects,
      floaters,
      spawnedCount,
      killedCount: current.killedCount + killedDelta,
      breachedCount: current.breachedCount + breachedDelta,
      lastSpawnAt,
      slowUntil,
      slowMultiplier,
      patchFlashUntil,
      patchReady,
      patchChargeProgress,
      tick: current.tick + 1,
    },
  };
}
