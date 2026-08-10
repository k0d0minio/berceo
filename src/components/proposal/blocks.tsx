import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** A row of headline numbers. Give it 2–4 `Stat` children. */
export function StatRow({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
  );
}

export function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: ReactNode;
  note?: string;
}) {
  return (
    <Card>
      <CardContent className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="font-heading text-2xl font-semibold tracking-tight">
          {value}
        </p>
        {note ? (
          <p className="text-xs text-muted-foreground text-pretty">{note}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

/** Pulled-out point — use sparingly, it loses force when repeated. */
export function Callout({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border-l-2 border-primary bg-muted/40 px-5 py-4",
        className,
      )}
    >
      {title ? <p className="font-medium">{title}</p> : null}
      <div className="text-sm text-muted-foreground text-pretty [&>p+p]:mt-2">
        {children}
      </div>
    </div>
  );
}

/** Term/definition pairs — good for commercials, assumptions, deliverables. */
export function Terms({ children }: { children: ReactNode }) {
  return (
    <dl className="divide-y divide-border border-y border-border">
      {children}
    </dl>
  );
}

export function Term({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[minmax(0,12rem)_1fr] sm:gap-6">
      <dt className="text-sm font-medium">{label}</dt>
      <dd className="text-sm text-muted-foreground text-pretty">{children}</dd>
    </div>
  );
}
