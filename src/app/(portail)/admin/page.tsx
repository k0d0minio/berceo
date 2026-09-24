import { eq } from "drizzle-orm";
import type { Metadata } from "next";

import { StudentsSwitch } from "@/components/admin/students-switch";
import { SpaceShell } from "@/components/shell/space-shell";
import { admin } from "@/content/admin";
import { comptes } from "@/content/comptes";
import { words } from "@/content/locale";
import { db, users } from "@/db";
import { requireAccess } from "@/lib/auth/guard";
import { SPACES } from "@/lib/auth/routing";
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
 * (D-33). Its first tool is the students switch (D-7); the verification queue
 * and the rest arrive with stubs 5 and 14.
 */
export default async function AdminPage() {
  const user = await requireAccess(SPACES.admin);

  const setting = await studentsSetting();
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
      <p className="max-w-2xl text-intro text-taupe">{t.espaces.admin.vide}</p>
      <h2 className="font-display text-h2 text-sauge">{a.reglages.titre}</h2>
      <StudentsSwitch value={setting.value} changed={changed} />
    </SpaceShell>
  );
}
