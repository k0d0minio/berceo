import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/*
 * tailwind-merge has to be told about the DA's type scale: without it,
 * `text-bouton` reads as a colour and `cn("text-bouton", "text-sauge")`
 * silently drops the size.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "h1",
            "h2",
            "nav",
            "h3",
            "intro",
            "corps",
            "bouton",
            "champ",
            "legende",
          ],
        },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
