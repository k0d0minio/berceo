import { Placeholder, Section } from "@/components/proposal/section";
import { Badge } from "@/components/ui/badge";
import { proposal, sections } from "@/content/proposal";

/**
 * The proposal. One page, one column, ordered by `sections` in
 * `src/content/proposal.ts`. Replace each `<Placeholder />` with real content —
 * the primitives in `src/components/proposal/blocks.tsx` (StatRow, Callout,
 * Terms) and any shadcn component in `src/components/ui/` are available.
 */
export default function Home() {
  return (
    <main id="top" className="mx-auto max-w-3xl px-6 pb-24">
      <header className="py-16 sm:py-24">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{proposal.client}</Badge>
          {proposal.version ? (
            <Badge variant="outline">{proposal.version}</Badge>
          ) : null}
          {proposal.date ? (
            <span className="text-sm text-muted-foreground">
              {proposal.date}
            </span>
          ) : null}
        </div>

        <h1 className="mt-6 font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {proposal.title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground text-pretty">
          {proposal.standfirst || proposal.subtitle}
        </p>

        <p className="mt-8 text-sm text-muted-foreground">
          {proposal.author.name} · {proposal.author.role} ·{" "}
          {proposal.author.location}
        </p>
      </header>

      {sections.map((section) => (
        <Section key={section.id} {...section}>
          <Placeholder>Write “{section.title}” here.</Placeholder>
        </Section>
      ))}
    </main>
  );
}
