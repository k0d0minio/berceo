import { Fredoka, Nunito } from "next/font/google";

/*
 * Every typeface the site loads is bound here, and only here.
 *
 * `titre` is the DA's display slot: Comodo, in capitals only (globals.css),
 * for H1, H2, the navigation and short taglines. Surya
 * delivers the Comodo files and licence through the Drive (JAM-308); until
 * they are in the repo, Fredoka stands in (Jamie, 2026-11-19, JAM-327): a
 * rounded sans as Comodo is, SIL OFL, in its weights 500 and 600. To swap,
 * replace this one binding with `next/font/local` pointing at the Comodo
 * files and keep the variable name: globals.css reads `--font-titre`, nothing
 * else names the face.
 */
export const titre = Fredoka({
  variable: "--font-titre",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

/* Nunito carries every functional text: body, buttons, fields, cards. */
export const texte = Nunito({
  variable: "--font-texte",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

