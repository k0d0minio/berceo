/**
 * Single source of truth for the proposal's copy and structure.
 *
 * The page renders itself from `sections` — add, remove or reorder entries here
 * and both the nav and the document body follow. Body content for each section
 * lives in `src/components/proposal/sections/`, keyed by `id`.
 */

export const proposal = {
  /** Shown in the header and the browser tab. */
  client: "Berceo",
  title: "Lead Engineer — Proposal",
  subtitle: "Technical assessment, scope and engagement terms",

  author: {
    name: "Jamie Nisbet",
    role: "Software Engineer & AI Consultant",
    location: "Mafra, Portugal",
    email: "jamie.nisbet@outlook.be",
  },

  /** Free-form label — kept out of Date logic so the build stays deterministic. */
  date: "",
  version: "Draft",

  /** One-line summary rendered under the title. Replace with the real pitch. */
  standfirst: "",
} as const;

export type SectionId =
  | "summary"
  | "understanding"
  | "scope"
  | "approach"
  | "timeline"
  | "commercials"
  | "risks"
  | "next-steps";

export type Section = {
  id: SectionId;
  /** Nav label — keep short. */
  nav: string;
  /** Heading rendered above the section body. */
  title: string;
  /** Optional one-line description under the heading. */
  description?: string;
};

export const sections: Section[] = [
  {
    id: "summary",
    nav: "Summary",
    title: "Executive summary",
    description: "The proposal in a page.",
  },
  {
    id: "understanding",
    nav: "Context",
    title: "What I understand you're building",
    description: "Product, market and the constraints that shape the build.",
  },
  {
    id: "scope",
    nav: "Scope",
    title: "Scope",
    description: "What is in V1, what is deferred, and what is out.",
  },
  {
    id: "approach",
    nav: "Approach",
    title: "Technical approach",
    description: "Stack, architecture and how I'd de-risk the unknowns.",
  },
  {
    id: "timeline",
    nav: "Timeline",
    title: "Phasing & timeline",
  },
  {
    id: "commercials",
    nav: "Terms",
    title: "Engagement & commercials",
  },
  {
    id: "risks",
    nav: "Risks",
    title: "Risks & open questions",
    description: "Decisions I need from you before work starts.",
  },
  {
    id: "next-steps",
    nav: "Next steps",
    title: "Next steps",
  },
];
