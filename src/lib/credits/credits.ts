import "server-only";

import { and, asc, eq, gt, sql } from "drizzle-orm";

import { credits, db, type CreditOrigin } from "@/db";

import { balanceCents, creditState, expiryOf, remainingCents, spendingPlan, type CreditState } from "./rules";

/**
 * Every read and write of `credits` (credits-registre). The family's id comes
 * from the session (the caller's `requireAccess`), never from a form. Nothing
 * issues or spends a credit yet: `annulations-table` and
 * `annulations-back-office` call `issueCredit`, `credits-au-paiement` calls
 * `spendCredits`. Only this folder and the schema name the table
 * (`isolation.test.ts`).
 */

export type FamilyCredit = {
  id: string;
  amountCents: number;
  spentCents: number;
  origin: CreditOrigin;
  issuedAt: Date;
  expiresAt: Date;
  /** How it reads at the moment of the read. */
  state: CreditState;
  /** What it can still pay at that moment: 0 once spent or expired. */
  remainingCents: number;
};

/**
 * The family's credits at `now`, the earliest expiry first, with her balance.
 * Every row she has, spent and expired ones included: the list is her record.
 */
export async function familyCredits(
  familyUserId: string,
  now: Date,
): Promise<{ list: FamilyCredit[]; balanceCents: number }> {
  const rows = await db
    .select({
      id: credits.id,
      amountCents: credits.amountCents,
      spentCents: credits.spentCents,
      origin: credits.origin,
      issuedAt: credits.issuedAt,
      expiresAt: credits.expiresAt,
    })
    .from(credits)
    .where(eq(credits.familyUserId, familyUserId))
    .orderBy(asc(credits.expiresAt), asc(credits.issuedAt), asc(credits.id));
  const list = rows.map((row) => ({
    ...row,
    state: creditState(row, now),
    remainingCents: remainingCents(row, now),
  }));
  return { list, balanceCents: balanceCents(rows, now) };
}

export type CreditIssue = {
  familyUserId: string;
  /** The fee's amount in cents (`payments.amount_cents`), never a night rate. */
  amountCents: number;
  origin: CreditOrigin;
  paymentId?: string | null;
  bookingId?: string | null;
  grantedByUserId?: string | null;
  note?: string | null;
};

/** Issues one credit at `now`, which expires `CREDIT_MONTHS` later. Returns its id. */
export async function issueCredit(issue: CreditIssue, now: Date): Promise<{ id: string }> {
  if (!Number.isInteger(issue.amountCents) || issue.amountCents <= 0) {
    throw new RangeError(`credit amount out of range: ${issue.amountCents}`);
  }
  const [row] = await db
    .insert(credits)
    .values({
      familyUserId: issue.familyUserId,
      amountCents: issue.amountCents,
      origin: issue.origin,
      paymentId: issue.paymentId ?? null,
      bookingId: issue.bookingId ?? null,
      grantedByUserId: issue.grantedByUserId ?? null,
      note: issue.note ?? null,
      issuedAt: now,
      expiresAt: expiryOf(now),
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: credits.id });
  return row;
}

/**
 * Takes `cents` from the family's credits at `now`, by `spendingPlan`. Each
 * take is one update guarded on the amount already spent: a credit another
 * statement spent meanwhile is left alone, and the call throws so the caller
 * reads the balance again. Returns what the credits paid and what is left for
 * the Checkout.
 */
export async function spendCredits(
  familyUserId: string,
  cents: number,
  now: Date,
): Promise<{ spentCents: number; restCents: number }> {
  const usable = await db
    .select({
      id: credits.id,
      amountCents: credits.amountCents,
      spentCents: credits.spentCents,
      issuedAt: credits.issuedAt,
      expiresAt: credits.expiresAt,
    })
    .from(credits)
    .where(
      and(
        eq(credits.familyUserId, familyUserId),
        gt(credits.expiresAt, now),
        sql`${credits.spentCents} < ${credits.amountCents}`,
      ),
    );
  const { takes, restCents } = spendingPlan(usable, cents, now);
  if (takes.length === 0) return { spentCents: 0, restCents };
  const before = new Map(usable.map((credit) => [credit.id, credit.spentCents]));
  const [first, ...others] = takes.map((take) =>
    db
      .update(credits)
      .set({ spentCents: sql`${credits.spentCents} + ${take.cents}`, updatedAt: now })
      .where(and(eq(credits.id, take.id), eq(credits.spentCents, before.get(take.id) ?? -1)))
      .returning({ id: credits.id }),
  );
  const results = await db.batch([first, ...others]);
  const taken = results.flat().length;
  if (taken !== takes.length) {
    throw new Error(
      `a credit of ${familyUserId} changed while it was spent: ${taken} of ${takes.length} takes applied`,
    );
  }
  return { spentCents: cents - restCents, restCents };
}
