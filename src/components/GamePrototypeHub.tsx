import { Construction, Lock } from "lucide-react";
import { gamePrototypeSlots } from "../data/gamePrototypeSlots";
import type { GamePrototypeSlot } from "../data/gamePrototypeSlots";

function getSlotIcon(slot: GamePrototypeSlot) {
  if (slot.status === "prototype") {
    return <Construction className="h-5 w-5" aria-hidden="true" />;
  }

  return <Lock className="h-5 w-5" aria-hidden="true" />;
}

function getStatusClass(slot: GamePrototypeSlot) {
  if (slot.status === "prototype") {
    return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  }

  return "border-white/10 bg-white/5 text-slate-300";
}

export function GamePrototypeHub() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {gamePrototypeSlots.map((slot) => (
        <article
          key={slot.title}
          className="flex h-full flex-col rounded-lg border border-white/10 bg-slate-900/70 p-6 shadow-soft transition hover:-translate-y-0.5 hover:border-teal-300/25 hover:bg-slate-900 sm:p-7"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-teal-300/20 bg-teal-300/10 text-teal-200">
              {getSlotIcon(slot)}
            </div>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getStatusClass(slot)}`}
            >
              {slot.statusLabel}
            </span>
          </div>

          <h3 className="mt-5 text-xl font-semibold text-slate-50">{slot.title}</h3>
          <p className="mt-3 flex-1 text-[16px] leading-7 text-slate-300">{slot.description}</p>

          <button
            type="button"
            disabled
            className="mt-5 inline-flex min-h-11 w-fit items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-400"
          >
            {slot.ctaLabel}
          </button>
        </article>
      ))}
    </div>
  );
}
