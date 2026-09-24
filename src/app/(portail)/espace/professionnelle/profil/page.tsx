import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { DocumentsForm } from "@/components/professionnelle/documents-form";
import { ProfileForm } from "@/components/professionnelle/profile-form";
import { ReopenDialog } from "@/components/professionnelle/reopen-dialog";
import { SpaceShell } from "@/components/shell/space-shell";
import { fill, words } from "@/content/locale";
import { professionnelle } from "@/content/professionnelle";
import { requireAccess } from "@/lib/auth/guard";
import { SPACES } from "@/lib/auth/routing";
import { loadFile } from "@/lib/professionnelle/file";
import { PROFESSIONS, STUDENT, firstIncompleteStep, isEditable } from "@/lib/professionnelle/rules";
import { studentsAdmitted } from "@/lib/settings";

import { ONBOARDING } from "../inscription/step";

const t = words(professionnelle);

export const metadata: Metadata = {
  title: t.meta.dossier,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const date = new Intl.DateTimeFormat("fr-BE", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Europe/Brussels",
});

/*
 * Her file once submitted: step 2's form, step 3's documents, and the
 * declarations she accepted, read only. While it waits she edits anything and
 * it keeps waiting. Once validated, rate, zone, spécialisations, experience,
 * bio and photo apply at once; a new profession or new documents go through
 * the reopening dialog first. A draft belongs in the onboarding.
 */
export default async function DossierPage() {
  const user = await requireAccess(`${SPACES.professionnel}/profil`);
  const file = await loadFile(user.id);
  const { profile } = file;

  if (profile.status === "brouillon") redirect(`${ONBOARDING}/${firstIncompleteStep(file.state)}`);
  if (!isEditable(profile.status)) redirect(SPACES.professionnel);

  const admitted = await studentsAdmitted();
  const professions = PROFESSIONS.filter(
    (p) => p !== STUDENT || admitted || profile.profession === STUDENT,
  );
  const locked = profile.status === "valide";
  const photo = file.documents.find((d) => d.kind === "photo");
  const of = (kind: "diplome" | "attestation_inscription") =>
    file.documents.filter((d) => d.kind === kind).map((d) => ({ id: d.id, fileName: d.fileName }));

  return (
    <SpaceShell user={user} title={t.meta.dossier}>
      {locked ? <ReopenDialog /> : null}

      <h2 className="font-display text-h2 text-sauge">{t.etapes.titres.profil}</h2>
      <ProfileForm
        mode="dossier"
        professions={professions}
        professionLocked={locked}
        photo={photo ? { id: photo.id, fileName: photo.fileName } : null}
        saved={{ ...file.state.draft }}
      />

      {profile.profession ? (
        <>
          <h2 className="font-display text-h2 text-sauge">{t.etapes.titres.justificatifs}</h2>
          <DocumentsForm
            mode="dossier"
            locked={locked}
            profession={profile.profession}
            inamiNumber={profile.inamiNumber}
            files={{ diplome: of("diplome"), attestation_inscription: of("attestation_inscription") }}
          />
        </>
      ) : null}

      <h2 className="font-display text-h2 text-sauge">{t.declarations.acceptees}</h2>
      <ul className="flex flex-col gap-3">
        {file.declarations.map((d, i) => (
          <li key={i} className="flex flex-col gap-1 rounded-carte bg-perle px-6 py-4 text-corps text-taupe">
            <span>{t.declarations.textes[d.declaration as keyof typeof t.declarations.textes]}</span>
            <span className="text-legende">{fill(t.declarations.accepteeLe, { date: date.format(d.acceptedAt) })}</span>
          </li>
        ))}
      </ul>
    </SpaceShell>
  );
}
