import "server-only";

import { and, asc, count, desc, eq, gt, inArray, isNull, ne, sql, type AnyColumn, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { bookings, credits, creditSpends, db, users, type CreditOrigin } from "@/db";
import { LIST_PAGE_SIZE } from "@/lib/admin/rules";
import { UUID } from "@/lib/demandes/requests";

import {
  balanceCents,
  creditShare,
  creditState,
  expiryOf,
  remainingCents,
  spendingPlan,
  splitShare,
  splitTakes,
  type CreditState,
  type Take,
} from "./rules";

/**
 * Every read and write of `credits` (credits-registre). The family's id comes
 * from the session (the caller's `requireAccess`), never from a form. The end
 * of a garde issues and voids its credit through the statements below, inside
 * its own batch (annulations-table, `src/lib/gardes/gardes.ts`);
 * The founders (annulations-back-office) grant a credit of a fee with
 * `grantCreditStatement` inside their own batch, and read every credit with
 * `adminCredits` and `liveCreditSummary`. The fee
 * (`src/lib/paiements/payments.ts`, credits-au-paiement) plans a credit part
 * with `planCreditPart`, holds it with `holdStatements` in the batch that
 * writes the fee, confirms it once paid, and releases it when the Checkout
 * closes unpaid or the fee is refunded. Only this folder and the schema name
 * the two tables (`isolation.test.ts`).
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

// ---------------------------------------------------------------------------
// The credit pays a fee (credits-au-paiement)
// ---------------------------------------------------------------------------

/** A take, with the credit's spent amount when it was planned: the guard of its update. */
export type HeldTake = Take & { spentBefore: number };

/** The credit part of one fee: how much the credit pays, from which credits. */
export type CreditPart = { creditCents: number; takes: HeldTake[] };

/**
 * The credit part of a fee of `feeCents` for this family at `now`: her balance
 * by `creditShare` (all of it, or enough to leave Stripe its minimum), taken
 * by `spendingPlan` (the earliest expiry first). A read only: nothing is held
 * until `holdStatements` runs in the fee's batch.
 */
export async function planCreditPart(familyUserId: string, feeCents: number, now: Date): Promise<CreditPart> {
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
  const share = creditShare(feeCents, balanceCents(usable, now));
  const { takes } = spendingPlan(usable, share, now);
  const before = new Map(usable.map((credit) => [credit.id, credit.spentCents]));
  return {
    creditCents: share,
    takes: takes.map((take) => ({ ...take, spentBefore: before.get(take.id) ?? -1 })),
  };
}

/**
 * One credit part cut over the fees of one Checkout (JAM-302): one part per
 * fee, each paying its fee whole or leaving Stripe its minimum
 * (`splitShare`), its takes cut in the plan's order (`splitTakes`). The parts
 * are held in the order of `feesCents`, in one batch.
 */
export function splitCreditPart(part: CreditPart, feesCents: readonly number[]): CreditPart[] {
  const amounts = splitShare(part.creditCents, feesCents);
  const takes = splitTakes(part.takes, amounts);
  return amounts.map((creditCents, i) => ({ creditCents, takes: takes[i] }));
}

/**
 * The statements that hold a credit part for the fee `paymentId`, for the
 * batch that writes the fee, after its insert. Each take adds its cents to
 * its credit, only if the credit is still as planned (spent amount, not
 * voided, not expired), and records the take with `status`. A take whose
 * credit changed records 0 cents: `credit_spends_cents_positive` refuses it,
 * and the whole batch rolls back (`isHoldConflict`). The fee is then never
 * written with a part no credit paid.
 */
export function holdStatements(
  part: CreditPart,
  paymentId: string,
  status: "reservee" | "confirmee",
  now: Date,
): SQL[] {
  const at = now.toISOString();
  return part.takes.map(
    (take) => sql`
      with taken as (
        update credits
        set spent_cents = spent_cents + ${take.cents}, updated_at = ${at}::timestamptz
        where id = ${take.id} and spent_cents = ${take.spentBefore}
          and voided_at is null and expires_at > ${at}::timestamptz
        returning id
      )
      insert into credit_spends (credit_id, payment_id, cents, status, created_at, updated_at)
      values (${take.id}, ${paymentId},
              (select case when count(*) = 1 then ${take.cents}::integer else 0 end from taken),
              ${status}::credit_spend_status, ${at}::timestamptz, ${at}::timestamptz)
      returning id
    `,
  );
}

/** Whether an error is a hold that found its credit changed: read the balance again. */
export function isHoldConflict(error: unknown): boolean {
  const cause = (error as { cause?: { code?: unknown; constraint?: unknown } } | null)?.cause;
  const own = error as { code?: unknown; constraint?: unknown } | null;
  const code = own?.code ?? cause?.code;
  const constraint = own?.constraint ?? cause?.constraint;
  return code === "23514" && constraint === "credit_spends_cents_positive";
}

/**
 * Confirms the takes an open Checkout held, once the fee is paid: for the
 * batch that marks the fee `payee`, after that update.
 */
export function confirmHoldStatement(paymentId: string, now: Date): SQL {
  const at = now.toISOString();
  return sql`
    update credit_spends
    set status = 'confirmee', updated_at = ${at}::timestamptz
    where payment_id = ${paymentId} and status = 'reservee'
      and exists (select 1 from payments p where p.id = ${paymentId} and p.status = 'payee')
    returning id
  `;
}

/**
 * Gives a fee's credit part back to its credits: each take not yet released
 * becomes `liberee` and its cents leave its credit's spent amount. Only once
 * the fee closed unpaid or was refunded (any status but `en_attente` and
 * `payee`), so it runs after the update that wrote that status. Safe to
 * repeat: a released take is never released twice. A credit that expired or
 * was voided meanwhile gets its cents back and still pays nothing.
 * `payment` is an SQL expression for the fee's id.
 */
function releaseStatement(payment: SQL, now: Date): SQL {
  const at = now.toISOString();
  return sql`
    with fee as (
      select p.id from payments p
      where p.id in (${payment}) and p.status not in ('en_attente', 'payee')
    ), freed as (
      update credit_spends s
      set status = 'liberee', updated_at = ${at}::timestamptz
      from fee
      where s.payment_id = fee.id and s.status <> 'liberee'
      returning s.credit_id, s.cents
    )
    update credits c
    set spent_cents = c.spent_cents - freed.cents, updated_at = ${at}::timestamptz
    from freed
    where c.id = freed.credit_id
    returning c.id
  `;
}

/** `releaseStatement` for the fee `paymentId`. */
export function releaseHoldStatement(paymentId: string, now: Date): SQL {
  return releaseStatement(sql`${paymentId}::uuid`, now);
}

/** `releaseStatement` for the fees of the Checkout `sessionId`: one, or each night of a regular request (JAM-302). */
export function releaseHoldOfSessionStatement(sessionId: string, now: Date): SQL {
  return releaseStatement(sql`select id from payments where stripe_session_id = ${sessionId}`, now);
}

/**
 * Whether the fee `paymentId` still holds its whole credit part: its takes
 * not released add up to `creditCents`. A fee whose Checkout closed and then
 * turned out paid holds nothing any more, and books nothing (the fee refunds).
 */
export async function creditPartHeld(paymentId: string, creditCents: number): Promise<boolean> {
  if (creditCents === 0) return true;
  const [row] = await db
    .select({ held: sql<number>`coalesce(sum(${creditSpends.cents}), 0)::integer` })
    .from(creditSpends)
    .where(and(eq(creditSpends.paymentId, paymentId), ne(creditSpends.status, "liberee")));
  return (row?.held ?? 0) === creditCents;
}

/**
 * The credit part this family would spend on each fee now, by fee in cents:
 * the récapitulatif names it before « Confirmer » (the same `creditShare` the
 * fee applies). Her balance is read once.
 */
export async function creditShares(familyUserId: string, feesCents: number[], now: Date): Promise<Map<number, number>> {
  if (feesCents.length === 0) return new Map();
  const { balanceCents: balance } = await familyCredits(familyUserId, now);
  return new Map(feesCents.map((fee) => [fee, creditShare(fee, balance)]));
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

// ---------------------------------------------------------------------------
// The founders' credits (annulations-back-office)
// ---------------------------------------------------------------------------

/**
 * A founder grants the family a credit of a cancelled garde's fee, as one
 * statement for the batch that also writes its journal entry
 * (`src/lib/admin/lists.ts`): the fee's amount, origin `geste_berceo`, the
 * founder and her note, from `now` for `CREDIT_MONTHS`. Only on a garde in
 * litige, or whose fee the family's own cancellation or absence left at
 * Berceo, while the fee is `payee` and the garde has no live credit: a second
 * click, a second founder, or a refunded fee writes nothing
 * (`credits_booking_live_key`).
 */
export function grantCreditStatement(bookingId: string, adminId: string, note: string, now: Date): SQL {
  const at = now.toISOString();
  return sql`
    insert into credits (family_user_id, amount_cents, origin, payment_id, booking_id, granted_by_user_id, note,
                         issued_at, expires_at, created_at, updated_at)
    select b.family_user_id, p.amount_cents, 'geste_berceo'::credit_origin, p.id, b.id, ${adminId}::uuid, ${note},
           ${at}::timestamptz, ${expiryOf(now).toISOString()}::timestamptz, ${at}::timestamptz, ${at}::timestamptz
    from bookings b
    join payments p on p.booking_id = b.id
    where b.id = ${bookingId}
      and b.status = 'annulee'
      and p.status = 'payee'
      and (b.disputed_at is not null or b.cancelled_by = 'famille')
    on conflict (booking_id) where booking_id is not null and voided_at is null do nothing
    returning id
  `;
}

/** Whether the batch's `grantCreditStatement` wrote the credit: the condition of the statements that follow it. */
export function grantedHere(bookingId: string, adminId: string, now: Date): SQL<boolean> {
  return sql<boolean>`exists (
    select 1 from credits gc
    where gc.booking_id = ${bookingId} and gc.origin = 'geste_berceo'
      and gc.granted_by_user_id = ${adminId}::uuid and gc.issued_at = ${now.toISOString()}::timestamptz
  )`;
}

/**
 * A credit that can still pay at `now`, in SQL, as `creditState` reads
 * « disponible »: not spent to the last cent, not voided, not expired. The
 * overview's block and the list's summary read this one condition (D-133).
 */
function liveAt(now: Date): SQL {
  const at = now.toISOString();
  return sql`(${credits.spentCents} < ${credits.amountCents}
    and (${credits.voidedAt} is null or ${credits.voidedAt} > ${at}::timestamptz)
    and ${credits.expiresAt} > ${at}::timestamptz)`;
}

/** How many credits can still pay at `now`, and what they can pay in all: the overview's block. */
export async function liveCreditSummary(now: Date): Promise<{ count: number; remainingCents: number }> {
  const [row] = await db
    .select({
      n: count(),
      cents: sql<string>`coalesce(sum(${credits.amountCents} - ${credits.spentCents}), 0)`,
    })
    .from(credits)
    .where(liveAt(now));
  return { count: row?.n ?? 0, remainingCents: Number(row?.cents ?? 0) };
}

export type AdminCredit = FamilyCredit & {
  family: { id: string; name: string } | null;
  /** The night of the garde it comes from, when one does. */
  nightDate: string | null;
  /** The founder who granted it (`geste_berceo`), and her note. */
  grantedBy: string | null;
  note: string | null;
};

const creditFamily = alias(users, "credit_family");
const creditGranter = alias(users, "credit_granter");

function personName(first: string | null, last: string | null): string | null {
  return first === null ? null : `${first} ${last ?? ""}`.trim();
}

/** One page of every credit, the newest first, 50 a page, for the founders. */
export async function adminCredits(page: number, now: Date): Promise<{ rows: AdminCredit[]; pages: number }> {
  const [rows, [total]] = await Promise.all([
    db
      .select({
        id: credits.id,
        amountCents: credits.amountCents,
        spentCents: credits.spentCents,
        origin: credits.origin,
        issuedAt: credits.issuedAt,
        expiresAt: credits.expiresAt,
        voidedAt: credits.voidedAt,
        note: credits.note,
        familyId: creditFamily.id,
        familyFirst: creditFamily.firstName,
        familyLast: creditFamily.lastName,
        granterFirst: creditGranter.firstName,
        granterLast: creditGranter.lastName,
        nightDate: bookings.nightDate,
      })
      .from(credits)
      .leftJoin(creditFamily, eq(creditFamily.id, credits.familyUserId))
      .leftJoin(creditGranter, eq(creditGranter.id, credits.grantedByUserId))
      .leftJoin(bookings, eq(bookings.id, credits.bookingId))
      .orderBy(desc(credits.issuedAt), desc(credits.id))
      .limit(LIST_PAGE_SIZE)
      .offset((page - 1) * LIST_PAGE_SIZE),
    db.select({ n: count() }).from(credits),
  ]);
  return {
    rows: rows.map((row) => {
      const name = personName(row.familyFirst, row.familyLast);
      return {
        id: row.id,
        amountCents: row.amountCents,
        spentCents: row.spentCents,
        origin: row.origin,
        issuedAt: row.issuedAt,
        expiresAt: row.expiresAt,
        voidedAt: row.voidedAt,
        state: creditState(row, now),
        remainingCents: remainingCents(row, now),
        family: row.familyId && name !== null ? { id: row.familyId, name } : null,
        nightDate: row.nightDate,
        grantedBy: personName(row.granterFirst, row.granterLast),
        note: row.note,
      };
    }),
    pages: Math.max(1, Math.ceil(total.n / LIST_PAGE_SIZE)),
  };
}

export type GrantedCreditNotice = {
  id: string;
  amountCents: number;
  expiresAt: Date;
  nightDate: string | null;
  family: { email: string; firstName: string };
};

/** The live credit a founder granted on a garde, and the family it went to: what its e-mail reads. */
export async function grantedCreditNotice(bookingId: string): Promise<GrantedCreditNotice | null> {
  if (!UUID.test(bookingId)) return null;
  const [row] = await db
    .select({
      id: credits.id,
      amountCents: credits.amountCents,
      expiresAt: credits.expiresAt,
      nightDate: bookings.nightDate,
      email: creditFamily.email,
      firstName: creditFamily.firstName,
    })
    .from(credits)
    .innerJoin(creditFamily, eq(creditFamily.id, credits.familyUserId))
    .leftJoin(bookings, eq(bookings.id, credits.bookingId))
    .where(and(eq(credits.bookingId, bookingId), eq(credits.origin, "geste_berceo"), isNull(credits.voidedAt)))
    .limit(1);
  if (!row) return null;
  const { email, firstName, ...credit } = row;
  return { ...credit, family: { email, firstName } };
}
