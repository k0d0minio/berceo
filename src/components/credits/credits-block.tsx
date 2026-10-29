import { creditsFamille } from "@/content/credits";
import { fill, words } from "@/content/locale";
import type { FamilyCredit } from "@/lib/credits/credits";
import { formatDate } from "@/lib/demandes/format";
import { brusselsNow } from "@/lib/demandes/rules";
import { eurosFromCents } from "@/lib/paiements/rules";

/*
 * « Mes crédits » (credits-registre): the family's balance, then each credit
 * she can still use with what it can pay and its expiry, then the ones that
 * pay nothing any more, marked « utilisé », « annulé » (a contested absence,
 * annulations-table) or « expiré ». With no credit at
 * all, one line. The same block sits on her home and on « Mes réservations »;
 * the page reads `familyCredits` and hands the result here.
 */

const t = words(creditsFamille);

function expiryDay(expiresAt: Date): string {
  return formatDate(brusselsNow(expiresAt).date);
}

function creditLine(credit: FamilyCredit): string {
  switch (credit.state) {
    case "disponible":
      return fill(t.valable, { montant: eurosFromCents(credit.remainingCents), date: expiryDay(credit.expiresAt) });
    case "utilise":
      return fill(t.utilise, { montant: eurosFromCents(credit.amountCents) });
    case "annule":
      return fill(t.annule, { montant: eurosFromCents(credit.amountCents - credit.spentCents) });
    case "expire":
      return fill(t.expire, { montant: eurosFromCents(credit.amountCents), date: expiryDay(credit.expiresAt) });
  }
}

function CreditList({ items }: { items: FamilyCredit[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((credit) => (
        <li key={credit.id} className="flex flex-col text-corps text-encre-taupe">
          <span className="font-semibold">{creditLine(credit)}</span>
          <span>{t.origines[credit.origin]}</span>
        </li>
      ))}
    </ul>
  );
}

function CreditsBlock({ list, balanceCents }: { list: FamilyCredit[]; balanceCents: number }) {
  const usable = list.filter((credit) => credit.state === "disponible");
  const past = list.filter((credit) => credit.state !== "disponible");
  return (
    <section className="flex max-w-2xl flex-col items-start gap-3 rounded-carte bg-perle px-6 py-6 md:px-8">
      <h2 className="font-display text-h3 text-encre-sauge">{t.titre}</h2>
      <p className="text-corps text-encre-taupe">{t.intro}</p>
      {list.length === 0 ? (
        <p className="text-corps text-encre-taupe">{t.vide}</p>
      ) : (
        <>
          <p className="text-corps font-semibold text-encre-sauge">
            {fill(t.solde, { montant: eurosFromCents(balanceCents) })}
          </p>
          {usable.length > 0 ? <CreditList items={usable} /> : null}
          {past.length > 0 ? (
            <>
              <h3 className="text-corps font-semibold text-encre-sauge">{t.passes}</h3>
              <CreditList items={past} />
            </>
          ) : null}
        </>
      )}
    </section>
  );
}

export { CreditsBlock };
