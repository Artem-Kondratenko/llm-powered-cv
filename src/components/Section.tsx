import type { ReactNode } from "react";

type SectionProps = {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
};

export function Section({ id, eyebrow, title, description, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-36 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-3xl">
          {eyebrow ? (
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-teal-300">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-3xl font-semibold text-slate-50 sm:text-4xl">{title}</h2>
          {description ? (
            <p className="mt-4 text-[17px] leading-8 text-slate-300">{description}</p>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}
