import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionProps = {
  id: string;
  /** Heading rendered above the section body. */
  title: string;
  /** Optional one-line description under the heading. */
  description?: string;
  children: ReactNode;
  className?: string;
};

/**
 * A titled block of a document page. `id` doubles as the scroll anchor that
 * in-page navigation links to.
 */
export function Section({
  id,
  title,
  description,
  children,
  className,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn("scroll-mt-24 border-t border-border py-14", className)}
    >
      <header className="mb-8">
        <h2
          id={`${id}-heading`}
          className="font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl"
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-base text-muted-foreground text-pretty">
            {description}
          </p>
        ) : null}
      </header>
      <div className="prose-proposal">{children}</div>
    </section>
  );
}

/** Placeholder for a section you haven't written yet. Delete as you fill in. */
export function Placeholder({ children }: { children?: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
      {children ?? "Content goes here."}
    </p>
  );
}
