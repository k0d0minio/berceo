import { PlaceholderPage } from "@/components/vitrine/placeholder-page";
import { common } from "@/content/common";
import { legal } from "@/content/legal";
import { words } from "@/content/locale";
import { pageMetadata } from "../page-metadata";

const t = words(legal).confidentialite;
const c = words(common);

/* A placeholder until the founders deliver the text; out of search engines until then. */
export const metadata = pageMetadata(t.meta, c.pages.confidentialite.href, {
  index: false,
});

export default function ConfidentialitePage() {
  return <PlaceholderPage title={t.title} text={t.placeholder} />;
}
