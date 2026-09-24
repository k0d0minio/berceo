import { catalogue } from "./locale";

/**
 * The DA's image bank as the vitrine uses it (operator decision in Define,
 * V-3): four generated close-ups, committed as WebP under `public/photos/`.
 * Every photograph is 1600 × 900. The alt texts follow the guide's rule: say
 * what is seen and its context, one natural keyword, never a copy of the text
 * around the image.
 *
 * @relecture Surya — textes alternatifs rédigés selon la règle du guide ; les fondatrices choisissent encore les photos.
 */
export const photos = catalogue({
  fr: {
    bebeEndormi: {
      src: "/photos/bebe-endormi.webp",
      alt: "Nourrisson endormi dans une couverture en lin, pendant une garde de nuit à domicile",
    },
    mainDoigt: {
      src: "/photos/main-doigt.webp",
      alt: "La main d'un nourrisson serre le doigt d'un adulte, la nuit, à la maison",
    },
    mainsPieds: {
      src: "/photos/mains-pieds.webp",
      alt: "Un bébé assis tient son pied, sur un drap en lin clair",
    },
    oursBerceau: {
      src: "/photos/ours-berceau.webp",
      alt: "Un ours en peluche posé dans un berceau en bois, dans une chambre de bébé",
    },
  },
});

/** The size every photograph was exported at, for `next/image`. */
export const photoSize = { width: 1600, height: 900 } as const;
