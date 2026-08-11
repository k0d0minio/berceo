"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { proposal, sections } from "@/content/proposal";

export function SiteHeader() {
  const pathname = usePathname();
  const onProposal = pathname.startsWith("/proposition");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-6">
        <Link
          href="/"
          className="font-heading text-sm font-semibold tracking-tight"
        >
          {proposal.client}
          <span className="ml-2 font-sans font-normal text-muted-foreground">
            {onProposal ? proposal.title : "Questions de découverte"}
          </span>
        </Link>

        {onProposal ? (
          <nav aria-label="Sections" className="ml-auto hidden md:block">
            <ul className="flex items-center gap-5 text-sm text-muted-foreground">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="transition-colors hover:text-foreground"
                  >
                    {section.nav}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        <div
          className={
            onProposal
              ? "ml-auto flex items-center gap-4 md:ml-0"
              : "ml-auto flex items-center gap-4"
          }
        >
          <Link
            href={onProposal ? "/" : "/proposition"}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {onProposal ? "Questions" : "Proposition"}
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
