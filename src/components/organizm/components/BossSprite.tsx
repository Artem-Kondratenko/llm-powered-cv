import type { CSSProperties } from "react";
import { getEnemyConfig } from "../enemyCatalog";
import type { EnemyState } from "../types";

export function BossSprite({ enemy, now }: { enemy: EnemyState; now: number }) {
  const config = getEnemyConfig(enemy.typeId);
  const hpPercent = enemy.maxHp > 0 ? Math.max(0, Math.min(100, (enemy.hp / enemy.maxHp) * 100)) : 0;
  const phase = hpPercent <= 20 ? "critical" : hpPercent <= 60 ? "fractured" : "sealed";
  const variant = enemy.bossVariant ?? "capsule";
  const style = {
    left: `${enemy.x}%`,
    top: `${enemy.y}%`,
    "--organizm-virus-hp": `${hpPercent}%`,
    "--organizm-virus-size": `${config.size}px`,
  } as CSSProperties;

  return (
    <div
      className={`organizm-virus organizm-virus--${enemy.typeId} organizm-virus--boss organizm-virus--boss-${variant} organizm-virus--boss-${phase}${
        enemy.damageFlashUntil > now ? " organizm-virus--hit" : ""
      }`}
      style={style}
      aria-label={`${config.title}, здоровье ${Math.max(0, Math.ceil(enemy.hp))} из ${enemy.maxHp}`}
    >
      <span className="organizm-virus__aura" aria-hidden="true" />
      <span className="organizm-virus__body" aria-hidden="true">
        <span className="organizm-virus__fill" />
        <span className="organizm-virus__grid" />
        <span className="organizm-virus__boss-core" />
        <span className="organizm-virus__boss-crack organizm-virus__boss-crack--one" />
        <span className="organizm-virus__boss-crack organizm-virus__boss-crack--two" />
        <span className="organizm-virus__boss-node organizm-virus__boss-node--one" />
        <span className="organizm-virus__boss-node organizm-virus__boss-node--two" />
        <span className="organizm-virus__boss-node organizm-virus__boss-node--three" />
        <span className="organizm-virus__boss-spike-ring" />
      </span>
      <span className="organizm-virus__hp" aria-hidden="true" />
    </div>
  );
}
