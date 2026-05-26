import { ExternalLink } from "lucide-react";
import type { Project } from "../types/cv";
import { ProjectImageGallery } from "./ProjectImageGallery";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="group flex h-full flex-col rounded-xl border border-white/10 bg-slate-900/70 p-6 shadow-soft transition hover:border-teal-300/25 hover:bg-slate-900/85 sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-3 w-fit rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-teal-200">
            Project
          </p>
          <h3 className="text-2xl font-semibold text-slate-50">{project.title}</h3>
          <p className="mt-2 max-w-xl text-base font-medium leading-7 text-teal-300">
            {project.type}
          </p>
        </div>
        {project.link ? (
          <a
            href={project.link.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-teal-300/40 hover:bg-teal-300/10 hover:text-white"
          >
            {project.link.label}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        ) : null}
      </div>

      <ProjectImageGallery images={project.images} projectTitle={project.title} />

      {project.focus ? (
        <p className="mt-5 text-[15px] leading-7 text-slate-400">
          <span className="font-semibold text-slate-200">Focus:</span> {project.focus}
        </p>
      ) : null}

      <p className="mt-5 text-[17px] leading-8 text-slate-300">{project.description}</p>

      {project.demonstrates?.length ? (
        <div className="mt-6">
          <p className="text-base font-semibold text-slate-50">Что показывает</p>
          <ul className="mt-3 space-y-3 text-[17px] leading-8 text-slate-300">
            {project.demonstrates.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {project.analyticsNote ? (
        <p className="mt-6 rounded-lg border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-[16px] leading-7 text-amber-100">
          {project.analyticsNote}
        </p>
      ) : null}
    </article>
  );
}
