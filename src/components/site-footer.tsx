import { proposal } from "@/content/proposal";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-3xl flex-col gap-1 px-6 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          {proposal.author.name} — {proposal.author.role}
        </p>
        <a
          href={`mailto:${proposal.author.email}`}
          className="underline underline-offset-4 hover:text-foreground"
        >
          {proposal.author.email}
        </a>
      </div>
    </footer>
  );
}
