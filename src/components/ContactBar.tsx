import { Download, Linkedin, Mail, Send } from "lucide-react";
import type { ContactLinks } from "../types/cv";
import { publicAsset } from "../utils/assets";

type ContactBarProps = {
  contacts: ContactLinks;
  variant?: "hero" | "footer";
};

export function ContactBar({ contacts, variant = "footer" }: ContactBarProps) {
  const className =
    variant === "hero"
      ? "grid gap-2 sm:grid-cols-2"
      : "flex flex-col gap-3 rounded-lg border border-white/10 bg-slate-900/70 p-5 shadow-soft sm:flex-row sm:flex-wrap sm:items-center sm:justify-center";

  const linkClass =
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-teal-300/40 hover:bg-teal-300/10 hover:text-white";

  return (
    <div className={className}>
      <a className={linkClass} href={contacts.telegram} target="_blank" rel="noreferrer">
        <Send className="h-4 w-4" aria-hidden="true" />
        Telegram
      </a>
      <a className={linkClass} href={contacts.linkedIn} target="_blank" rel="noreferrer">
        <Linkedin className="h-4 w-4" aria-hidden="true" />
        LinkedIn
      </a>
      <a className={linkClass} href={`mailto:${contacts.email}`}>
        <Mail className="h-4 w-4" aria-hidden="true" />
        Email
      </a>
      <a className={linkClass} href={publicAsset(contacts.pdfPath)} download>
        <Download className="h-4 w-4" aria-hidden="true" />
        Скачать PDF
      </a>
    </div>
  );
}
