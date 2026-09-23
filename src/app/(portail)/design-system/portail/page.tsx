import type { Metadata } from "next";

import { PortalShell } from "@/components/shell/portal-shell";
import { SignOutDialog } from "@/components/shell/sign-out-dialog";
import { designSystem } from "@/content/design-system";
import { words } from "@/content/locale";

const t = words(designSystem).portail;

/*
 * The signed-in portal's shell, shown with sample navigation. It lives in its
 * own route group so the public header and footer stay off it. Internal
 * reference: never indexed, linked from nowhere.
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
      actions={<SignOutDialog />}
    >
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-h1 text-sauge">{t.title}</h1>
        <p className="max-w-2xl text-intro">{t.text}</p>
      </div>
    </PortalShell>
  );
}
