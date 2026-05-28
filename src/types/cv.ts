export type ContactLinks = {
  telegram: string;
  linkedIn: string;
  email: string;
  pdfPath: string;
};

export type Profile = {
  name: string;
  role: string;
  tags: string[];
  pitch: string[];
  photoPath: string;
};

export type NamedLink = {
  label: string;
  href: string;
};

export type ProjectImage = {
  src: string;
  thumbSrc: string;
  alt: string;
};

export type Skill = {
  title: string;
  description: string;
};

export type Experience = {
  company: string;
  role: string;
  period: string;
  project: string;
  bullets: string[];
  links?: NamedLink[];
};

export type Project = {
  title: string;
  type: string;
  focus?: string;
  description: string;
  link?: NamedLink;
  images?: ProjectImage[];
  demonstrates?: string[];
  analyticsNote?: string;
};

export type StackGroup = {
  title: string;
  items: string[];
};

export type CvData = {
  profile: Profile;
  contacts: ContactLinks;
  skills: Skill[];
  experience: Experience[];
  projects: Project[];
  stackGroups: StackGroup[];
};

export type QuickQuestion = {
  id: string;
  label: string;
};

export type AssistantData = {
  identity: string;
  quickQuestions: QuickQuestion[];
  answers: Record<string, string>;
  fallbackAnswer: string;
};

export type AssistantMessageRole = "assistant" | "user";

export type AssistantChatMessage = {
  role: AssistantMessageRole;
  content: string;
};

export type AssistantSuggestedCta = "telegram" | "linkedin" | "email" | null;

export type AssistantChatRequest = {
  message: string;
  history: AssistantChatMessage[];
};

export type AssistantChatResponse = {
  answer: string;
  suggestedCta: AssistantSuggestedCta;
};
