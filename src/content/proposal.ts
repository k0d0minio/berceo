/**
 * Single source of truth for the proposal’s copy and structure.
 *
 * The page renders itself from `sections` — add, remove or reorder entries here
 * and both the nav and the document body follow. Body content for each section
 * lives in `src/app/page.tsx`, keyed by `id`.
 */

export const proposal = {
  /** Shown in the header and the browser tab. */
  client: "Berceo",
  title: "Proposition — Lead Engineer",
  subtitle: "Cadrage, architecture et conditions d’engagement",

  author: {
    name: "Jamie Nisbet",
    role: "Ingénieur logiciel & consultant IA",
    location: "Mafra, Portugal",
    email: "jamie.nisbet@outlook.be",
  },

  /** Free-form label — kept out of Date logic so the build stays deterministic. */
  date: "Août 2026",
  version: "v1",

  /** One-line summary rendered under the title. */
  standfirst:
    "De votre cahier des charges à une plateforme en production : une démarche par phases, menée par un ingénieur senior qui construit des systèmes de zéro.",
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
    nav: "Essentiel",
    title: "L’essentiel",
    description: "La proposition en une page.",
  },
  {
    id: "understanding",
    nav: "Projet",
    title: "Votre projet",
    description: "Ce que j’ai compris, et ce qui conditionne la réussite.",
  },
  {
    id: "scope",
    nav: "Périmètre",
    title: "Périmètre",
    description: "Une V1 resserrée plutôt que tout construire d’un coup.",
  },
  {
    id: "approach",
    nav: "Approche",
    title: "Approche technique",
  },
  {
    id: "timeline",
    nav: "Phasage",
    title: "Phasage & rythme",
  },
  {
    id: "commercials",
    nav: "Conditions",
    title: "Conditions",
  },
  {
    id: "risks",
    nav: "Questions",
    title: "Questions à trancher",
    description:
      "Les décisions qui conditionnent le budget, le calendrier et la conformité.",
  },
  {
    id: "next-steps",
    nav: "Suite",
    title: "Prochaines étapes",
  },
];
