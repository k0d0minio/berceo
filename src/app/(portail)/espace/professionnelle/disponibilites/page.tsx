import type { Metadata } from "next";

import { AvailabilityCalendar } from "@/components/disponibilites/availability-calendar";
import { ProchainesDisponibilites } from "@/components/disponibilites/prochaines-disponibilites";
import { SpaceShell } from "@/components/shell/space-shell";
import { disponibilites } from "@/content/disponibilites";
import { words } from "@/content/locale";
import { requireAccess } from "@/lib/auth/guard";
import { markedNights, nextAvailableNights, ownProfile } from "@/lib/disponibilites/nights";
import { AVAILABILITY_PATH } from "@/lib/disponibilites/paths";
import { availabilityWindow, calendarMonths } from "@/lib/disponibilites/rules";

import { saveNightsAction } from "./actions";

const t = words(disponibilites);

export const metadata: Metadata = {
  title: t.meta.titre,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
 * « Mes disponibilités » (D-12): the nights she is likely free, from tonight
 * to today + 56 days in Brussels (D-79), in the guide's words. Indicative
 * only: nothing about a care request reads them. Only a validated profile has
 * a calendar, the only kind a family can ever see (D-21); any other sees one
 * line. Under the help message, the « Prochaines disponibilités » block as
 * families will read it on her profile, fed by the same read (D-69).
 */
export default async function DisponibilitesPage() {
  const user = await requireAccess(AVAILABILITY_PATH);
  const profile = await ownProfile(user.id);
  const p = t.professionnelle;

  if (!profile || profile.status !== "valide") {
    return (
      <SpaceShell user={user} title={p.titre}>
        <p className="max-w-2xl text-intro text-encre-taupe">{p.nonValide}</p>
      </SpaceShell>
    );
  }

  const now = new Date();
  const range = availabilityWindow(now);
  const [marked, preview] = await Promise.all([
    markedNights(profile.id, range),
    nextAvailableNights(profile.id, now),
  ]);

  return (
    <SpaceShell user={user} title={p.titre}>
      <p className="max-w-2xl text-intro text-encre-taupe">{p.instructions}</p>
      <AvailabilityCalendar months={calendarMonths(range)} marked={marked} action={saveNightsAction} />
      <p className="max-w-2xl text-corps text-encre-taupe">{p.aide}</p>

      <h2 className="font-display text-h2 text-encre-sauge">{p.apercu}</h2>
      <div className="max-w-md">
        <ProchainesDisponibilites nights={preview} />
      </div>
    </SpaceShell>
  );
}
