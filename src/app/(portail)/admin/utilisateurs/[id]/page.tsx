import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { AccountActions } from "@/components/admin/account-actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { JournalTable } from "@/components/admin/journal-table";
import { listHref } from "@/components/admin/list-controls";
import { admin } from "@/content/admin";
import { fill, words } from "@/content/locale";
import { professionnelle } from "@/content/professionnelle";
import { accountView } from "@/lib/admin/accounts";
import { fullName } from "@/lib/admin/journal";
import { ADMIN_BOOKINGS_PATH, ADMIN_REQUESTS_PATH, adminFilePath, adminUserPath } from "@/lib/admin/paths";
import { deleteRefusal, UUID } from "@/lib/admin/rules";
import { requireAccess } from "@/lib/auth/guard";
import { formatDate, formatTime } from "@/lib/demandes/format";

const a = words(admin);
const p = words(professionnelle);

export const metadata: Metadata = {
  title: a.utilisateurs.titre,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const date = new Intl.DateTimeFormat("fr-BE", { dateStyle: "long", timeZone: "Europe/Brussels" });
const link = "text-corps font-semibold text-encre-sauge underline underline-offset-4";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
      <dt className="shrink-0 font-semibold sm:w-56">{label}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-h2 text-encre-sauge">{title}</h2>
      {children}
    </section>
  );
}

/*
 * « Voir le profil » (the guide, « Le backoffice »; back-office-admin): who the
 * account is and since when, a family's commune but never her address (D-15),
 * a professional's file, communes, rate and note, what she did on Berceo with
 * links to the lists filtered on her, her gardes still standing, the actions,
 * and every journal entry about her. An admin account shows no action. A 404
 * to anyone but an admin (D-33), and for an id that names no account.
 */
export default async function AccountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireAccess(adminUserPath(id));
  if (!UUID.test(id)) notFound();
  const view = await accountView(id);
  if (!view) notFound();

  const t = a.compte;
  const u = a.utilisateurs;
  const account = view.user;
  const name = fullName(account);
  const state = account.deletedAt
    ? fill(t.supprimeLe, { date: date.format(account.deletedAt) })
    : account.suspendedAt
      ? fill(t.suspenduLe, { date: date.format(account.suspendedAt) })
      : u.etats.actif;
  const upcoming = view.upcoming.map((garde) =>
    fill(t.garde, {
      date: formatDate(garde.nightDate),
      heure: formatTime(garde.startTime),
      nom: garde.other.name,
      telephone: garde.other.phone ?? t.nonRenseigne,
    }),
  );
  const blocked = deleteRefusal(account, view.upcoming.length);

  return (
    <AdminShell user={user} title={name} current="utilisateurs">
      <Section title={t.sections.identite}>
        <dl className="flex flex-col gap-3 text-corps text-encre-taupe">
          <Row label={t.champs.role}>{u.roles[account.role]}</Row>
          <Row label={t.champs.email}>{account.deletedAt ? t.nonRenseigne : account.email}</Row>
          <Row label={t.champs.telephone}>{account.phone ?? t.nonRenseigne}</Row>
          <Row label={t.champs.inscription}>{date.format(account.createdAt)}</Row>
          <Row label={t.champs.etat}>{state}</Row>
          {account.role === "parent" ? (
            <Row label={t.champs.commune}>{view.commune ?? t.nonRenseigne}</Row>
          ) : null}
          {view.professional ? (
            <>
              <Row label={t.champs.dossier}>
                <Link href={adminFilePath(view.professional.profileId)} className={link}>
                  {a.dossier.etats[view.professional.status]}
                </Link>
              </Row>
              <Row label={t.champs.profession}>
                {view.professional.profession ? p.professions[view.professional.profession] : t.nonRenseigne}
              </Row>
              <Row label={t.champs.communes}>
                {view.professional.communes.length > 0 ? view.professional.communes.join(", ") : t.aucune}
              </Row>
              <Row label={t.champs.tarif}>
                {view.professional.nightRateEur === null
                  ? t.nonRenseigne
                  : fill(a.dossier.tarif, { montant: String(view.professional.nightRateEur) })}
              </Row>
              <Row label={t.champs.note}>
                {view.professional.note.note === null
                  ? t.sansNote
                  : fill(t.note, {
                      note: view.professional.note.note.toLocaleString("fr-BE", { maximumFractionDigits: 1 }),
                      n: String(view.professional.note.gardes),
                    })}
              </Row>
            </>
          ) : null}
        </dl>
      </Section>

      <Section title={t.sections.activite}>
        <ul className="flex flex-col gap-2 text-corps text-encre-taupe">
          {account.role === "parent" ? (
            <li className="flex flex-wrap gap-x-4">
              {fill(t.compteurs.demandes, { n: String(view.counts.requests) })}
              <Link href={listHref(ADMIN_REQUESTS_PATH, { famille: account.id })} className={link}>
                {t.liens.demandes}
              </Link>
            </li>
          ) : null}
          {view.professional ? (
            <li>{fill(t.compteurs.reponses, { n: String(view.counts.answers) })}</li>
          ) : null}
          {account.role !== "admin" ? (
            <li className="flex flex-wrap gap-x-4">
              {fill(t.compteurs.gardes, { n: String(view.counts.bookings) })}
              <Link href={listHref(ADMIN_BOOKINGS_PATH, { compte: account.id })} className={link}>
                {t.liens.gardes}
              </Link>
            </li>
          ) : null}
        </ul>
      </Section>

      {account.role !== "admin" ? (
        <Section title={t.sections.gardes}>
          {upcoming.length === 0 ? (
            <p className="text-corps text-encre-taupe">{t.aucuneGarde}</p>
          ) : (
            <ul className="flex list-disc flex-col gap-1 pl-6 text-corps text-encre-taupe">
              {upcoming.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
        </Section>
      ) : null}

      <Section title={t.sections.actions}>
        {account.role === "admin" ? (
          <p className="text-corps text-encre-taupe">{t.sansActionAdmin}</p>
        ) : account.deletedAt ? (
          <p className="text-corps text-encre-taupe">{t.sansActionSupprime}</p>
        ) : (
          <AccountActions
            userId={account.id}
            name={name}
            lastName={account.lastName}
            suspended={account.suspendedAt !== null}
            deleteBlocked={blocked === "nonSuspendu" || blocked === "gardesAVenir" ? blocked : null}
            upcoming={upcoming}
          />
        )}
      </Section>

      <Section title={t.sections.historique}>
        {view.journal.length === 0 ? (
          <p className="text-corps text-encre-taupe">{t.aucunHistorique}</p>
        ) : (
          <JournalTable entries={view.journal} />
        )}
      </Section>
    </AdminShell>
  );
}
