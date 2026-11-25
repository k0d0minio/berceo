import type { UserRole } from "@/db/schema";
import { SPACES } from "@/lib/auth/routing";

/**
 * Where the footer of a signed-in space sends the two legal pages (JAM-582).
 * A family and a professional read them inside their own space, so the
 * signed-in shell stays: the public page has the public header, which reads
 * as signed out. A founder's back-office keeps the public pages.
 */

export type LegalPage = "conditionsGenerales" | "confidentialite";

/** The last segment of each legal page: the same in the space and on the public site. */
export const LEGAL_SLUGS = {
  conditionsGenerales: "conditions-generales",
  confidentialite: "confidentialite",
} as const satisfies Record<LegalPage, string>;

/** The legal page for `role`: inside the family's or the professional's space, else the public page. */
export function legalPath(role: UserRole, page: LegalPage): string {
  const slug = LEGAL_SLUGS[page];
  return role === "admin" ? `/${slug}` : `${SPACES[role]}/${slug}`;
}
