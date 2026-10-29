import type { CreditOrigin } from "@/db/schema";

/**
 * The credit's rules that need no database (credits-registre, the answers
 * [9.2]): when a credit expires, what is left on it at a moment, a family's
 * balance, and which credits pay an amount. Pure, so `rules.test.ts` holds
 * them to the spec; `./credits.ts` applies them in its statements.
 */

/** A credit lasts 24 months from its issue (the answers [9.2]). A constant, not a founders' setting. */
export const CREDIT_MONTHS = 24;

/**
 * When a credit issued at `issuedAt` expires: 24 months later, to the hour.
 * A day the later month lacks (29 February) rolls into the next month, as
 * the clock does.
 */
export function expiryOf(issuedAt: Date): Date {
  const expiry = new Date(issuedAt.getTime());
  expiry.setUTCMonth(expiry.getUTCMonth() + CREDIT_MONTHS);
  return expiry;
}

export type CreditFacts = {
  amountCents: number;
  spentCents: number;
  expiresAt: Date;
};

/** How a credit reads at `now`: still usable, spent to the last cent, or past its expiry. */
export type CreditState = "disponible" | "utilise" | "expire";

export function isExpired(credit: Pick<CreditFacts, "expiresAt">, now: Date): boolean {
  return credit.expiresAt.getTime() <= now.getTime();
}

/** A spent credit reads « Utilisé » even past its expiry: it did its work. */
export function creditState(credit: CreditFacts, now: Date): CreditState {
  if (credit.spentCents >= credit.amountCents) return "utilise";
  if (isExpired(credit, now)) return "expire";
  return "disponible";
}

/** What a credit can still pay at `now`: nothing once spent or expired. */
export function remainingCents(credit: CreditFacts, now: Date): number {
  return creditState(credit, now) === "disponible" ? credit.amountCents - credit.spentCents : 0;
}

/** The family's balance at `now`: the sum of what her credits can still pay. */
export function balanceCents(credits: readonly CreditFacts[], now: Date): number {
  return credits.reduce((sum, credit) => sum + remainingCents(credit, now), 0);
}

export type SpendableCredit = CreditFacts & { id: string; issuedAt: Date };

export type Take = { id: string; cents: number };

/**
 * Which credits pay `cents` (credits-au-paiement): the earliest expiry first,
 * then the earliest issue, each taken to its remainder. `restCents` is what
 * no credit covers, for the Checkout. A partly paid credit keeps its balance.
 */
export function spendingPlan(
  credits: readonly SpendableCredit[],
  cents: number,
  now: Date,
): { takes: Take[]; restCents: number } {
  if (!Number.isInteger(cents) || cents < 0) throw new RangeError(`amount out of range: ${cents}`);
  const usable = credits
    .filter((credit) => remainingCents(credit, now) > 0)
    .sort(
      (a, b) =>
        a.expiresAt.getTime() - b.expiresAt.getTime() ||
        a.issuedAt.getTime() - b.issuedAt.getTime() ||
        a.id.localeCompare(b.id),
    );
  const takes: Take[] = [];
  let rest = cents;
  for (const credit of usable) {
    if (rest === 0) break;
    const take = Math.min(rest, remainingCents(credit, now));
    takes.push({ id: credit.id, cents: take });
    rest -= take;
  }
  return { takes, restCents: rest };
}

/** The origins in the order the founders' table names them, then the founders' hand. */
export const CREDIT_ORIGINS = [
  "annulation_famille",
  "annulation_professionnelle",
  "absence_professionnelle",
  "annulation_berceo",
  "geste_berceo",
] as const satisfies readonly CreditOrigin[];
