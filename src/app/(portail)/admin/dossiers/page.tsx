import { eq } from "drizzle-orm";
import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { QueueTable } from "@/components/admin/queue-table";
import { StudentsSwitch } from "@/components/admin/students-switch";
import { admin } from "@/content/admin";
import { words } from "@/content/locale";
import { db, users } from "@/db";
import { ADMIN_FILES_PATH } from "@/lib/admin/paths";
import { loadQueue } from "@/lib/admin/review";
import { requireAccess } from "@/lib/auth/guard";
import { studentsSetting } from "@/lib/settings";

const a = words(admin);

export const metadata: Metadata = {
  title: a.dossiers.titre,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const dateTime = new Intl.DateTimeFormat("fr-BE", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Europe/Brussels",
});

/*
 * « Dossiers »: the verification queue (verification-back-office) and the
 * students switch (D-7), unchanged, moved here from the back-office's home,
 * which is now the overview (back-office-admin, D-132). The overview's
 * « Dossiers en attente de validation » counts this very queue. A 404 to
 * anyone but an admin (D-33).
 */
export default async function DossiersPage() {
  const user = await requireAccess(ADMIN_FILES_PATH);

  const [setting, queue] = await Promise.all([studentsSetting(), loadQueue()]);
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
    <AdminShell user={user} title={a.dossiers.titre} current="dossiers">
      <h2 className="font-display text-h2 text-encre-sauge">{a.file.titre}</h2>
      <QueueTable rows={queue} studentsAdmitted={setting.value} />
      <h2 className="font-display text-h2 text-encre-sauge">{a.reglages.titre}</h2>
      <StudentsSwitch value={setting.value} changed={changed} />
    </AdminShell>
  );
}
