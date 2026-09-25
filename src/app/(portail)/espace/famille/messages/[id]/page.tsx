import type { Metadata } from "next";

import { ConversationView, loadConversation } from "@/components/messagerie/conversation-view";
import { SpaceShell } from "@/components/shell/space-shell";
import { fill, words } from "@/content/locale";
import { messagerie } from "@/content/messagerie";
import { requireAccess } from "@/lib/auth/guard";
import { conversationPath } from "@/lib/messagerie/paths";

const t = words(messagerie);

export const metadata: Metadata = {
  title: t.meta.conversation,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/* One of her conversations; anyone else's, like an unknown one, is not found (D-91). */
export default async function ConversationFamillePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireAccess(conversationPath("famille", id));
  const thread = await loadConversation(user.id, "famille", id);
  return (
    <SpaceShell user={user} title={fill(t.conversation.titre, { prenom: thread.firstName })}>
      <ConversationView side="famille" thread={thread} />
    </SpaceShell>
  );
}
