import type { Metadata } from "next";

import { ConversationView, loadConversation } from "@/components/messagerie/conversation-view";
import { SpaceShell } from "@/components/shell/space-shell";
import { words } from "@/content/locale";
import { messagerie } from "@/content/messagerie";
import { requireAccess } from "@/lib/auth/guard";
import { conversationTitle } from "@/lib/messagerie/format";
import { conversationPath } from "@/lib/messagerie/paths";

const t = words(messagerie);

export const metadata: Metadata = {
  title: t.meta.conversation,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/* One of her conversations; anyone else's, like an unknown one, is not found (D-91). */
export default async function ConversationProfessionnellePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireAccess(conversationPath("professionnelle", id));
  const thread = await loadConversation(user.id, "professionnelle", id);
  return (
    <SpaceShell user={user} title={conversationTitle(thread)}>
      <ConversationView side="professionnelle" thread={thread} />
    </SpaceShell>
  );
}
