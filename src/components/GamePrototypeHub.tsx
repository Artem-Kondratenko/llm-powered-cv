import { Construction, Lock, Play, X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
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
            <div className="prototype-card__expanded-title">
              <span>Playable prototype</span>
              <strong>{slot.title}</strong>
            </div>
            <button type="button" onClick={onClose} className="prototype-card__close">
              <X className="h-4 w-4" aria-hidden="true" />
              Закрыть
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
  const [isMobileShellOpen, setIsMobileShellOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(max-width: 720px)");
    const syncMobileShell = () => setIsMobileShellOpen(Boolean(expandedPrototypeId) && mediaQuery.matches);

    syncMobileShell();
    mediaQuery.addEventListener("change", syncMobileShell);

    return () => mediaQuery.removeEventListener("change", syncMobileShell);
  }, [expandedPrototypeId]);

  useEffect(() => {
    if (!isMobileShellOpen) {
      return undefined;
    }

    const { body, documentElement } = document;
    const scrollY = window.scrollY;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPosition = body.style.position;
    const previousBodyTop = body.style.top;
    const previousBodyWidth = body.style.width;
    const previousBodyTouchAction = body.style.touchAction;
    const previousHtmlOverflow = documentElement.style.overflow;

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.touchAction = "none";
    documentElement.style.overflow = "hidden";

    return () => {
      body.style.overflow = previousBodyOverflow;
      body.style.position = previousBodyPosition;
      body.style.top = previousBodyTop;
      body.style.width = previousBodyWidth;
      body.style.touchAction = previousBodyTouchAction;
      documentElement.style.overflow = previousHtmlOverflow;
      window.scrollTo(0, scrollY);
    };
  }, [isMobileShellOpen]);

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
