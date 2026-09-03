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
   * The product thesis, split into two beats. Someone stays awake so the
   * parents can sleep — that is the entire service in two lines.
   */
  headline: ["Quelqu’un veille.", "Pour que vous dormiez."],

  /** One sentence, plain terms, no selling. */
  blurb:
    "Berceo met en relation les parents de nouveau-nés avec des professionnels de la garde de nuit.",

  /** Bottom-of-screen status. Present tense, no promised date. */
  status: "Site en construction",

  meta: {
    title: "Berceo — Site en construction",
    description:
      "Berceo met en relation les parents de nouveau-nés avec des professionnels de la garde de nuit. Le site est en cours de construction.",
  },
} as const;
