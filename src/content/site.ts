/**
 * Every word on the holding page lives here. The title, the text and the
 * capsule are the DA's slide 29, « Site en construction », word for word
 * (main: `attente` in src/content/design-system.ts).
 *
 * Nothing here may state a price, a launch date, or a contact address: none of
 * those have been agreed, and a blank is the correct state until they are.
 */

export const site = {
  name: "Berceo",

  title: "Votre bébé est entre de bonnes mains",

  text: "Berceo met en relation les familles avec des professionnelles de santé diplômées pour des gardes de nuit à domicile.",

  status: "Site en construction",

  meta: {
    title: "Berceo · Site en construction",
    description:
      "Berceo met en relation les familles avec des professionnelles de santé diplômées pour des gardes de nuit à domicile. Le site est en cours de construction.",
  },
} as const;
