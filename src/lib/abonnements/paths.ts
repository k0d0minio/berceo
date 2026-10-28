import { SPACES } from "@/lib/auth/routing";

/** « Votre abonnement »: the four plans, or the family's plan and its renewal date. */
export const SUBSCRIPTION_PATH = `${SPACES.parent}/abonnement`;

/**
 * Opens the Checkout of the plan the family picked at sign-up
 * (abonnements-inscription-famille). Only a redirect leads here, the e-mail
 * confirmation's: never a link, which a prefetch would open.
 */
export const SUBSCRIPTION_START_PATH = `${SUBSCRIPTION_PATH}/commencer`;

/** Where Stripe sends the family back once she paid (`success_url`). */
export const SUBSCRIPTION_RETURN_PATH = `${SUBSCRIPTION_PATH}/retour`;

/** Where Stripe's customer portal sends the family back: the row is synced, then « Votre abonnement ». */
export const SUBSCRIPTION_PORTAL_RETURN_PATH = `${SUBSCRIPTION_PATH}/portail`;

/** The founders' list of subscriptions (abonnements-back-office). */
export const ADMIN_SUBSCRIPTIONS_PATH = `${SPACES.admin}/abonnements`;
