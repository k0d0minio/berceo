import Image from "next/image"

import { photoSize } from "@/content/photos"
import { cn } from "@/lib/utils"

/*
 * A photograph of the DA's bank, in a 32 px frame. Its alt text comes from
 * the catalogue with it (src/content/photos.ts); nothing here writes words.
 *
 * `fillHeight` is the first screen's mode (premier-ecran): from lg the frame
 * stretches to its grid row, the text block beside it, and the picture is
 * cropped to cover it; below lg it keeps its 16:9. Cropped to the row's
 * height, the picture is drawn wider than its 22rem column, hence the sizes.
 */
function Photo({
  photo,
  preload = false,
  fillHeight = false,
  sizes = fillHeight
    ? "(min-width: 64rem) 62rem, 100vw"
    : "(min-width: 48rem) 50vw, 100vw",
  className,
}: {
  photo: { src: string; alt: string }
  preload?: boolean
  fillHeight?: boolean
  sizes?: string
  className?: string
}) {
  return (
    <Image
      src={photo.src}
      alt={photo.alt}
      width={photoSize.width}
      height={photoSize.height}
      sizes={sizes}
      preload={preload}
      className={cn(
        "h-auto w-full rounded-carte object-cover",
        fillHeight && "lg:h-full lg:self-stretch",
        className
      )}
    />
  )
}

export { Photo }
