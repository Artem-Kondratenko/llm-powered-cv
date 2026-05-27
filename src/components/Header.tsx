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
    "inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-slate-50 focus:outline-none focus:ring-4 focus:ring-teal-300/15";
  const mobileNavLinkClass =
    "inline-flex min-h-10 min-w-0 items-center justify-center rounded-lg px-1.5 py-2 text-center text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-slate-50 focus:outline-none focus:ring-4 focus:ring-teal-300/15";
  const actionClass =
    "inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-teal-300/40 hover:bg-teal-300/10 hover:text-white focus:outline-none focus:ring-4 focus:ring-teal-300/15";
  const pdfActionClass =
    "inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-teal-200/50 bg-slate-100 px-3.5 py-2 text-sm font-semibold text-slate-950 transition hover:border-teal-100 hover:bg-teal-100 focus:outline-none focus:ring-4 focus:ring-teal-300/20";
  const assistantActionClass =
    "inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-teal-300 px-3.5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-200 focus:outline-none focus:ring-4 focus:ring-teal-300/20";
  const mobileActionClass =
    "inline-flex min-h-11 min-w-0 items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/10 px-1.5 py-2 text-center text-[11px] font-semibold leading-tight text-slate-100 transition hover:border-teal-300/40 hover:bg-teal-300/10 hover:text-white focus:outline-none focus:ring-4 focus:ring-teal-300/15";
  const mobilePdfActionClass =
    "inline-flex min-h-11 min-w-0 items-center justify-center gap-1 rounded-lg border border-teal-200/50 bg-slate-100 px-1.5 py-2 text-center text-[11px] font-semibold leading-tight text-slate-950 transition hover:border-teal-100 hover:bg-teal-100 focus:outline-none focus:ring-4 focus:ring-teal-300/20";
  const mobileAssistantActionClass =
    "inline-flex min-h-11 min-w-0 items-center justify-center gap-1 rounded-lg bg-teal-300 px-1.5 py-2 text-center text-[11px] font-semibold leading-tight text-slate-950 transition hover:bg-teal-200 focus:outline-none focus:ring-4 focus:ring-teal-300/20";

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <div className="mx-auto w-full max-w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 shadow-[0_18px_70px_rgba(0,0,0,0.36)] backdrop-blur-xl lg:max-w-7xl">
        <div className="hidden items-center justify-between gap-4 px-4 py-3 lg:flex lg:px-5">
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
            <a href={publicAsset(contacts.pdfPath)} download className={pdfActionClass}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Скачать PDF
            </a>
            <a href={contacts.telegram} target="_blank" rel="noreferrer" className={actionClass}>
              <Send className="h-4 w-4" aria-hidden="true" />
              Telegram
            </a>
            <a href={contacts.linkedIn} target="_blank" rel="noreferrer" className={actionClass}>
              <Linkedin className="h-4 w-4" aria-hidden="true" />
              LinkedIn
            </a>
            <a href="#assistant-chat" className={assistantActionClass}>
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              CV-ассистент
            </a>
          </div>
        </div>

        <div className="lg:hidden">
          <div
            className="grid grid-cols-4 gap-1.5 px-2 py-2.5"
            aria-label="Быстрые действия"
          >
            <a href={publicAsset(contacts.pdfPath)} download className={mobilePdfActionClass}>
              <Download className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>Скачать PDF</span>
            </a>
            <a href={contacts.telegram} target="_blank" rel="noreferrer" className={mobileActionClass}>
              <Send className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>Telegram</span>
            </a>
            <a href={contacts.linkedIn} target="_blank" rel="noreferrer" className={mobileActionClass}>
              <Linkedin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>LinkedIn</span>
            </a>
            <a href="#assistant-chat" className={mobileAssistantActionClass}>
              <MessageCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>CV-ассистент</span>
            </a>
          </div>
          <nav
            className="grid grid-cols-5 gap-1.5 border-t border-white/10 px-2 py-2"
            aria-label="Навигация по секциям"
          >
            {headerLinks.map((link) => (
              <a key={link.href} href={link.href} className={mobileNavLinkClass}>
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="hidden border-t border-white/10 px-4 pb-3 lg:block xl:hidden">
          <div className="flex flex-wrap justify-end gap-2 pt-3">
            <a href={publicAsset(contacts.pdfPath)} download className={pdfActionClass}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Скачать PDF
            </a>
            <a href={contacts.telegram} target="_blank" rel="noreferrer" className={actionClass}>
              <Send className="h-4 w-4" aria-hidden="true" />
              Telegram
            </a>
            <a href={contacts.linkedIn} target="_blank" rel="noreferrer" className={actionClass}>
              <Linkedin className="h-4 w-4" aria-hidden="true" />
              LinkedIn
            </a>
            <a href="#assistant-chat" className={assistantActionClass}>
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              CV-ассистент
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
