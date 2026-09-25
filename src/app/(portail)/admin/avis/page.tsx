import type { Metadata } from "next";
import Link from "next/link";

import { RatingsTable } from "@/components/avis/ratings-table";
import { SpaceShell } from "@/components/shell/space-shell";
import { admin } from "@/content/admin";
import { fill, words } from "@/content/locale";
import { requireAccess } from "@/lib/auth/guard";
import { SPACES } from "@/lib/auth/routing";
import { ADMIN_RATINGS_PATH } from "@/lib/avis/paths";
import { ADMIN_PAGE_SIZE, adminRatingCount, adminRatings } from "@/lib/avis/ratings";

const a = words(admin);

export const metadata: Metadata = {
  title: a.avis.titre,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const link = "self-start text-corps font-semibold text-encre-sauge underline underline-offset-4";

/*
 * « Avis après les gardes » (avis-etoiles, G-03, D-118): every rating, published
 * or not, newest first, 50 a page. Read-only: it writes and journals nothing;
 * back-office-admin folds it into the « Vue d'ensemble ». A 404 to anyone but
 * an admin (D-33).
 */
export default async function AvisPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const user = await requireAccess(ADMIN_RATINGS_PATH);
  const { page: pageParam } = await searchParams;
  const total = await adminRatingCount();
  const pages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const requested = Number.parseInt(pageParam ?? "1", 10);
  const page = Number.isInteger(requested) ? Math.min(Math.max(requested, 1), pages) : 1;
  const rows = await adminRatings(page);

  return (
    <SpaceShell user={user} title={a.avis.titre}>
      <Link href={SPACES.admin} className={link}>
        {a.avis.retour}
      </Link>
      <p className="max-w-3xl text-corps text-encre-taupe">{a.avis.intro}</p>
      {rows.length === 0 ? (
        <p className="text-corps text-encre-taupe">{a.avis.vide}</p>
      ) : (
        <RatingsTable rows={rows} />
      )}
      {pages > 1 ? (
        <nav className="flex flex-wrap items-center gap-4">
          {page > 1 ? (
            <Link href={`${ADMIN_RATINGS_PATH}?page=${page - 1}`} className={link}>
              {a.avis.pages.precedente}
            </Link>
          ) : null}
          <span className="text-corps text-encre-taupe">{fill(a.avis.pages.position, { page: String(page) })}</span>
          {page < pages ? (
            <Link href={`${ADMIN_RATINGS_PATH}?page=${page + 1}`} className={link}>
              {a.avis.pages.suivante}
            </Link>
          ) : null}
        </nav>
      ) : null}
    </SpaceShell>
  );
}
