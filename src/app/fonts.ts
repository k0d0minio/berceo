import { Fraunces, Karla, Nunito } from "next/font/google";

/*
 * Every typeface the site loads is bound here, and only here.
 *
 * `titre` is the DA's display slot: Comodo, for titles and navigation. Surya
 * delivers the Comodo files and licence through the Drive; until they are in
 * the repo, Fraunces stands in. To swap, replace this one binding with
 * `next/font/local` pointing at the Comodo files and keep the variable name —
 * globals.css reads `--font-titre`, nothing else names the face.
 */
export const titre = Fraunces({
  variable: "--font-titre",
  subsets: ["latin"],
  display: "swap",
});

/* Nunito carries every functional text: body, buttons, fields, cards. */
export const texte = Nunito({
  variable: "--font-texte",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

/*
 * Karla is the holding page's text face and nothing else's. Only
 * src/app/(holding)/layout.tsx loads it, so the platform never downloads it.
 */
export const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
  display: "swap",
});
