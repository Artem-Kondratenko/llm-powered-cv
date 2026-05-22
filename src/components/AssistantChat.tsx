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
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800">
            <Bot className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-neutral-950">CV-ассистент v1</h3>
            <p className="text-sm text-neutral-500">Scripted FAQ, без выдумывания опыта</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {data.quickQuestions.map((question) => (
            <button
              key={question.id}
              type="button"
              onClick={() => answerQuestion(question.id, question.label)}
              className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-left text-sm font-medium leading-5 text-neutral-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-950"
            >
              {question.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-[520px] flex-col rounded-lg border border-neutral-200 bg-white shadow-sm">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" ? (
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800">
                  <Bot className="h-4 w-4" aria-hidden="true" />
                </div>
              ) : null}
              <p
                className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-6 ${
                  message.role === "user"
                    ? "bg-neutral-950 text-white"
                    : "border border-neutral-200 bg-neutral-50 text-neutral-700"
                }`}
              >
                {message.text}
              </p>
              {message.role === "user" ? (
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="border-t border-neutral-200 p-3 sm:p-4">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="min-h-11 min-w-0 flex-1 rounded-lg border border-neutral-200 px-4 py-2 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
              placeholder="Спросите про опыт, проекты или стек"
            />
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
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
