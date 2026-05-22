import { Bot, Send, UserRound } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import type { AssistantData } from "../types/cv";

type Message = {
  role: "assistant" | "user";
  text: string;
};

type AssistantChatProps = {
  data: AssistantData;
};

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function AssistantChat({ data }: AssistantChatProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: data.identity,
    },
  ]);

  const questionByLabel = useMemo(() => {
    return new Map(data.quickQuestions.map((question) => [normalize(question.label), question]));
  }, [data.quickQuestions]);

  function answerQuestion(questionId: string, label: string) {
    const answer = data.answers[questionId] ?? data.fallbackAnswer;
    setMessages((current) => [
      ...current,
      { role: "user", text: label },
      { role: "assistant", text: answer },
    ]);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const question = input.trim();
    if (!question) {
      return;
    }

    const quickQuestion = questionByLabel.get(normalize(question));
    const answer = quickQuestion ? data.answers[quickQuestion.id] : data.fallbackAnswer;

    setMessages((current) => [
      ...current,
      { role: "user", text: question },
      { role: "assistant", text: answer },
    ]);
    setInput("");
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
            <p className="text-sm text-slate-400">Scripted FAQ, без выдумывания опыта</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2.5">
          {data.quickQuestions.map((question) => (
            <button
              key={question.id}
              type="button"
              onClick={() => answerQuestion(question.id, question.label)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-sm font-medium leading-6 text-slate-300 transition hover:border-teal-300/40 hover:bg-teal-300/10 hover:text-white"
            >
              {question.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-[560px] flex-col rounded-lg border border-white/10 bg-slate-900/70 shadow-soft">
        <div className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" ? (
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-teal-300/20 bg-teal-300/10 text-teal-200">
                  <Bot className="h-4 w-4" aria-hidden="true" />
                </div>
              ) : null}
              <p
                className={`max-w-[85%] rounded-lg px-4 py-3 text-[16px] leading-7 ${
                  message.role === "user"
                    ? "bg-teal-300 text-slate-950"
                    : "border border-white/10 bg-white/5 text-slate-300"
                }`}
              >
                {message.text}
              </p>
              {message.role === "user" ? (
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300">
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="border-t border-white/10 p-4 sm:p-5">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="min-h-12 min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-950/70 px-4 py-2 text-[16px] text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-teal-300/60 focus:ring-4 focus:ring-teal-300/10"
              placeholder="Спросите про опыт, проекты или стек"
            />
            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-teal-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-teal-200"
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
