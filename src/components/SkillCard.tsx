import type { Skill } from "../types/cv";

type SkillCardProps = {
  skill: Skill;
};

export function SkillCard({ skill }: SkillCardProps) {
  return (
    <article className="h-full rounded-lg border border-white/10 bg-slate-900/70 p-6 shadow-soft transition hover:-translate-y-0.5 hover:border-teal-300/30 hover:bg-slate-900">
      <h3 className="text-lg font-semibold text-slate-50">{skill.title}</h3>
      <p className="mt-3 text-[17px] leading-8 text-slate-300">{skill.description}</p>
    </article>
  );
}
