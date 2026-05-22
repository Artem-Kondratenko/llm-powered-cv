import { Lock } from "lucide-react";
import type { GamePlaceholder as GamePlaceholderType } from "../types/cv";

type GamePlaceholderProps = {
  game: GamePlaceholderType;
};

export function GamePlaceholder({ game }: GamePlaceholderProps) {
  return (
    <div className="rounded-lg border border-dashed border-teal-300/30 bg-slate-900/65 p-7 shadow-soft sm:p-9">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg border border-teal-300/20 bg-teal-300/10 text-teal-200">
            <Lock className="h-5 w-5" aria-hidden="true" />
          </div>
          <h3 className="text-2xl font-semibold text-slate-50">{game.title}</h3>
          <p className="mt-4 text-[17px] leading-8 text-slate-300">{game.teaser}</p>
        </div>
        <button
          type="button"
          disabled
          className="inline-flex min-h-11 w-fit items-center justify-center rounded-lg border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-slate-400"
        >
          {game.ctaLabel}
        </button>
      </div>
    </div>
  );
}
