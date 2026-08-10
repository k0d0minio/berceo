import { proposal, sections } from "@/content/proposal";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-6">
        <a
          href="#top"
          className="font-heading text-sm font-semibold tracking-tight"
        >
          {proposal.client}
          <span className="ml-2 font-sans font-normal text-muted-foreground">
            {proposal.title}
          </span>
        </a>

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

        <div className="ml-auto md:ml-0">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
