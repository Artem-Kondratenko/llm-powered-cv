import type { StackGroup as StackGroupType } from "../types/cv";

type StackGroupProps = {
  group: StackGroupType;
};

export function StackGroup({ group }: StackGroupProps) {
  return (
    <article className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-neutral-950">{group.title}</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {group.items.map((item) => (
          <span
            key={item}
            className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm text-neutral-700"
          >
            {item}
          </span>
        ))}
      </div>
    </article>
  );
}
