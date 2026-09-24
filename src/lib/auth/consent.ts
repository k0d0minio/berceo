import type { ConsentDocument } from "@/db/schema";

/**
 * The versions of the two documents a sign-up accepts. The legal texts are the
 * founders' and are not delivered yet (the vitrine shows placeholders), so both
 * are drafts. When a final text ships, bump its version here: every sign-up
 * after that records the new one, and the ledger keeps who accepted what.
 */
export const consentVersions = {
  cgu: "brouillon-2026-09",
  confidentialite: "brouillon-2026-09",
} as const satisfies Record<ConsentDocument, string>;

/** The two ledger rows a sign-up writes: one per document, current version. */
export function consentRows(userId: string) {
  return (Object.keys(consentVersions) as ConsentDocument[]).map((document) => ({
    userId,
    document,
    version: consentVersions[document],
  }));
}
