import type { CSSProperties } from "react";
import { getEnemyConfig } from "../enemyCatalog";
import type { EnemyState } from "../types";
import { BossSprite } from "./BossSprite";

export function EnemySprite({ enemy, now }: { enemy: EnemyState; now: number }) {
  const config = getEnemyConfig(enemy.typeId);

  if (config.boss) {
    return <BossSprite enemy={enemy} now={now} />;
  }

  const hpPercent = enemy.maxHp > 0 ? Math.max(0, Math.min(100, (enemy.hp / enemy.maxHp) * 100)) : 0;
  const style = {
    left: `${enemy.x}%`,
    top: `${enemy.y}%`,
    "--organizm-virus-hp": `${hpPercent}%`,
    "--organizm-virus-size": `${config.size}px`,
  } as CSSProperties;

  return (
    <div
      className={`organizm-virus organizm-virus--${enemy.typeId}${enemy.damageFlashUntil > now ? " organizm-virus--hit" : ""}`}
      style={style}
      aria-label={`${config.title}, здоровье ${Math.max(0, Math.ceil(enemy.hp))} из ${enemy.maxHp}`}
    >
      <span className="organizm-virus__aura" aria-hidden="true" />
      <span className="organizm-virus__body" aria-hidden="true">
        <span className="organizm-virus__fill" />
        <span className="organizm-virus__grid" />
        {enemy.typeId === "worm-parasite" ? (
          <>
            <span className="organizm-virus__segment organizm-virus__segment--one" />
            <span className="organizm-virus__segment organizm-virus__segment--two" />
            <span className="organizm-virus__segment organizm-virus__segment--three" />
          </>
        ) : null}
      </span>
      <span className="organizm-virus__hp" aria-hidden="true" />
    </div>
  );
}
