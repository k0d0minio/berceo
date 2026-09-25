import type { ReactNode } from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { words } from "@/content/locale"
import { messagerie } from "@/content/messagerie"
import { professionLabel } from "@/lib/reservations/format"
import { conversationList } from "@/lib/messagerie/conversations"
import { listNight, preview } from "@/lib/messagerie/format"
import { conversationPath } from "@/lib/messagerie/paths"
import { isConversationOpen, type Side } from "@/lib/messagerie/rules"

/*
 * « Messages » (D-91): the viewer's conversations, the latest message first.
 * A row names the other person (the professional's profession for the family,
 * the family's first name only for the professional), the night, the first
 * line of the last message, and marks an unread or a closed conversation. The
 * guide's opening line heads the family's list.
 */

const t = words(messagerie)

function Mark({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-capsule px-3 py-1 text-legende font-semibold text-taupe",
        className
      )}
    >
      {children}
    </span>
  )
}

async function ConversationList({ userId, side }: { userId: string; side: Side }) {
  const rows = await conversationList(userId, side)
  const now = new Date()

  return (
    <>
      <p className="max-w-2xl text-intro text-taupe">
        {side === "famille" ? t.liste.introFamille : t.liste.introProfessionnelle}
      </p>
      {rows.length === 0 ? (
        <p className="max-w-2xl text-corps text-taupe">{t.liste.vide}</p>
      ) : (
        <ul className="flex max-w-3xl flex-col gap-4">
          {rows.map((row) => (
            <li key={row.id}>
              <Link
                href={conversationPath(side, row.id)}
                prefetch={false}
                className="flex flex-col gap-2 rounded-carte bg-perle px-6 py-5 transition-colors duration-200 ease-out hover:bg-beurre md:px-8"
              >
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-h3 text-sauge uppercase">{row.firstName}</span>
                  {row.unread ? <Mark className="bg-beurre">{t.liste.nonLu}</Mark> : null}
                  {!isConversationOpen(row, now) ? (
                    <Mark className="border border-solid border-taupe bg-blanc">{t.liste.fermee}</Mark>
                  ) : null}
                </span>
                {row.profession ? (
                  <span className="text-corps text-taupe">{professionLabel(row.profession)}</span>
                ) : null}
                <span className="text-corps font-semibold text-taupe">{listNight(row.nightDate)}</span>
                <span className={cn("truncate text-corps text-taupe", row.unread && "font-semibold")}>
                  {preview(row.last)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export { ConversationList }
