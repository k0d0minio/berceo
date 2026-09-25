import { allCommunePaths, publicProfessionalPath } from "./slugs";

/**
 * The sitemap's paths, pure (D-14, D-128): the vitrine's, then every commune
 * page, then the public page of each professional given, who must be the
 * validated ones (`validProfessionals`).
 */
export function sitemapPaths(
  vitrine: readonly string[],
  professionals: readonly { id: string; firstName: string }[],
): string[] {
  return [
    ...vitrine,
    ...allCommunePaths(),
    ...professionals.map((p) => publicProfessionalPath(p.firstName, p.id)),
  ];
}
