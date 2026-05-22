import { ExternalLink } from "lucide-react";
import type { Project } from "../types/cv";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-950">{project.title}</h3>
          <p className="mt-1 text-sm font-medium text-emerald-800">{project.type}</p>
        </div>
        {project.link ? (
          <a
            href={project.link.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-800 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-900"
          >
            {project.link.label}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        ) : null}
      </div>

      {project.focus ? (
        <p className="mt-4 text-sm leading-6 text-neutral-500">
          <span className="font-semibold text-neutral-700">Focus:</span> {project.focus}
        </p>
      ) : null}

      <p className="mt-4 text-sm leading-6 text-neutral-700">{project.description}</p>

      {project.demonstrates?.length ? (
        <div className="mt-5">
          <p className="text-sm font-semibold text-neutral-950">Что показывает</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-700">
            {project.demonstrates.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {project.analyticsNote ? (
        <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
          {project.analyticsNote}
        </p>
      ) : null}
    </article>
  );
}
