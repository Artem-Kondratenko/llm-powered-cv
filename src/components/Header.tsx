import { Download, Linkedin, MessageCircle, Send } from "lucide-react";
import { headerLinks } from "../data/navigationData";
import type { ContactLinks, Profile } from "../types/cv";
import { publicAsset } from "../utils/assets";

type HeaderProps = {
  profile: Profile;
  contacts: ContactLinks;
};

export function Header({ profile, contacts }: HeaderProps) {
  const navLinkClass =
    "shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-slate-50";
  const actionClass =
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-teal-300/40 hover:bg-teal-300/10 hover:text-white";

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <div className="mx-auto max-w-7xl rounded-2xl border border-white/10 bg-slate-950/80 shadow-[0_18px_70px_rgba(0,0,0,0.36)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4 px-4 py-3 lg:px-5">
          <a href="#home" className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-50">{profile.name}</p>
            <p className="truncate text-xs text-slate-400">{profile.role}</p>
          </a>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Основная навигация">
            {headerLinks.map((link) => (
              <a key={link.href} href={link.href} className={navLinkClass}>
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 xl:flex">
            <a href={publicAsset(contacts.pdfPath)} download className={actionClass}>
              <Download className="h-4 w-4" aria-hidden="true" />
              PDF
            </a>
            <a href={contacts.telegram} target="_blank" rel="noreferrer" className={actionClass}>
              <Send className="h-4 w-4" aria-hidden="true" />
              Telegram
            </a>
            <a href={contacts.linkedIn} target="_blank" rel="noreferrer" className={actionClass}>
              <Linkedin className="h-4 w-4" aria-hidden="true" />
              LinkedIn
            </a>
            <a href="#assistant" className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-300 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-200">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Спросить
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 px-3 pb-3 lg:hidden">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pt-3" aria-label="Быстрые переходы">
            {headerLinks.map((link) => (
              <a key={link.href} href={link.href} className={navLinkClass}>
                {link.label}
              </a>
            ))}
            <a href={publicAsset(contacts.pdfPath)} download className={actionClass}>
              <Download className="h-4 w-4" aria-hidden="true" />
              PDF
            </a>
            <a href={contacts.telegram} target="_blank" rel="noreferrer" className={actionClass}>
              <Send className="h-4 w-4" aria-hidden="true" />
              Telegram
            </a>
            <a href={contacts.linkedIn} target="_blank" rel="noreferrer" className={actionClass}>
              <Linkedin className="h-4 w-4" aria-hidden="true" />
              LinkedIn
            </a>
            <a href="#assistant" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-teal-300 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-200">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Спросить
            </a>
          </div>
        </div>

        <div className="hidden border-t border-white/10 px-4 pb-3 lg:block xl:hidden">
          <div className="flex flex-wrap justify-end gap-2 pt-3">
            <a href={publicAsset(contacts.pdfPath)} download className={actionClass}>
              <Download className="h-4 w-4" aria-hidden="true" />
              PDF
            </a>
            <a href={contacts.telegram} target="_blank" rel="noreferrer" className={actionClass}>
              <Send className="h-4 w-4" aria-hidden="true" />
              Telegram
            </a>
            <a href={contacts.linkedIn} target="_blank" rel="noreferrer" className={actionClass}>
              <Linkedin className="h-4 w-4" aria-hidden="true" />
              LinkedIn
            </a>
            <a href="#assistant" className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-300 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-200">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Спросить CV-ассистента
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
