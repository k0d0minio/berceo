import { abonnements } from "@/content/abonnements";
import { fill, words } from "@/content/locale";
import type { SubscriptionPlan } from "@/db/schema";
import { formatDate } from "@/lib/demandes/format";
import { brusselsNow } from "@/lib/demandes/rules";

import { monthlyCents, PLANS } from "./rules";

/** A plan's words in the catalogue: its name, duration and price, by the devis' order. */
export function planWords(plan: SubscriptionPlan): { name: string; duree: string; prix: string } {
  return words(abonnements).plans[PLANS.indexOf(plan)];
}

/** « 59,90 € » as 5990 cents: the price a visitor reads, in cents. */
export function priceCents(prix: string): number {
  return Number(prix.replace(/\D/g, ""));
}

/** 1997 cents as « 19,97 € », with the no-break space the catalogue uses before €. */
export function formatCents(cents: number): string {
  return `${Math.floor(cents / 100)},${String(cents % 100).padStart(2, "0")}\u00a0€`;
}

/**
 * « soit 19,97 € par mois »: the monthly equivalent of a plan of more than one
 * month, so the plans compare (JAM-581). Null for the one-month plan.
 */
export function monthlyLine(plan: SubscriptionPlan): string | null {
  const cents = monthlyCents(plan, priceCents(planWords(plan).prix));
  return cents === null ? null : fill(words(abonnements).parMois, { prix: formatCents(cents) });
}

/** « 28/11/2026 »: the renewal date, the Brussels day of the period's end. */
export function renewalDate(periodEnd: Date): string {
  return formatDate(brusselsNow(periodEnd).date);
}
