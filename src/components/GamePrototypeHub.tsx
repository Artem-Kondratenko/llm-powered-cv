import { Construction, Lock, Play, X } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { gamePrototypeSlots } from "../data/gamePrototypeSlots";
import type { GamePrototypeSlot } from "../data/gamePrototypeSlots";
import { StroikaVekaGame } from "./StroikaVekaGame";
import "./GamePrototypeHub.css";

function getSlotIcon(slot: GamePrototypeSlot) {
  if (slot.status === "prototype") {
    return <Construction className="h-5 w-5" aria-hidden="true" />;
  }

  return <Lock className="h-5 w-5" aria-hidden="true" />;
}

function PrototypePreview({ kind }: { kind: GamePrototypeSlot["previewKind"] }) {
  if (kind !== "stroika") {
    return (
      <div className="prototype-card__preview prototype-card__preview--placeholder" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    );
  }

  return (
    <div className="prototype-card__preview prototype-card__preview--stroika" aria-hidden="true">
      <div className="prototype-preview__stamp">ПРОТОТИП</div>
      <div className="prototype-preview__label">ГЕНПЛАН</div>
      <div className="prototype-preview__road prototype-preview__road--main" />
      <div className="prototype-preview__road prototype-preview__road--cross" />
      <div className="prototype-preview__building prototype-preview__building--tower" />
      <div className="prototype-preview__building prototype-preview__building--block" />
      <div className="prototype-preview__building prototype-preview__building--palace" />
      <div className="prototype-preview__marker">СТРОЙКА ВЕКА</div>
    </div>
  );
}

function GamePrototypeCard({
  slot,
  expanded,
  onOpen,
  onClose,
  children,
}: {
  slot: GamePrototypeSlot;
  expanded: boolean;
  onOpen: () => void;
  onClose: () => void;
  children?: ReactNode;
}) {
  const isPlayable = slot.status === "prototype";

  return (
    <article className={`prototype-card${expanded ? " prototype-card--expanded" : ""}`}>
      <div className="prototype-card__body">
        <div className="prototype-card__content">
          <div className="prototype-card__topline">
            <div className="prototype-card__icon">{getSlotIcon(slot)}</div>
            <span className={`prototype-card__status prototype-card__status--${slot.status}`}>{slot.statusLabel}</span>
          </div>
          <h3>{slot.title}</h3>
          <p>{slot.description}</p>
          <button type="button" onClick={onOpen} disabled={!isPlayable} className="prototype-card__cta">
            <Play className="h-4 w-4" aria-hidden="true" />
            {slot.ctaLabel}
          </button>
        </div>
        <PrototypePreview kind={slot.previewKind} />
      </div>

      {expanded ? (
        <div className="prototype-card__expanded">
          <div className="prototype-card__expanded-header">
            <span>Playable prototype</span>
            <button type="button" onClick={onClose} className="prototype-card__close">
              <X className="h-4 w-4" aria-hidden="true" />
              Свернуть
            </button>
          </div>
          {children}
        </div>
      ) : null}
    </article>
  );
}

export function GamePrototypeHub() {
  const [expandedPrototypeId, setExpandedPrototypeId] = useState<string | null>(null);

  return (
    <div className="prototype-hub">
      {gamePrototypeSlots.map((slot) => {
        const expanded = expandedPrototypeId === slot.id;

        return (
          <GamePrototypeCard
            key={slot.id}
            slot={slot}
            expanded={expanded}
            onOpen={() => setExpandedPrototypeId(slot.id)}
            onClose={() => setExpandedPrototypeId(null)}
          >
            {expanded && slot.id === "stroika-veka" ? <StroikaVekaGame /> : null}
          </GamePrototypeCard>
        );
      })}
    </div>
  );
}
