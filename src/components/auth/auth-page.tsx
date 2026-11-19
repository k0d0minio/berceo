import * as React from "react"

/*
 * The frame of every account page (JAM-327): one column on sage, under the
 * header's logotype (DA, slide 4), the title in white capitals, an optional
 * intro in white, the form on a white card of 32 px with the DA's capsule
 * fields (slide 21).
 */
function AuthPage({
  title,
  eyebrow,
  intro,
  children,
}: {
  title: string
  eyebrow?: string
  intro?: readonly string[]
  children: React.ReactNode
}) {
  return (
    <div className="bg-sauge px-4 pt-6 pb-12 text-blanc [--ring:var(--blanc)] md:pt-10 md:pb-20">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <header className="flex flex-col gap-4">
          {eyebrow ? <p className="text-legende font-semibold">{eyebrow}</p> : null}
          <h1 className="font-display text-h1">{title}</h1>
          {intro?.map((line) => (
            <p key={line} className="text-intro">
              {line}
            </p>
          ))}
        </header>
        <div className="rounded-carte bg-blanc px-6 py-8 text-taupe [--ring:var(--sauge)] md:px-10 md:py-10">{children}</div>
      </div>
    </div>
  )
}

export { AuthPage }
