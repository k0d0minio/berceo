import Link from "next/link";

import { SeriesCard } from "@/components/demandes/series-card";
import { demandes } from "@/content/demandes";
import { words } from "@/content/locale";
import { reservations } from "@/content/reservations";
import { professionalRequestPath } from "@/lib/demandes/paths";
import type { ProfessionalRequest } from "@/lib/demandes/requests";
import { extraHourLine, rateLine } from "@/lib/reservations/format";
import { seriesAnswerState } from "@/lib/reservations/rules";

import { SeriesAnswerFooter } from "./answer-footer";

const t = words(demandes);
const r = words(reservations).professionnelle;

/*
 * A regular request answered as one (JAM-302), on her list and on its page:
 * one card with every night she can see, her rate, « Voir la demande » on the
 * list, and one answer for all the nights. She answers when her list holds
 * every open night of it (Q5); otherwise a line says why there is no button.
 */
export function SeriesEntry({
  nights,
  seriesId,
  nightRateEur,
  extraHourRateEur,
  conversationId,
  from,
}: {
  nights: readonly ProfessionalRequest[];
  seriesId: string;
  nightRateEur: number | null;
  extraHourRateEur: number | null;
  conversationId: string | undefined;
  from: "liste" | "demande";
}) {
  const [first] = nights;
  const state = seriesAnswerState(nights, first.seriesNights);
  return (
    <SeriesCard
      nights={nights.map((night) => ({ request: night }))}
      aside={
        <>
          {first.priority ? (
            <p className="text-corps font-semibold text-taupe">{r.prioritaire}</p>
          ) : null}
          {nightRateEur ? <p className="text-corps font-semibold text-sauge">{rateLine(nightRateEur)}</p> : null}
          {extraHourRateEur ? (
            <p className="text-corps font-semibold text-sauge">{extraHourLine(extraHourRateEur)}</p>
          ) : null}
          {state === "repondu" ? <p className="text-corps font-semibold text-taupe">{r.repondu}</p> : null}
          {from === "liste" ? (
            <Link
              href={professionalRequestPath(first.id)}
              className="w-fit rounded-md text-corps font-semibold text-sauge underline underline-offset-4"
            >
              {t.boutons.voir}
            </Link>
          ) : null}
        </>
      }
      footer={
        <SeriesAnswerFooter
          request={first}
          seriesId={seriesId}
          state={state}
          conversationId={conversationId}
          from={from}
        />
      }
    />
  );
}
