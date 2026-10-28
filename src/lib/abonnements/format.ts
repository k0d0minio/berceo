import { abonnements } from "@/content/abonnements";
import { words } from "@/content/locale";
import type { SubscriptionPlan } from "@/db/schema";
import { formatDate } from "@/lib/demandes/format";
import { brusselsNow } from "@/lib/demandes/rules";

import { PLANS } from "./rules";

/** A plan's words in the catalogue: its name, duration and price, by the devis' order. */
export function planWords(plan: SubscriptionPlan): { name: string; duree: string; prix: string } {
  return words(abonnements).plans[PLANS.indexOf(plan)];
}

/** « 28/11/2026 »: the renewal date, the Brussels day of the period's end. */
export function renewalDate(periodEnd: Date): string {
  return formatDate(brusselsNow(periodEnd).date);
}
