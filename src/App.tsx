import { AssistantChat } from "./components/AssistantChat";
import { ContactBar } from "./components/ContactBar";
import { ExperienceCard } from "./components/ExperienceCard";
import { GamePlaceholder } from "./components/GamePlaceholder";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { ProjectCard } from "./components/ProjectCard";
import { Section } from "./components/Section";
import { SkillCard } from "./components/SkillCard";
import { StackGroup } from "./components/StackGroup";
import { assistantData } from "./data/assistantData";
import { cvData } from "./data/cvData";

export function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header profile={cvData.profile} contacts={cvData.contacts} />
      <Hero profile={cvData.profile} contacts={cvData.contacts} />

      <main className="relative">
        <Section
          id="value"
          eyebrow="Scope"
          title="Что я закрываю"
          description="Короткая карта задач, где Артём может быть полезен как Game Designer Generalist."
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cvData.skills.map((skill) => (
              <SkillCard key={skill.title} skill={skill} />
            ))}
          </div>
        </Section>

        <Section
          id="assistant"
          eyebrow="Interactive CV"
          title="CV-ассистент"
          description="Быстрый scripted-chat по опыту, проектам, стеку и pet-проектам."
        >
          <AssistantChat data={assistantData} contacts={cvData.contacts} />
        </Section>

        <Section
          id="experience"
          eyebrow="Experience"
          title="Опыт"
          description="Коммерческие и project-based роли с фокусом на мобильные и Telegram-игры."
        >
          <div className="grid gap-6">
            {cvData.experience.map((item) => (
              <ExperienceCard key={item.company} item={item} />
            ))}
          </div>
        </Section>

        <Section
          id="projects"
          eyebrow="Projects"
          title="Проекты"
          description="Проекты, которые можно открыть, обсудить или использовать как контекст для интервью."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            {cvData.projects.map((project) => (
              <ProjectCard key={project.title} project={project} />
            ))}
          </div>
        </Section>

        <Section
          id="stack"
          eyebrow="Stack"
          title="Стек"
          description="Инструменты, игровые системы, аналитика и AI-прототипирование."
        >
          <div className="grid gap-5 md:grid-cols-2">
            {cvData.stackGroups.map((group) => (
              <StackGroup key={group.title} group={group} />
            ))}
          </div>
        </Section>

        <Section
          id="proof-game"
          eyebrow="Future slot"
          title="Proof-of-work"
          description="Место под будущую мини-игру, не связанное с основным CV-сценарием."
        >
          <GamePlaceholder game={cvData.gamePlaceholder} />
        </Section>
      </main>

      <footer className="border-t border-white/10 bg-slate-950 py-12">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8">
          <div className="mb-5 text-center">
            <h2 className="text-2xl font-semibold text-slate-50">Связаться с Артёмом</h2>
            <p className="mt-2 text-base text-slate-400">
              Telegram обычно самый быстрый способ обсудить роль, проект или интервью.
            </p>
          </div>
          <ContactBar contacts={cvData.contacts} />
        </div>
      </footer>
    </div>
  );
}
