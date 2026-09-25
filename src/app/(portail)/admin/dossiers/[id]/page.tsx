import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { DecisionPanel } from "@/components/admin/decision-panel";
import { DocumentView } from "@/components/admin/document-view";
import { JournalTable } from "@/components/admin/journal-table";
import { SpaceShell } from "@/components/shell/space-shell";
import { admin } from "@/content/admin";
import { fill, words } from "@/content/locale";
import { professionnelle } from "@/content/professionnelle";
import { db, users } from "@/db";
import { fullName, journalFor } from "@/lib/admin/journal";
import { isHeldStudent } from "@/lib/admin/rules";
import { requireAccess } from "@/lib/auth/guard";
import { SPACES } from "@/lib/auth/routing";
import { communeName } from "@/lib/communes";
import { loadFileById } from "@/lib/professionnelle/file";
import { REQUIREMENTS } from "@/lib/professionnelle/rules";
import { studentsAdmitted } from "@/lib/settings";

const a = words(admin);
const p = words(professionnelle);

export const metadata: Metadata = {
  title: a.file.titre,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const dateTime = new Intl.DateTimeFormat("fr-BE", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Europe/Brussels",
});

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
      <dt className="shrink-0 font-semibold sm:w-56">{label}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  );
}

/*
 * One professional's file, for the founders' review (the guide, "L'outil de
 * vérification"): who she is, her whole profile, every document read on the
 * page, the declarations she accepted, what was already done on the file, and
 * the three decisions while it waits. A 404 to anyone but an admin (D-33),
 * and for an id that names no file.
 */
export default async function DossierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireAccess(`${SPACES.admin}/dossiers/${id}`);
  if (!UUID.test(id)) notFound();

  const file = await loadFileById(id);
  if (!file) notFound();
  const { profile } = file;

  const [[owner], history, admitted] = await Promise.all([
    db.select().from(users).where(eq(users.id, profile.userId)).limit(1),
    journalFor(profile.userId),
    studentsAdmitted(),
  ]);
  if (!owner) notFound();

  const name = fullName(owner);
  const photo = file.documents.find((d) => d.kind === "photo");
  const qualifications = file.documents.filter((d) => d.kind !== "photo");
  const none = <span>{a.dossier.aucune}</span>;
  const unset = a.dossier.nonRenseigne;

  return (
    <SpaceShell user={user} title={fill(a.dossier.titre, { nom: name })}>
      <Link
        href={SPACES.admin}
        className="self-start text-corps font-semibold text-sauge underline underline-offset-4"
      >
        {a.dossier.retour}
      </Link>

      <h2 className="font-display text-h2 text-sauge">{a.dossier.sections.identite}</h2>
      <dl className="flex flex-col gap-3 rounded-carte border border-solid border-perle bg-blanc p-8 text-corps text-taupe">
        <Row label={a.dossier.champs.email}>{owner.email}</Row>
        <Row label={a.dossier.champs.telephone}>{owner.phone ?? unset}</Row>
        <Row label={a.dossier.champs.compteCree}>{dateTime.format(owner.createdAt)}</Row>
        <Row label={a.dossier.champs.dossierEnvoye}>
          {profile.submittedAt ? dateTime.format(profile.submittedAt) : unset}
        </Row>
        <Row label={a.dossier.champs.statut}>{a.dossier.etats[profile.status]}</Row>
        {profile.reviewReason ? <Row label={a.dossier.champs.motif}>{profile.reviewReason}</Row> : null}
      </dl>

      <h2 className="font-display text-h2 text-sauge">{a.dossier.sections.profil}</h2>
      <dl className="flex flex-col gap-3 rounded-carte border border-solid border-perle bg-blanc p-8 text-corps text-taupe">
        <Row label={a.dossier.champs.profession}>
          {profile.profession ? p.professions[profile.profession] : unset}
        </Row>
        <Row label={a.dossier.champs.specialisations}>
          {file.state.draft.specialisations.length > 0
            ? file.state.draft.specialisations.map((s) => p.specialisations[s]).join(", ")
            : none}
        </Row>
        <Row label={a.dossier.champs.zone}>
          {file.communes.length > 0 ? file.communes.map((ins) => communeName(ins) ?? ins).join(", ") : none}
        </Row>
        <Row label={a.dossier.champs.tarif}>
          {profile.nightRateEur !== null ? fill(a.dossier.tarif, { montant: String(profile.nightRateEur) }) : unset}
        </Row>
        <Row label={a.dossier.champs.experience}>
          {profile.experience ? p.experiences[profile.experience] : unset}
        </Row>
        <Row label={a.dossier.champs.bio}>
          <span className="whitespace-pre-line">{profile.bio ?? unset}</span>
        </Row>
        {profile.profession && REQUIREMENTS[profile.profession].inami ? (
          <Row label={a.dossier.champs.inami}>{profile.inamiNumber ?? unset}</Row>
        ) : null}
      </dl>
      {photo ? (
        <div className="max-w-sm">
          <DocumentView
            id={photo.id}
            fileName={photo.fileName}
            contentType={photo.contentType}
            label={a.file.documents.photo}
          />
        </div>
      ) : null}

      <h2 className="font-display text-h2 text-sauge">{a.dossier.sections.justificatifs}</h2>
      {qualifications.length === 0 ? (
        <p className="text-corps text-taupe">{a.dossier.aucunDocument}</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {qualifications.map((doc) => (
            <DocumentView
              key={doc.id}
              id={doc.id}
              fileName={doc.fileName}
              contentType={doc.contentType}
              label={a.file.documents[doc.kind]}
            />
          ))}
        </div>
      )}

      <h2 className="font-display text-h2 text-sauge">{a.dossier.sections.declarations}</h2>
      {file.declarations.length === 0 ? (
        <p className="text-corps text-taupe">{a.dossier.aucune}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {file.declarations.map((d, i) => (
            <li key={i} className="flex flex-col gap-1 rounded-carte bg-perle px-6 py-4 text-corps text-taupe">
              <span>{p.declarations.textes[d.declaration as keyof typeof p.declarations.textes]}</span>
              <span className="text-legende">
                {fill(a.dossier.accepteeLe, { date: dateTime.format(d.acceptedAt), version: d.version })}
              </span>
            </li>
          ))}
        </ul>
      )}

      <h2 className="font-display text-h2 text-sauge">{a.dossier.sections.historique}</h2>
      {history.length === 0 ? (
        <p className="text-corps text-taupe">{a.dossier.aucunHistorique}</p>
      ) : (
        <JournalTable entries={history} />
      )}

      <h2 className="font-display text-h2 text-sauge">{a.dossier.sections.decision}</h2>
      <DecisionPanel
        profileId={profile.id}
        name={name}
        status={profile.status}
        reviewedAt={profile.reviewedAt?.toISOString() ?? null}
        held={isHeldStudent(profile, admitted)}
      />
    </SpaceShell>
  );
}
