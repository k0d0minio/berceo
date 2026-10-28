import { permanentRedirect } from "next/navigation";

import { common } from "@/content/common";
import { words } from "@/content/locale";

const c = words(common);

/*
 * The family's side lives at `/comment-ca-marche`, the indexed address, so a
 * `/parents` address leads there rather than splitting the page in two.
 */
export default function CommentCaMarcheParentsRedirect() {
  permanentRedirect(c.pages.commentCaMarche.href);
}
