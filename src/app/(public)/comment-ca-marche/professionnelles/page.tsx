import { commentCaMarche } from "@/content/comment-ca-marche";
import { words } from "@/content/locale";
import { pageMetadata } from "../../page-metadata";
import { SidePage, sides } from "../side-page";

const t = words(commentCaMarche);

export const metadata = pageMetadata(t.professionnelles.meta, sides.professionnelles.href);

/** The professional's side, reached from the switch. */
export default function CommentCaMarcheProfessionnellesPage() {
  return <SidePage side="professionnelles" />;
}
