import { Bot, ChevronDown, Linkedin, Mail, Send, UserRound } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { isAssistantApiEnabled, sendAssistantMessage } from "../lib/assistantApi";
import { findAssistantFallbackAnswer } from "../lib/assistantFallback";
import { sanitizeAssistantAnswer } from "../lib/assistantPublicAnswer";
import type {
  AssistantChatMessage,
  AssistantData,
  AssistantSuggestedCta,
  ContactLinks,
} from "../types/cv";

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
  return value.trim().toLowerCase().replace(/[?!.…]+$/, "").trim().replace(/\s+/g, " ");
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

const telegramCtaQuestionIds = new Set(["current-project", "contact", "mobile-f2p", "salary", "work-format"]);

export function AssistantChat({ data, contacts }: AssistantChatProps) {
  const apiEnabled = isAssistantApiEnabled();
  const isDevMode = import.meta.env.DEV;
  const initialAssistantMode: AssistantMode = apiEnabled ? "idle" : "fallback";
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showExamples, setShowExamples] = useState(true);
  const [assistantMode, setAssistantMode] = useState<AssistantMode>(initialAssistantMode);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: data.identity,
    },
  ]);
  const messageLogRef = useRef<HTMLDivElement>(null);
  const examplesToggleRef = useRef<HTMLButtonElement>(null);

  const questionByLabel = useMemo(() => {
    return new Map(data.quickQuestions.map((question) => [normalize(question.label), question]));
  }, [data.quickQuestions]);
  const exampleQuestions = data.quickQuestions.filter((question) => question.isExample);
  const showFallbackNotice = assistantMode === "fallback" && !isLoading && messages.length > 1;

  useEffect(() => {
    const messageLog = messageLogRef.current;
    if (messageLog) {
      messageLog.scrollTop = messageLog.scrollHeight;
    }
  }, [messages, isLoading]);

  function getScriptedAnswer(question: string): ScriptedAnswer {
    const fallbackAnswer = findAssistantFallbackAnswer(question);

    if (fallbackAnswer) {
      return fallbackAnswer;
    }

    const quickQuestion = questionByLabel.get(normalize(question));

    if (quickQuestion) {
      return sanitizeAssistantAnswer({
        answer: data.answers[quickQuestion.id] ?? data.fallbackAnswer,
        suggestedCta: telegramCtaQuestionIds.has(quickQuestion.id) ? "telegram" : null,
      });
    }

    return sanitizeAssistantAnswer({
      answer: data.fallbackAnswer,
      suggestedCta: "telegram",
    });
  }

  async function askAssistant(question: string) {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || isLoading) {
      return;
    }

    const history: AssistantChatMessage[] = messages.map(({ role, text }) => ({ role, content: text }));
    const userMessage: Message = { role: "user", text: trimmedQuestion };

    if (messages.length === 1) {
      setShowExamples(false);
    }
    setMessages((current) => [...current, userMessage]);
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
      const scriptedAnswer = getScriptedAnswer(trimmedQuestion);
      setAssistantMode("fallback");

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
    if (!question || isLoading) {
      return;
    }

    setInput("");
    void askAssistant(question);
  }

  return (
    <div
      id="assistant-chat"
      className="mx-auto w-full max-w-3xl scroll-mt-40 rounded-2xl border border-white/10 bg-slate-900/70 shadow-soft lg:scroll-mt-32"
    >
      <header className="flex items-center gap-3 border-b border-white/10 px-3 py-4 sm:px-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-teal-300/20 bg-teal-300/10 text-teal-200">
          <Bot className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-semibold text-slate-50">CV-ассистент</h2>
      </header>

      <div className="space-y-4 px-3 py-4 sm:px-6 sm:py-5">
        <div
          ref={messageLogRef}
          role="log"
          aria-label="Переписка с CV-ассистентом"
          className="max-h-[min(36rem,60vh)] space-y-4 overflow-y-auto"
        >
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
                  className={`min-w-0 max-w-[85%] break-words rounded-lg px-3 py-2.5 text-[15px] leading-6 sm:px-4 sm:py-3 sm:text-base sm:leading-7 ${
                    message.role === "user"
                      ? "bg-teal-300 text-slate-950"
                      : "border border-white/10 bg-white/5 text-slate-300"
                  }`}
                >
                  <p>{message.text}</p>
                  {message.usedFallback ? (
                    <p className="mt-2 text-sm leading-6 text-slate-500">Базовый ответ по CV</p>
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

        {showFallbackNotice ? (
          <p role="status" className="rounded-lg border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-sm leading-6 text-amber-100">
            {data.basicIdentity}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="min-h-12 w-full min-w-0 rounded-lg border border-white/20 bg-slate-950/70 px-3 py-2 text-base text-slate-100 outline-none transition placeholder:text-sm placeholder:text-slate-400 focus:border-teal-300/60 focus:ring-4 focus:ring-teal-300/10 sm:px-4 sm:placeholder:text-base"
            aria-label="Вопрос CV-ассистенту"
            placeholder="Спросите про опыт, проекты или стек"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex min-h-12 items-center justify-center gap-2 justify-self-end rounded-lg bg-teal-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-teal-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Отправить
            <Send className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>

        <div>
          <button
            ref={examplesToggleRef}
            type="button"
            onClick={() => setShowExamples((open) => !open)}
            aria-expanded={showExamples}
            aria-controls="assistant-example-questions"
            className="inline-flex min-h-11 items-center gap-1.5 rounded text-sm font-medium text-slate-300 transition hover:text-teal-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300 sm:min-h-9"
          >
            Примеры вопросов
            <ChevronDown className={`h-4 w-4 ${showExamples ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>
          <div id="assistant-example-questions" hidden={!showExamples}>
            <div className="mt-1 flex flex-wrap gap-2">
              {exampleQuestions.map((question) => (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => {
                    examplesToggleRef.current?.focus({ preventScroll: true });
                    void askAssistant(question.label);
                  }}
                  disabled={isLoading}
                  className="min-h-11 max-w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-left text-sm leading-5 text-slate-200 transition hover:border-teal-300/40 hover:bg-teal-300/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-9"
                >
                  {question.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isDevMode ? (
          <p className="text-xs leading-5 text-slate-400">
            dev: endpoint configured: {apiEnabled ? "yes" : "no"}; mode: {assistantMode}
          </p>
        ) : null}
      </div>
    </div>
  );
}
