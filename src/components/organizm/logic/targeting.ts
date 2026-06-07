import { ATTACK_RADIUS, CORE_POINT, VISIBLE_BATTLE_BOUNDS } from "../balance";
import type { EnemyState } from "../types";

export function getDistance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function isEnemyInsideVisibleBounds(enemy: EnemyState) {
  return (
    enemy.x >= VISIBLE_BATTLE_BOUNDS.minX &&
    enemy.x <= VISIBLE_BATTLE_BOUNDS.maxX &&
    enemy.y >= VISIBLE_BATTLE_BOUNDS.minY &&
    enemy.y <= VISIBLE_BATTLE_BOUNDS.maxY
  );
}

export function isEnemyTargetable(enemy: EnemyState, origin = CORE_POINT) {
  return enemy.hp > 0 && isEnemyInsideVisibleBounds(enemy) && getDistance(enemy, origin) <= ATTACK_RADIUS;
}

export function getNearestTargetableEnemy(enemies: EnemyState[], origin = CORE_POINT) {
  return enemies.reduce<EnemyState | null>((nearest, enemy) => {
    if (!isEnemyTargetable(enemy, origin)) {
      return nearest;
    }

    if (!nearest) {
      return enemy;
    }

    return getDistance(enemy, origin) < getDistance(nearest, origin) ? enemy : nearest;
  }, null);
}

export function sortTargetableByDistance(enemies: EnemyState[], origin = CORE_POINT) {
  return enemies.filter((enemy) => isEnemyTargetable(enemy, origin)).sort((a, b) => getDistance(a, origin) - getDistance(b, origin));
}
