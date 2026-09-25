import * as React from "react"

/*
 * The frame of every account page: one column, the title in the display
 * face, an optional intro, the form on a white card over pearl.
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
    <div className="bg-perle px-4 py-12 md:py-20">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <header className="flex flex-col gap-4">
          {eyebrow ? <p className="text-legende font-semibold text-encre-taupe">{eyebrow}</p> : null}
          <h1 className="font-display text-h1 text-encre-sauge">{title}</h1>
          {intro?.map((line) => (
            <p key={line} className="text-intro text-encre-taupe">
              {line}
            </p>
          ))}
        </header>
        <div className="rounded-carte bg-blanc px-6 py-8 md:px-10 md:py-10">{children}</div>
      </div>
    </div>
  )
}

export { AuthPage }
