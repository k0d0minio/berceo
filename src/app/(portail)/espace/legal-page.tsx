import type { Metadata } from "next";

import { SpaceShell } from "@/components/shell/space-shell";
import { legal } from "@/content/legal";
import { words } from "@/content/locale";
import { requireAccess } from "@/lib/auth/guard";
import { sleepConsultationEnabled } from "@/lib/consultation-sommeil/config";
import { legalPath, type LegalPage } from "@/lib/legal/paths";

/*
 * The two legal pages inside a family's or a professional's space (JAM-582):
 * the same words as `/conditions-generales` and `/confidentialite`, under the
 * signed-in shell, so the footer of a space never leads to the public header
 * that reads as signed out. Each route file of the two spaces calls these
 * two functions with its role and its page. The privacy page keeps its
 * block on Calendly where the sleep consultation exists (JAM-352).
 */

const t = words(legal);

export function legalMetadata(page: LegalPage): Metadata {
  return { title: t[page].meta.title, robots: { index: false, follow: false } };
}

export async function SpaceLegalPage({
  role,
  page,
}: {
  role: "parent" | "professionnel";
  page: LegalPage;
}) {
  const user = await requireAccess(legalPath(role, page));
  const calendly = page === "confidentialite" && sleepConsultationEnabled();

  return (
    <SpaceShell user={user} title={t[page].title}>
      {/* A long text reads on white (DA, slide 14; JAM-327). */}
      <div className="flex max-w-2xl flex-col gap-4 rounded-carte bg-blanc px-6 py-8 text-taupe md:px-10">
        <p className="text-intro">{t[page].placeholder}</p>
        {calendly ? (
          <>
            <h2 className="font-display text-h2 text-sauge">{t.confidentialite.consultationSommeil.title}</h2>
            {t.confidentialite.consultationSommeil.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </>
        ) : null}
      </div>
    </SpaceShell>
  );
}
