import { PlaceholderPage } from "@/components/vitrine/placeholder-page";
import { common } from "@/content/common";
import { words } from "@/content/locale";
import { quiSommesNous } from "@/content/qui-sommes-nous";
import { pageMetadata } from "../page-metadata";

const t = words(quiSommesNous);
const c = words(common);

/* Out of search engines until the founders' story replaces the placeholder (V-2). */
export const metadata = pageMetadata(t.meta, c.pages.quiSommesNous.href, {
  index: false,
});

export default function QuiSommesNousPage() {
  return (
    <PlaceholderPage
      title={t.title}
      text={t.placeholder}
      closing={t.closing}
      cta={{
        label: c.cta.trouverProfessionnelle,
        href: c.pages.inscriptionFamille.href,
      }}
    />
  );
}
