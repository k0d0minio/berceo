import { catalogue } from "./locale";

/**
 * The holding page at `/`, moved here verbatim from the old `site.ts`.
 *
 * Nothing here may state a price, a launch date, or a contact address: none of
 * those have been agreed, and a blank is the correct state until they are.
 * The vitrine replaces this page, and this file with it.
 */
export const holding = catalogue({
  fr: {
    name: "Berceo",

    /**
     * The promise, split into two beats — the second beat is the one the page
     * prints in the accent colour, so it has to stand on its own.
     */
    headline: ["Votre bébé est entre", "de bonnes mains."],

    /**
     * One sentence, plain terms, no selling.
     * @relecture Surya — dit « diplômées » ; à revoir si les étudiantes sages-femmes sont admises (D-7).
     */
    blurb:
      "Berceo met en relation les familles avec des professionnelles de santé diplômées pour des gardes de nuit à domicile.",

    /** Bottom-of-screen status. Present tense, no promised date. */
    status: "Site en construction",

    meta: {
      title: "Berceo — Site en construction",
      description:
        "Berceo met en relation les familles avec des professionnelles de santé diplômées pour des gardes de nuit à domicile. Le site est en cours de construction.",
    },
  },
});
