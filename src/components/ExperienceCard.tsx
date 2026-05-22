import { ExternalLink } from "lucide-react";
import type { Experience } from "../types/cv";

type ExperienceCardProps = {
  item: Experience;
};

export function ExperienceCard({ item }: ExperienceCardProps) {
  return (
    <article className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-950">{item.company}</h3>
          <p className="mt-1 text-sm font-medium text-neutral-700">{item.role}</p>
        </div>
        <span className="w-fit rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600">
          {item.period}
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-neutral-700">{item.project}</p>

      <ul className="mt-4 space-y-2 text-sm leading-6 text-neutral-700">
        {item.bullets.map((bullet) => (
          <li key={bullet} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>

      {item.links?.length ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {item.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-800 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-900"
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
