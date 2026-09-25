import type { Metadata } from "next";

import { ConversationList } from "@/components/messagerie/conversation-list";
import { SpaceShell } from "@/components/shell/space-shell";
import { words } from "@/content/locale";
import { messagerie } from "@/content/messagerie";
import { requireAccess } from "@/lib/auth/guard";
import { PROFESSIONAL_MESSAGES_PATH } from "@/lib/messagerie/paths";

const t = words(messagerie);

export const metadata: Metadata = {
  title: t.meta.liste,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/* « Messages » (D-91): her conversations, the latest message first. */
export default async function MessagesProfessionnellePage() {
  const user = await requireAccess(PROFESSIONAL_MESSAGES_PATH);
  return (
    <SpaceShell user={user} title={t.liste.titre}>
      <ConversationList userId={user.id} side="professionnelle" />
    </SpaceShell>
  );
}
