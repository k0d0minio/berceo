import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";

import { PublicProfessional } from "@/components/recherche/public-professional";
import { FAMILY_SIGN_UP_PATH, withReturn } from "@/lib/auth/routing";
import { teaserByShortId } from "@/lib/recherche/professionals";
import { professionalMeta, zoneNames } from "@/lib/recherche/rules";
import { communePath, publicProfessionalPath, shortIdOfSlug } from "@/lib/recherche/slugs";
import { communeName } from "@/lib/communes";
import { professionalProfilePath } from "@/lib/reservations/paths";

import { pageMetadata } from "../../page-metadata";

export const dynamic = "force-dynamic";

/** One read per request, shared by the metadata and the page. */
const teaserOf = cache((slug: string) => {
  const id8 = shortIdOfSlug(slug);
  return id8 ? teaserByShortId(id8, new Date()) : Promise.resolve(null);
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const teaser = await teaserOf(slug);
  if (!teaser) return {};
  return pageMetadata(professionalMeta(teaser), publicProfessionalPath(teaser.firstName, teaser.id));
}

/*
 * A validated professional's public, indexable teaser (D-14, D-125):
 * resolved on the short id alone; a first-name part that is not the canonical
 * one is sent there for good; an unknown id, several, or a profile no longer
 * validated is not found. Rendered on each request, so a professional who
 * stops being validated disappears at once.
 */
export default async function PublicProfessionalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const teaser = await teaserOf(slug);
  if (!teaser) notFound();

  const canonical = publicProfessionalPath(teaser.firstName, teaser.id);
  if (`/professionnelles/${slug}` !== canonical) permanentRedirect(canonical);

  const zone = zoneNames(teaser.communes).map((name) => {
    const ins = teaser.communes.find((code) => communeName(code) === name);
    return { name, href: ins ? communePath(ins) : null };
  });

  return (
    <PublicProfessional
      firstName={teaser.firstName}
      profession={teaser.profession}
      bio={teaser.bio}
      zone={zone}
      note={teaser.note}
      signUpHref={withReturn(FAMILY_SIGN_UP_PATH, professionalProfilePath(teaser.id))}
    />
  );
}
