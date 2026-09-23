import type { Viewport } from "next";
import type { ReactNode } from "react";

import { karla } from "../fonts";
import { themeColorNuit } from "../theme-color";

/*
 * The holding page keeps the night until the vitrine replaces it: Karla for
 * text and the `.nuit` palette (src/app/globals.css), scoped to this route
 * group so the light platform never sees either.
 */
export const viewport: Viewport = {
  themeColor: themeColorNuit,
  colorScheme: "dark",
};

export default function HoldingLayout({ children }: { children: ReactNode }) {
  return <div className={`nuit ${karla.variable}`}>{children}</div>;
}
