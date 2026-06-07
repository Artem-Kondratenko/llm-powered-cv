import type { CSSProperties } from "react";
import { getPatchBounds, getPatchConfig, levelToRoman } from "../patchCatalog";
import type { PatchInstance } from "../types";
import { cellKey } from "../logic/placement";

type PatchTileVariant = "card" | "board" | "ghost";

function PatchShape({ item, variant = "card" }: { item: PatchInstance; variant?: PatchTileVariant }) {
  const patch = getPatchConfig(item);
  const bounds = getPatchBounds(item);
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
        </span>
      ))}
      <span className="organizm-patch-shape__glyph">{patch.kind === "active" ? "A" : "P"}</span>
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
      <span className="organizm-patch-module__label">{patch.shortTitle}</span>
      <span className="organizm-patch-module__level">{levelToRoman(item.level)}</span>
      <span className="organizm-patch-module__mode">{patch.kind === "active" ? "A" : "P"}</span>
    </span>
  );
}
