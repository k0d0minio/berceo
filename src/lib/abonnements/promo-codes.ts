import "server-only";

import type Stripe from "stripe";

import { journalInsert, type Person } from "@/lib/admin/journal";
import { stripe } from "@/lib/paiements/stripe";

import { stripePromotionCodeUrl, type PromoCodeDraft } from "./rules";

/**
 * The promotion codes (JAM-304, the answer Q3): the founders make and
 * deactivate them on « Codes promo », and Stripe keeps them. Berceo has no
 * table of codes: the list is read from Stripe each time. A code is a coupon
 * of duration `once`, so it lowers the first payment of any of the five
 * plans, and its promotion code, the text the family types on the Checkout.
 * Every Checkout of `./subscriptions.ts` accepts one. Each change writes one
 * line in the founders' journal. The rules of the form are `parsePromoCode`.
 */

function logError(what: string, context: Record<string, unknown>, error?: unknown): void {
  console.error(`[abonnements] ${what}`, {
    ...context,
    ...(error === undefined
      ? {}
      : {
          error: error instanceof Error ? error.name : typeof error,
          code: (error as { code?: unknown } | null)?.code,
        }),
  });
}

/** A promotion code's id at Stripe. */
export const PROMOTION_CODE_ID = /^promo_[A-Za-z0-9]+$/;

export type PromoCodeRow = {
  id: string;
  code: string;
  percentOff: number | null;
  /** In cents. */
  amountOffCents: number | null;
  expiresAt: Date | null;
  timesRedeemed: number;
  maxRedemptions: number | null;
  active: boolean;
  stripeUrl: string;
};

function couponOf(promotionCode: Stripe.PromotionCode): Stripe.Coupon | null {
  const coupon = promotionCode.promotion.coupon;
  return coupon && typeof coupon !== "string" ? coupon : null;
}

function rowOf(promotionCode: Stripe.PromotionCode): PromoCodeRow {
  const coupon = couponOf(promotionCode);
  return {
    id: promotionCode.id,
    code: promotionCode.code,
    percentOff: coupon?.percent_off ?? null,
    amountOffCents: coupon?.amount_off ?? null,
    expiresAt: promotionCode.expires_at ? new Date(promotionCode.expires_at * 1000) : null,
    timesRedeemed: promotionCode.times_redeemed,
    maxRedemptions: promotionCode.max_redemptions,
    active: promotionCode.active,
    stripeUrl: stripePromotionCodeUrl(promotionCode.id, process.env),
  };
}

/** The 100 newest codes, the active ones first. Null when Stripe cannot be read. */
export async function listPromoCodes(): Promise<PromoCodeRow[] | null> {
  try {
    const page = await stripe().promotionCodes.list({ limit: 100, expand: ["data.promotion.coupon"] });
    const rows = page.data.map(rowOf);
    return [...rows.filter((row) => row.active), ...rows.filter((row) => !row.active)];
  } catch (error) {
    logError("promotion codes not read", {}, error);
    return null;
  }
}

export type CreatePromoCodeResult = { ok: true; code: string } | { ok: false; error: "pris" | "generique" };

/** Whether Stripe refused the code because an active one already has it. */
function isTaken(error: unknown): boolean {
  const e = error as { code?: unknown; message?: unknown } | null;
  return e?.code === "resource_already_exists" || (typeof e?.message === "string" && /already exists/i.test(e.message));
}

/**
 * Makes the coupon, then its promotion code. A code that an active code
 * already uses is refused before anything is made. When the promotion code
 * fails, the coupon is deleted again, so nothing is left half made.
 */
export async function createPromoCode(draft: PromoCodeDraft, admin: Person, now: Date): Promise<CreatePromoCodeResult> {
  try {
    const existing = await stripe().promotionCodes.list({ code: draft.code, active: true, limit: 1 });
    if (existing.data.length > 0) return { ok: false, error: "pris" };
  } catch (error) {
    logError("promotion code not checked", {}, error);
    return { ok: false, error: "generique" };
  }

  const metadata = { source: "berceo", admin_user_id: admin.id };
  let coupon: Stripe.Coupon;
  try {
    coupon = await stripe().coupons.create({
      name: draft.code,
      duration: "once",
      metadata,
      ...(draft.percentOff !== null
        ? { percent_off: draft.percentOff }
        : { amount_off: draft.amountOffCents ?? 0, currency: "eur" }),
    });
  } catch (error) {
    logError("coupon not created", {}, error);
    return { ok: false, error: "generique" };
  }

  try {
    await stripe().promotionCodes.create({
      promotion: { type: "coupon", coupon: coupon.id },
      code: draft.code,
      metadata,
      ...(draft.expiresAt ? { expires_at: Math.floor(draft.expiresAt.getTime() / 1000) } : {}),
      ...(draft.maxRedemptions !== null ? { max_redemptions: draft.maxRedemptions } : {}),
    });
  } catch (error) {
    await stripe()
      .coupons.del(coupon.id)
      .catch((deleteError: unknown) => logError("orphan coupon not deleted", { couponId: coupon.id }, deleteError));
    if (isTaken(error)) return { ok: false, error: "pris" };
    logError("promotion code not created", {}, error);
    return { ok: false, error: "generique" };
  }

  try {
    await journalInsert({ action: "code_promo_cree", subject: null, admin, detail: draft.code, at: now });
  } catch (error) {
    logError("promotion code not journalled", { code: draft.code }, error);
  }
  return { ok: true, code: draft.code };
}

/**
 * Deactivates a code: Stripe never deletes a code, so this is its end. A
 * code already inactive changes nothing and writes no line.
 */
export async function deactivatePromoCode(id: string, admin: Person, now: Date): Promise<{ ok: boolean }> {
  if (!PROMOTION_CODE_ID.test(id)) return { ok: false };
  try {
    const current = await stripe().promotionCodes.retrieve(id);
    if (!current.active) return { ok: true };
    await stripe().promotionCodes.update(id, { active: false });
    try {
      await journalInsert({ action: "code_promo_desactive", subject: null, admin, detail: current.code, at: now });
    } catch (error) {
      logError("deactivation not journalled", { id }, error);
    }
    return { ok: true };
  } catch (error) {
    logError("promotion code not deactivated", { id }, error);
    return { ok: false };
  }
}
