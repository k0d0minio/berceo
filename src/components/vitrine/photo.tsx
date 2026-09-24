import Image from "next/image"

import { photoSize } from "@/content/photos"
import { cn } from "@/lib/utils"

/*
 * A photograph of the DA's bank, in a 32 px frame. Its alt text comes from
 * the catalogue with it (src/content/photos.ts); nothing here writes words.
 */
function Photo({
  photo,
  preload = false,
  sizes = "(min-width: 48rem) 50vw, 100vw",
  className,
}: {
  photo: { src: string; alt: string }
  preload?: boolean
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
      className={cn("h-auto w-full rounded-carte object-cover", className)}
    />
  )
}

export { Photo }
