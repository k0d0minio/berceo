import type { Metadata } from "next";

import { ProchainesDisponibilites } from "@/components/disponibilites/prochaines-disponibilites";
import { PortalShell } from "@/components/shell/portal-shell";
import { SignOutDialog } from "@/components/shell/sign-out-dialog";
import { designSystem } from "@/content/design-system";
import { words } from "@/content/locale";

const t = words(designSystem).portail;

/** Sample nights for the availability block; the words, not the dates, are the point. */
const SAMPLE_NIGHTS = ["2026-09-30", "2026-10-02", "2026-10-03", "2026-10-09", "2026-10-12"];

/*
 * The signed-in portal's shell, shown with sample navigation. It lives in its
 * own route group so the public header and footer stay off it. Internal
 * reference: never indexed, linked from nowhere. Below it, the blocks of the
 * signed-in pages that no page mounts yet: « Prochaines disponibilités ».
 */
export const metadata: Metadata = {
  title: t.meta.title,
  description: t.meta.description,
  robots: { index: false, follow: false },
};

export default function PortalShellPage() {
  return (
    <PortalShell
      nav={t.nav}
      home="/design-system/portail"
      actions={<SignOutDialog />}
    >
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-h1 text-sauge">{t.title}</h1>
        <p className="max-w-2xl text-intro">{t.text}</p>
      </div>
      <section className="mt-12 flex flex-col gap-4">
        <h2 className="font-display text-h2 text-sauge">{t.disponibilites.title}</h2>
        <p className="max-w-2xl text-corps">{t.disponibilites.text}</p>
        <div className="grid max-w-4xl gap-6 md:grid-cols-2">
          <ProchainesDisponibilites nights={SAMPLE_NIGHTS} />
          <ProchainesDisponibilites nights={[]} />
        </div>
      </section>
    </PortalShell>
  );
}
