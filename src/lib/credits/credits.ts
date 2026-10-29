import "server-only";

import { and, asc, eq, gt, inArray, isNull, sql, type AnyColumn, type SQL } from "drizzle-orm";

import { credits, db, type CreditOrigin } from "@/db";
import { UUID } from "@/lib/demandes/requests";

import { balanceCents, creditState, expiryOf, remainingCents, spendingPlan, type CreditState } from "./rules";

/**
 * Every read and write of `credits` (credits-registre). The family's id comes
 * from the session (the caller's `requireAccess`), never from a form. The end
 * of a garde issues and voids its credit through the statements below, inside
 * its own batch (annulations-table, `src/lib/gardes/gardes.ts`);
 * `annulations-back-office` calls `issueCredit`, `credits-au-paiement` calls
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
  voidedAt: Date | null;
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
      voidedAt: credits.voidedAt,
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
        isNull(credits.voidedAt),
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

// ---------------------------------------------------------------------------
// The end of a garde (annulations-table)
// ---------------------------------------------------------------------------

/**
 * Issues the credit of a garde's fee, as one statement for the batch that ends
 * the garde in `src/lib/gardes/gardes.ts`: the fee's amount, to the family who
 * booked, from `now` for `CREDIT_MONTHS`. Only while the fee is `payee`, and
 * only when `when` holds. `when` reads the booking as `b`, its request as `r`
 * and the fee as `p`; it names the end this same batch wrote, so a refused
 * cancellation issues nothing. A garde booked before the fee existed has no
 * fee, and issues nothing. A second live credit for one garde is never written
 * (`credits_booking_live_key`).
 */
export function gardeCreditStatement(bookingId: string, origin: CreditOrigin, when: SQL, now: Date): SQL {
  const at = now.toISOString();
  return sql`
    insert into credits (family_user_id, amount_cents, origin, payment_id, booking_id, issued_at, expires_at, created_at, updated_at)
    select b.family_user_id, p.amount_cents, ${origin}::credit_origin, p.id, b.id,
           ${at}::timestamptz, ${expiryOf(now).toISOString()}::timestamptz, ${at}::timestamptz, ${at}::timestamptz
    from bookings b
    join care_requests r on r.id = b.request_id
    join payments p on p.booking_id = b.id
    where b.id = ${bookingId} and p.status = 'payee' and ${when}
    on conflict (booking_id) where booking_id is not null and voided_at is null do nothing
    returning id
  `;
}

/**
 * Voids the live credit an absence report issued, as one statement for the
 * batch that records the contest: from `now` on, what is left on it pays
 * nothing, and a part already spent stays spent. Only when `when` holds; it
 * reads the booking as `b` and names the contest this same batch wrote.
 */
export function voidGardeCreditStatement(bookingId: string, when: SQL, now: Date): SQL {
  const at = now.toISOString();
  return sql`
    update credits
    set voided_at = ${at}::timestamptz, updated_at = ${at}::timestamptz
    where booking_id = ${bookingId}
      and origin = 'absence_professionnelle'
      and voided_at is null
      and exists (select 1 from bookings b where b.id = ${bookingId} and ${when})
    returning id
  `;
}

export type GardeCredit = { amountCents: number; expiresAt: Date; origin: CreditOrigin };

/**
 * The live credit of each of these gardes, by booking id: the line « crédit
 * Berceo » on both sides' garde pages. A voided credit is not one.
 */
export async function gardeCredits(bookingIds: string[]): Promise<Map<string, GardeCredit>> {
  const ids = bookingIds.filter((id) => UUID.test(id));
  if (ids.length === 0) return new Map();
  const rows = await db
    .select({
      bookingId: credits.bookingId,
      amountCents: credits.amountCents,
      expiresAt: credits.expiresAt,
      origin: credits.origin,
    })
    .from(credits)
    .where(and(inArray(credits.bookingId, ids), isNull(credits.voidedAt)));
  return new Map(rows.flatMap(({ bookingId, ...credit }) => (bookingId ? [[bookingId, credit] as const] : [])));
}

/**
 * Whether the fee `paymentId` became a live credit, as a condition for the
 * fee's own statements (`src/lib/paiements/payments.ts`): « À rembourser »
 * leaves such a fee out, and the founders' refund refuses it, so a fee is
 * never both credited and refunded.
 */
export function feeHasLiveCredit(paymentId: AnyColumn | string): SQL<boolean> {
  return sql<boolean>`exists (select 1 from credits lc where lc.payment_id = ${paymentId} and lc.voided_at is null)`;
}
