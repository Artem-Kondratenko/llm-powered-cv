import { Bot, Download, Linkedin, Mail, Send, UserRound } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { isAssistantApiEnabled, sendAssistantMessage } from "../lib/assistantApi";
import { findAssistantFallbackAnswer } from "../lib/assistantFallback";
import type {
  AssistantChatMessage,
  AssistantData,
  AssistantSuggestedCta,
  ContactLinks,
} from "../types/cv";
import { publicAsset } from "../utils/assets";

type Message = {
  role: "assistant" | "user";
  text: string;
  suggestedCta?: AssistantSuggestedCta;
  usedFallback?: boolean;
};

type AssistantChatProps = {
  data: AssistantData;
  contacts: ContactLinks;
};

type AssistantMode = "idle" | "llm" | "fallback";

type ScriptedAnswer = {
  answer: string;
  suggestedCta: AssistantSuggestedCta;
};

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function toApiHistory(messages: Message[]): AssistantChatMessage[] {
  return messages.map((message) => ({
    role: message.role,
    content: message.text,
  }));
}

function getCtaLabel(suggestedCta: AssistantSuggestedCta) {
  switch (suggestedCta) {
    case "telegram":
      return "Написать в Telegram";
    case "linkedin":
      return "Открыть LinkedIn";
    case "email":
      return "Написать Email";
    default:
      return null;
  }
}

function getCtaHref(suggestedCta: AssistantSuggestedCta, contacts: ContactLinks) {
  switch (suggestedCta) {
    case "telegram":
      return contacts.telegram;
    case "linkedin":
      return contacts.linkedIn;
    case "email":
      return `mailto:${contacts.email}`;
    default:
      return null;
  }
}

export function AssistantChat({ data, contacts }: AssistantChatProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fallbackNotice, setFallbackNotice] = useState("");
  const [assistantMode, setAssistantMode] = useState<AssistantMode>("idle");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: data.identity,
    },
  ]);

  const questionByLabel = useMemo(() => {
    return new Map(data.quickQuestions.map((question) => [normalize(question.label), question]));
  }, [data.quickQuestions]);

  const apiEnabled = isAssistantApiEnabled();
  const isDevMode = import.meta.env.DEV;

  function getScriptedAnswer(question: string, questionId?: string): ScriptedAnswer {
    const fallbackAnswer = findAssistantFallbackAnswer(question);

    if (fallbackAnswer) {
      return fallbackAnswer;
    }

    if (questionId) {
      return {
        answer: data.answers[questionId] ?? data.fallbackAnswer,
        suggestedCta: questionId === "contact" || questionId === "mobile-f2p" ? "telegram" : null,
      };
    }

    const quickQuestion = questionByLabel.get(normalize(question));

    if (quickQuestion) {
      return {
        answer: data.answers[quickQuestion.id] ?? data.fallbackAnswer,
        suggestedCta:
          quickQuestion.id === "contact" || quickQuestion.id === "mobile-f2p" ? "telegram" : null,
      };
    }

    return {
      answer: data.fallbackAnswer,
      suggestedCta: "telegram",
    };
  }

  async function askAssistant(question: string, questionId?: string) {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || isLoading) {
      return;
    }

    const history = toApiHistory(messages);
    const userMessage: Message = { role: "user", text: trimmedQuestion };

    setMessages((current) => [...current, userMessage]);
    setFallbackNotice("");
    setIsLoading(true);

    try {
      if (!apiEnabled) {
        throw new Error("Assistant API is not configured.");
      }

      const response = await sendAssistantMessage(trimmedQuestion, history);
      setAssistantMode("llm");

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: response.answer,
          suggestedCta: response.suggestedCta,
        },
      ]);
    } catch {
      const scriptedAnswer = getScriptedAnswer(trimmedQuestion, questionId);
      setAssistantMode("fallback");

      setFallbackNotice("Сейчас отвечаю в базовом режиме по CV. Если вопрос требует деталей, лучше написать Артёму напрямую.");
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: scriptedAnswer.answer,
          suggestedCta: scriptedAnswer.suggestedCta,
          usedFallback: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const question = input.trim();
    if (!question) {
      return;
    }

    setInput("");
    void askAssistant(question);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-lg border border-white/10 bg-slate-900/70 p-6 shadow-soft sm:p-7">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-teal-300/20 bg-teal-300/10 text-teal-200">
            <Bot className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-50">CV-ассистент v1</h3>
            <p className="text-sm text-slate-400">LLM при доступном backend, fallback без выдумывания опыта</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2.5">
          {data.quickQuestions.map((question) => (
            <button
              key={question.id}
              type="button"
              onClick={() => void askAssistant(question.label, question.id)}
              disabled={isLoading}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-sm font-medium leading-6 text-slate-300 transition hover:border-teal-300/40 hover:bg-teal-300/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {question.label}
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2.5 border-t border-white/10 pt-5">
          <a
            href={contacts.telegram}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-teal-300/40 hover:bg-teal-300/10 hover:text-white"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            Telegram
          </a>
          <a
            href={contacts.linkedIn}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-teal-300/40 hover:bg-teal-300/10 hover:text-white"
          >
            <Linkedin className="h-4 w-4" aria-hidden="true" />
            LinkedIn
          </a>
          <a
            href={publicAsset(contacts.pdfPath)}
            download
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-teal-300/40 hover:bg-teal-300/10 hover:text-white"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            PDF
          </a>
        </div>

        {isDevMode ? (
          <p className="mt-4 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs leading-5 text-slate-500">
            dev: endpoint configured: {apiEnabled ? "yes" : "no"}; mode: {assistantMode}
          </p>
        ) : null}
      </div>

      <div className="flex min-h-[560px] flex-col rounded-lg border border-white/10 bg-slate-900/70 shadow-soft">
        <div className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
          {messages.map((message, index) => {
            const ctaLabel = getCtaLabel(message.suggestedCta ?? null);
            const ctaHref = getCtaHref(message.suggestedCta ?? null, contacts);

            return (
              <div
                key={`${message.role}-${index}`}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" ? (
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-teal-300/20 bg-teal-300/10 text-teal-200">
                    <Bot className="h-4 w-4" aria-hidden="true" />
                  </div>
                ) : null}
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-3 text-[16px] leading-7 ${
                    message.role === "user"
                      ? "bg-teal-300 text-slate-950"
                      : "border border-white/10 bg-white/5 text-slate-300"
                  }`}
                >
                  <p>{message.text}</p>
                  {message.usedFallback ? (
                    <p className="mt-2 text-sm leading-6 text-slate-500">Ответ из fallback-базы</p>
                  ) : null}
                  {ctaLabel && ctaHref ? (
                    <a
                      href={ctaHref}
                      target={message.suggestedCta === "email" ? undefined : "_blank"}
                      rel={message.suggestedCta === "email" ? undefined : "noreferrer"}
                      className="mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-teal-300/30 bg-teal-300/10 px-3 py-2 text-sm font-semibold text-teal-100 transition hover:border-teal-300/60 hover:bg-teal-300/20"
                    >
                      {message.suggestedCta === "email" ? (
                        <Mail className="h-4 w-4" aria-hidden="true" />
                      ) : message.suggestedCta === "linkedin" ? (
                        <Linkedin className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Send className="h-4 w-4" aria-hidden="true" />
                      )}
                      {ctaLabel}
                    </a>
                  ) : null}
                </div>
                {message.role === "user" ? (
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300">
                    <UserRound className="h-4 w-4" aria-hidden="true" />
                  </div>
                ) : null}
              </div>
            );
          })}
          {isLoading ? (
            <div className="flex justify-start gap-3">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-teal-300/20 bg-teal-300/10 text-teal-200">
                <Bot className="h-4 w-4" aria-hidden="true" />
              </div>
              <p className="max-w-[85%] rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-[16px] leading-7 text-slate-400">
                Думаю над ответом...
              </p>
            </div>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="border-t border-white/10 p-4 sm:p-5">
          {fallbackNotice ? (
            <p className="mb-3 rounded-lg border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-sm leading-6 text-amber-100">
              {fallbackNotice}
            </p>
          ) : null}
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={isLoading}
              className="min-h-12 min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-950/70 px-4 py-2 text-[16px] text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-teal-300/60 focus:ring-4 focus:ring-teal-300/10"
              placeholder="Спросите про опыт, проекты или стек"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-teal-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Отправить вопрос"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
