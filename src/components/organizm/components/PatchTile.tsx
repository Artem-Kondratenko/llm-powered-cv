import type { CSSProperties } from "react";
import { Crosshair, Shield, Sparkles } from "lucide-react";
import { getPatchBounds, getPatchConfig, levelToRoman } from "../patchCatalog";
import type { CellCoord, PatchCategory, PatchInstance } from "../types";
import { cellKey } from "../logic/placement";

type PatchTileVariant = "card" | "board" | "ghost";

function isOccupiedAnchor(anchor: CellCoord | undefined, shape: CellCoord[]) {
  return Boolean(anchor && shape.some((cell) => cell.x === anchor.x && cell.y === anchor.y));
}

function getOccupiedAnchor(anchor: CellCoord | undefined, fallback: CellCoord, shape: CellCoord[]) {
  return isOccupiedAnchor(anchor, shape) ? anchor! : fallback;
}

function PatchTypeIcon({ category }: { category: PatchCategory }) {
  const Icon = category === "attack" ? Crosshair : category === "defense" ? Shield : Sparkles;

  return <Icon aria-hidden="true" />;
}

function PatchShape({ item, variant = "card" }: { item: PatchInstance; variant?: PatchTileVariant }) {
  const patch = getPatchConfig(item);
  const bounds = getPatchBounds(item);
  const labelAnchor = getOccupiedAnchor(patch.labelAnchor, patch.shape[0], patch.shape);
  const iconAnchor = getOccupiedAnchor(patch.iconAnchor, labelAnchor, patch.shape);
  const cooldownAnchor = getOccupiedAnchor(patch.cooldownAnchor, iconAnchor, patch.shape);
  const style = {
    "--organizm-patch-cols": bounds.width,
    "--organizm-patch-rows": bounds.height,
  } as CSSProperties;

  return (
    <span
      className={`organizm-patch-shape organizm-patch-shape--${variant} organizm-patch-shape--level-${item.level}`}
      style={style}
      aria-hidden="true"
    >
      {patch.shape.map((cell) => (
        <span
          key={cellKey(cell)}
          className={`organizm-patch-cell organizm-patch-cell--${patch.tone}`}
          style={{
            gridColumn: `${cell.x + 1} / span 1`,
            gridRow: `${cell.y + 1} / span 1`,
          }}
        >
          <span className="organizm-patch-cell__node" />
          <span className="organizm-patch-cell__trace" />
          <span className="organizm-patch-cell__motif" />
          {variant !== "ghost" && cell.x === labelAnchor.x && cell.y === labelAnchor.y ? (
            <>
              <span className="organizm-patch-cell__level">{levelToRoman(item.level)}</span>
              <span className="organizm-patch-cell__name">{patch.shortTitle}</span>
            </>
          ) : null}
          {variant !== "ghost" && cell.x === iconAnchor.x && cell.y === iconAnchor.y ? (
            <span className={`organizm-patch-cell__type organizm-patch-cell__type--${patch.category}`}>
              <PatchTypeIcon category={patch.category} />
            </span>
          ) : null}
          {variant === "board" && patch.kind === "active" && cell.x === cooldownAnchor.x && cell.y === cooldownAnchor.y ? (
            <span className="organizm-patch-cell__cooldown" />
          ) : null}
        </span>
      ))}
    </span>
  );
}

export function PatchModule({ item, variant = "card" }: { item: PatchInstance; variant?: PatchTileVariant }) {
  const patch = getPatchConfig(item);

  return (
    <span
      className={`organizm-patch-module organizm-patch-module--${variant} organizm-patch-module--${patch.tone} organizm-patch-module--${patch.motif} organizm-patch-module--level-${item.level}`}
    >
      <PatchShape item={item} variant={variant} />
    </span>
  );
}
