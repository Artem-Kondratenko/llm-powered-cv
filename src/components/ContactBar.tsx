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
      : "flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-center";

  const linkClass =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-900";

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
