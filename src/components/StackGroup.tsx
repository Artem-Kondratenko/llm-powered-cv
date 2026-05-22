import type { StackGroup as StackGroupType } from "../types/cv";

type StackGroupProps = {
  group: StackGroupType;
};

export function StackGroup({ group }: StackGroupProps) {
  return (
    <article className="rounded-lg border border-white/10 bg-slate-900/70 p-6 shadow-soft">
      <h3 className="text-lg font-semibold text-slate-50">{group.title}</h3>
      <div className="mt-5 flex flex-wrap gap-2.5">
        {group.items.map((item) => (
          <span
            key={item}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[15px] text-slate-300"
          >
            {item}
          </span>
        ))}
      </div>
    </article>
  );
}
