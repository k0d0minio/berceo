/**
 * Every word on the holding page lives here.
 *
 * The page is a single screen with no navigation, so this file is the whole
 * copy deck. Keep it that way — if the site grows past one screen, split this
 * per-section rather than letting copy drift into the components.
 *
 * Nothing here may state a price, a launch date, or a contact address: none of
 * those have been agreed, and a blank is the correct state until they are.
 */

export const site = {
  name: "Berceo",

  /**
   * The promise, split into two beats — the second beat is the one the page
   * prints in the accent colour, so it has to stand on its own.
   */
  headline: ["Votre bébé est entre", "de bonnes mains."],

  /** One sentence, plain terms, no selling. */
  blurb:
    "Berceo met en relation les familles avec des professionnelles de santé diplômées pour des gardes de nuit à domicile.",

  /** Bottom-of-screen status. Present tense, no promised date. */
  status: "Site en construction",

  meta: {
    title: "Berceo — Site en construction",
    description:
      "Berceo met en relation les familles avec des professionnelles de santé diplômées pour des gardes de nuit à domicile. Le site est en cours de construction.",
  },
} as const;
