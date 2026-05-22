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
    <header className="relative overflow-hidden border-b border-neutral-200 bg-neutral-50">
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-emerald-50 via-cyan-50 to-transparent" />
      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-5 py-10 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-5 flex flex-wrap gap-2">
            {profile.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-neutral-200 bg-white/80 px-3 py-1 text-xs font-medium text-neutral-700"
              >
                {tag}
              </span>
            ))}
          </div>

          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            {profile.role}
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold text-neutral-950 sm:text-5xl lg:text-6xl">
            {profile.name}
          </h1>

          <div className="mt-6 space-y-4 text-base leading-8 text-neutral-700 sm:text-lg">
            {profile.pitch.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href="#assistant"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Спросить CV-ассистента
            </a>
            <a
              href={publicAsset(contacts.pdfPath)}
              download
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-900 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-950"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Скачать PDF
            </a>
            <a
              href={contacts.telegram}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-900 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-950"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              Telegram
            </a>
            <a
              href={contacts.linkedIn}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-900 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-950"
            >
              <Linkedin className="h-4 w-4" aria-hidden="true" />
              LinkedIn
            </a>
            <a
              href="#experience"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-transparent px-5 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-white hover:text-neutral-950"
            >
              Опыт и проекты
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        <aside className="lg:justify-self-end">
          {showPhoto ? (
            <div className="mx-auto w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-3 shadow-soft">
              <img
                src={publicAsset(profile.photoPath)}
                alt="Артём Кондратенко"
                className="aspect-[4/5] w-full rounded-lg object-cover"
                onError={() => setShowPhoto(false)}
              />
            </div>
          ) : (
            <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-soft">
              <p className="text-sm leading-6 text-neutral-600">
                {profile.role}
              </p>
            </div>
          )}
        </aside>
      </div>
    </header>
  );
}
