import { catalogue } from "./locale";

/**
 * The one photograph of the holding page, from the DA's image bank, as main
 * holds it (src/content/photos.ts on main). The file is 1600 × 900 WebP under
 * `public/photos/`.
 *
 * @relecture Surya — texte alternatif rédigé selon la règle du guide.
 */
export const photos = catalogue({
  fr: {
    oursBerceau: {
      src: "/photos/ours-berceau.webp",
      alt: "Un ours en peluche posé dans un berceau en bois, dans une chambre de bébé",
    },
  },
});

/** The size every photograph was exported at, for `next/image`. */
export const photoSize = { width: 1600, height: 900 } as const;
