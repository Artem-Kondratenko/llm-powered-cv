import { Lock } from "lucide-react";
import type { GamePlaceholder as GamePlaceholderType } from "../types/cv";

type GamePlaceholderProps = {
  game: GamePlaceholderType;
};

export function GamePlaceholder({ game }: GamePlaceholderProps) {
  return (
    <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 text-cyan-800">
            <Lock className="h-5 w-5" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-950">{game.title}</h3>
          <p className="mt-3 text-base leading-7 text-neutral-700">{game.teaser}</p>
        </div>
        <button
          type="button"
          disabled
          className="inline-flex min-h-11 w-fit items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 px-5 py-2 text-sm font-semibold text-neutral-500"
        >
          {game.ctaLabel}
        </button>
      </div>
    </div>
  );
}
