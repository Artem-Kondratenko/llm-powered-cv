import { ArrowDown, Download, Linkedin, MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import type { ContactLinks, Profile } from "../types/cv";
import { publicAsset } from "../utils/assets";

type HeroProps = {
  profile: Profile;
  contacts: ContactLinks;
};

export function Hero({ profile, contacts }: HeroProps) {
  const [showPhoto, setShowPhoto] = useState(Boolean(profile.photoPath));

  return (
    <section id="home" className="relative scroll-mt-36 overflow-hidden border-b border-white/10 bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(45,212,191,0.16),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(129,140,248,0.12),transparent_34%)]" />
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white/10 to-transparent" />
      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl items-center gap-12 px-5 pb-20 pt-40 sm:px-6 sm:pt-44 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-5 flex flex-wrap gap-2">
            {profile.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>

          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-teal-300">
            {profile.role}
          </p>
          <h1 className="max-w-3xl text-5xl font-semibold text-slate-50 sm:text-6xl lg:text-7xl">
            {profile.name}
          </h1>

          <div className="mt-7 max-w-2xl space-y-5 text-[17px] leading-8 text-slate-300 sm:text-lg sm:leading-9">
            {profile.pitch.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href="#assistant"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-teal-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-200"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Спросить CV-ассистента
            </a>
            <a
              href={publicAsset(contacts.pdfPath)}
              download
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-teal-300/40 hover:bg-teal-300/10 hover:text-white"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Скачать PDF
            </a>
            <a
              href={contacts.telegram}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-teal-300/40 hover:bg-teal-300/10 hover:text-white"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              Telegram
            </a>
            <a
              href={contacts.linkedIn}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-teal-300/40 hover:bg-teal-300/10 hover:text-white"
            >
              <Linkedin className="h-4 w-4" aria-hidden="true" />
              LinkedIn
            </a>
            <a
              href="#experience"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-transparent px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-slate-50"
            >
              Опыт и проекты
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        <aside className="lg:justify-self-end">
          {showPhoto ? (
            <div className="mx-auto w-full max-w-sm rounded-lg border border-white/10 bg-white/10 p-3 shadow-soft">
              <img
                src={publicAsset(profile.photoPath)}
                alt="Артём Кондратенко"
                className="aspect-[4/5] w-full rounded-lg object-cover"
                onError={() => setShowPhoto(false)}
              />
            </div>
          ) : (
            <div className="rounded-lg border border-white/10 bg-white/10 p-6 shadow-soft">
              <p className="text-sm leading-6 text-slate-400">
                {profile.role}
              </p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
