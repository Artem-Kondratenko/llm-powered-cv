import { ExternalLink } from "lucide-react";
import type { Experience } from "../types/cv";

type ExperienceCardProps = {
  item: Experience;
};

export function ExperienceCard({ item }: ExperienceCardProps) {
  return (
    <article className="rounded-lg border border-white/10 bg-slate-900/70 p-6 shadow-soft sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-slate-50">{item.company}</h3>
          <p className="mt-2 text-base font-medium text-slate-300">{item.role}</p>
        </div>
        <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-400">
          {item.period}
        </span>
      </div>

      <p className="mt-5 max-w-3xl text-[17px] leading-8 text-slate-300">{item.project}</p>

      <ul className="mt-5 space-y-3 text-[17px] leading-8 text-slate-300">
        {item.bullets.map((bullet) => (
          <li key={bullet} className="flex gap-3">
            <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-300" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>

      {item.links?.length ? (
        <div className="mt-6 flex flex-wrap gap-2.5">
          {item.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-teal-300/40 hover:bg-teal-300/10 hover:text-white"
            >
              {link.label}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          ))}
        </div>
      ) : null}
    </article>
  );
}
