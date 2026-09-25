import Link from "next/link"

import { Button } from "@/components/ui/button"

/*
 * A page that exists before its text does: the H1, one sentence saying the
 * text is coming, and an optional soft call to action. Used by the founders'
 * story and the two legal pages until their texts arrive.
 */
function PlaceholderPage({
  title,
  text,
  closing,
  cta,
}: {
  title: string
  text: string
  closing?: string
  cta?: { label: string; href: string }
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-16 md:px-8 md:py-24">
      <h1 className="font-display text-h1 text-encre-sauge">{title}</h1>
      <p className="text-intro">{text}</p>
      {closing ? <p>{closing}</p> : null}
      {cta ? (
        <Button asChild variant="sauge" className="self-start">
          <Link href={cta.href}>{cta.label}</Link>
        </Button>
      ) : null}
    </div>
  )
}

export { PlaceholderPage }
