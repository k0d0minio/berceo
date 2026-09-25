import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RequestCard } from "@/components/demandes/request-card";
import { SpaceShell } from "@/components/shell/space-shell";
import { Button } from "@/components/ui/button";
import { fill, words } from "@/content/locale";
import { reservations } from "@/content/reservations";
import { requireAccess } from "@/lib/auth/guard";
import { professionalBooking } from "@/lib/reservations/bookings";
import { PROFESSIONAL_BOOKINGS_PATH, professionalBookingPath } from "@/lib/reservations/paths";

const t = words(reservations);

export const metadata: Metadata = {
  title: t.meta.garde,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-legende font-semibold text-encre-taupe">{label}</dt>
      <dd className="text-corps text-encre-taupe">{children}</dd>
    </div>
  );
}

/*
 * One of her gardes: the night, the children, the booked rate, and, only here
 * and only on her own booking, the family's names, full address and phone
 * (D-15, D-72). The address is read live from the family's profile through
 * src/lib/famille/. Another professional's booking, like an unknown one, is
 * not found.
 */
export default async function GardePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireAccess(professionalBookingPath(id));
  const booking = await professionalBooking(user.id, id);
  if (!booking) notFound();

  const { family } = booking;
  const address = family.address;

  return (
    <SpaceShell user={user} title={t.meta.garde}>
      <div className="max-w-2xl">
        <RequestCard request={booking.request} rate={booking.nightRateEur} />
      </div>
      <section className="flex max-w-2xl flex-col gap-4 rounded-carte bg-perle px-6 py-6 md:px-8">
        <h2 className="font-display text-h3 text-encre-sauge uppercase">{t.gardes.famille}</h2>
        <dl className="flex flex-col gap-4">
          <Row label={t.gardes.nom}>{`${family.firstName} ${family.lastName}`}</Row>
          <Row label={t.gardes.adresse}>
            {address ? (
              <>
                {[address.street, address.houseNumber].filter(Boolean).join(" ")}
                {address.box ? `, ${fill(t.gardes.boite, { boite: address.box })}` : ""}
                <br />
                {`${address.postcode} ${address.locality}`}
              </>
            ) : (
              t.gardes.nonRenseigne
            )}
          </Row>
          <Row label={t.recapitulatif.libelles.telephone}>
            {family.phone ? (
              <a href={`tel:${family.phone}`} className="underline underline-offset-4">
                {family.phone}
              </a>
            ) : (
              t.gardes.nonRenseigne
            )}
          </Row>
        </dl>
      </section>
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="raye">
          <Link href={PROFESSIONAL_BOOKINGS_PATH}>{t.gardes.retour}</Link>
        </Button>
      </div>
    </SpaceShell>
  );
}
