import type { Skill } from "../types/cv";

type SkillCardProps = {
  skill: Skill;
};

export function SkillCard({ skill }: SkillCardProps) {
  return (
    <article className="h-full rounded-lg border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-soft">
      <h3 className="text-base font-semibold text-neutral-950">{skill.title}</h3>
      <p className="mt-3 text-sm leading-6 text-neutral-600">{skill.description}</p>
    </article>
  );
}
