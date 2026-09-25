import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FormMessage } from "@/components/auth/field";
import { CancelRequest } from "@/components/demandes/cancel-request";
import { RequestCard } from "@/components/demandes/request-card";
import { SpaceShell } from "@/components/shell/space-shell";
import { Button } from "@/components/ui/button";
import { comptes } from "@/content/comptes";
import { demandes } from "@/content/demandes";
import { words } from "@/content/locale";
import { requireAccess } from "@/lib/auth/guard";
import { FAMILY_REQUESTS_PATH, familyRequestPath } from "@/lib/demandes/paths";
import { ownRequest } from "@/lib/demandes/requests";
import { displayStatus, isChangeable } from "@/lib/demandes/rules";

import { cancelRequestAction } from "../actions";

const t = words(demandes);
const c = words(comptes);

export const metadata: Metadata = {
  title: t.meta.detail,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Notice = {
  publiee?: string;
  modifiee?: string;
  annulee?: string;
  erreur?: string;
};

function message(notice: Notice): string | null {
  if (notice.publiee === "urgente") return t.confirmations.publieeUrgente;
  if (notice.publiee === "1") return t.confirmations.publiee;
  if (notice.modifiee === "1") return t.confirmations.modifiee;
  if (notice.annulee === "1") return t.confirmations.annulee;
  if (notice.erreur === "nonModifiable") return t.erreurs.nonModifiable;
  if (notice.erreur === "generique") return c.erreurs.generique;
  return null;
}

/*
 * One of her requests: the card, and while it is open and its night has not
 * started, « Modifier ma demande » and « Annuler ma demande ». Another family's
 * id, like an unknown one, is not found.
 */
export default async function DemandePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Notice>;
}) {
  const { id } = await params;
  const user = await requireAccess(familyRequestPath(id));
  const request = await ownRequest(user.id, id);
  if (!request) notFound();

  const now = new Date();
  const notice = message(await searchParams);
  const cancel = cancelRequestAction.bind(null, request.id);

  return (
    <SpaceShell user={user} title={t.meta.detail}>
      {notice ? <FormMessage>{notice}</FormMessage> : null}
      <div className="max-w-2xl">
        <RequestCard request={request} status={displayStatus(request, now)} />
      </div>
      <div className="flex flex-wrap gap-3">
        {isChangeable(request, now) ? (
          <>
            <Button asChild>
              <Link href={`${familyRequestPath(request.id)}/modifier`}>{t.boutons.modifier}</Link>
            </Button>
            <CancelRequest onCancel={cancel} />
          </>
        ) : null}
        <Button asChild variant="raye">
          <Link href={FAMILY_REQUESTS_PATH}>{t.boutons.retour}</Link>
        </Button>
      </div>
    </SpaceShell>
  );
}
