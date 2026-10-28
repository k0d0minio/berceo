import { commentCaMarche } from "@/content/comment-ca-marche";
import { words } from "@/content/locale";
import { pageMetadata } from "../page-metadata";
import { SidePage, sides } from "./side-page";

const t = words(commentCaMarche);

export const metadata = pageMetadata(t.familles.meta, sides.familles.href);

/** The family's side, at the address the site has always indexed. */
export default function CommentCaMarcheParentsPage() {
  return <SidePage side="familles" />;
}
