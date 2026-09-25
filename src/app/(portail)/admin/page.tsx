import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";

import { QueueTable } from "@/components/admin/queue-table";
import { StudentsSwitch } from "@/components/admin/students-switch";
import { SpaceShell } from "@/components/shell/space-shell";
import { admin } from "@/content/admin";
import { comptes } from "@/content/comptes";
import { fill, words } from "@/content/locale";
import { db, users } from "@/db";
import { loadQueue } from "@/lib/admin/review";
import { requireAccess } from "@/lib/auth/guard";
import { SPACES } from "@/lib/auth/routing";
import { ADMIN_RATINGS_PATH } from "@/lib/avis/paths";
import { adminRatingCount } from "@/lib/avis/ratings";
import { absenceCount } from "@/lib/gardes/gardes";
import { ADMIN_ABSENCES_PATH } from "@/lib/gardes/paths";
import { ADMIN_PAYMENTS_PATH } from "@/lib/paiements/paths";
import { studentsSetting } from "@/lib/settings";

const t = words(comptes);
const a = words(admin);

export const metadata: Metadata = {
  title: t.espaces.admin.title,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const dateTime = new Intl.DateTimeFormat("fr-BE", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Europe/Brussels",
});

/*
 * The founders' back-office. Anyone but an admin, signed in or not, gets a 404
 * (D-33). It opens on the verification queue (verification-back-office), then
 * the settings (the students switch, D-7), the journal, the service fees
 * (frais-de-service) and the reported absences (cycle-de-garde-et-annulation,
 * D-106), and the ratings (avis-etoiles); the dashboard and the rest arrive with stub 14.
 */
export default async function AdminPage() {
  const user = await requireAccess(SPACES.admin);

  const [setting, queue, absences, ratingCount] = await Promise.all([
    studentsSetting(),
    loadQueue(),
    absenceCount(),
    adminRatingCount(),
  ]);
  const [author] = setting.updatedBy
    ? await db
        .select({ firstName: users.firstName, lastName: users.lastName })
        .from(users)
        .where(eq(users.id, setting.updatedBy))
        .limit(1)
    : [];
  const changed = setting.updatedAt
    ? {
        date: dateTime.format(setting.updatedAt),
        name: author ? `${author.firstName} ${author.lastName}` : "",
      }
    : null;

  return (
    <SpaceShell user={user} title={t.espaces.admin.title}>
      <h2 className="font-display text-h2 text-encre-sauge">{a.file.titre}</h2>
      <QueueTable rows={queue} studentsAdmitted={setting.value} />
      <h2 className="font-display text-h2 text-encre-sauge">{a.reglages.titre}</h2>
      <StudentsSwitch value={setting.value} changed={changed} />
      <Link
        href={`${SPACES.admin}/journal`}
        className="self-start text-corps font-semibold text-encre-sauge underline underline-offset-4"
      >
        {a.file.lienJournal}
      </Link>
      <Link
        href={ADMIN_PAYMENTS_PATH}
        className="self-start text-corps font-semibold text-encre-sauge underline underline-offset-4"
      >
        {a.file.lienPaiements}
      </Link>
      <Link
        href={ADMIN_ABSENCES_PATH}
        className="self-start text-corps font-semibold text-encre-sauge underline underline-offset-4"
      >
        {fill(a.file.lienAbsences, { n: String(absences) })}
      </Link>
      <Link
        href={ADMIN_RATINGS_PATH}
        className="self-start text-corps font-semibold text-encre-sauge underline underline-offset-4"
      >
        {fill(a.file.lienAvis, { n: String(ratingCount) })}
      </Link>
    </SpaceShell>
  );
}
