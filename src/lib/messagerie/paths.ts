import { SPACES } from "@/lib/auth/routing";

import type { Side } from "./rules";

/** « Messages », inside each space (and so behind its guard, D-91). */
export const FAMILY_MESSAGES_PATH = `${SPACES.parent}/messages`;
export const PROFESSIONAL_MESSAGES_PATH = `${SPACES.professionnel}/messages`;

export function messagesPath(side: Side): string {
  return side === "famille" ? FAMILY_MESSAGES_PATH : PROFESSIONAL_MESSAGES_PATH;
}

export function conversationPath(side: Side, id: string): string {
  return `${messagesPath(side)}/${id}`;
}
