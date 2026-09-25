import * as React from "react"

import { cn } from "@/lib/utils"
import { words } from "@/content/locale"
import { messagerie } from "@/content/messagerie"
import type { ThreadMessage } from "@/lib/messagerie/conversations"
import { messageDay, messageTime } from "@/lib/messagerie/format"
import { readReceiptIndex, reminderIndexes, type Side } from "@/lib/messagerie/rules"

/*
 * The messages of a conversation, in the order they were sent, grouped by day
 * (Brussels). Berceo's two sit apart on pearl under « L'équipe Berceo »
 * (D-87), rendered from the catalogue; the viewer's own on the right, the
 * other person's on the left. Plain text: React escapes it, line breaks are
 * kept, nothing becomes a link. « Lu » under the viewer's last message once
 * the other side opened the conversation after it; the reminder line after
 * every third message of the two people, never in the booked conversation
 * (D-88).
 */

const t = words(messagerie)

const berceoText = {
  amorce: t.berceo.amorce,
  bonne_garde: t.berceo.bonneGarde,
} as const

function Thread({
  messages,
  side,
  otherName,
  otherLastReadAt,
  booked,
}: {
  messages: readonly ThreadMessage[]
  side: Side
  otherName: string
  otherLastReadAt: Date | null
  booked: boolean
}) {
  const receipt = readReceiptIndex(messages, side, otherLastReadAt)
  const reminders = new Set(reminderIndexes(messages, booked))

  return (
    <ol className="flex max-w-3xl flex-col gap-4">
      {messages.map((message, i) => {
        const day = messageDay(message.createdAt)
        const newDay = i === 0 || messageDay(messages[i - 1].createdAt) !== day
        const own = message.author === side
        const berceo = message.author === "berceo"
        const author = berceo ? t.conversation.berceo : own ? t.conversation.vous : otherName

        return (
          <React.Fragment key={message.id}>
            {newDay ? (
              <li className="self-center text-legende text-taupe">{day}</li>
            ) : null}
            <li className={cn("flex max-w-[85%] flex-col gap-1", own ? "self-end items-end" : "self-start")}>
              <div
                className={cn(
                  "flex flex-col gap-2 rounded-carte px-6 py-4 text-taupe",
                  berceo && "bg-perle",
                  own && "bg-beurre",
                  !berceo && !own && "border border-solid border-perle bg-blanc"
                )}
              >
                <p className={cn("text-legende font-semibold", berceo ? "font-display text-sauge" : own && "sr-only")}>
                  {author}
                </p>
                <p className="text-corps break-words whitespace-pre-line">
                  {message.berceoKey ? berceoText[message.berceoKey] : message.body}
                </p>
              </div>
              <p className="px-2 text-legende text-taupe">
                <time dateTime={message.createdAt.toISOString()}>{messageTime(message.createdAt)}</time>
                {i === receipt ? <span className="font-semibold text-sauge"> · {t.conversation.lu}</span> : null}
              </p>
            </li>
            {reminders.has(i) ? (
              <li role="note" className="self-center rounded-capsule border border-solid border-taupe px-4 py-2 text-legende text-taupe">
                {t.conversation.rappel}
              </li>
            ) : null}
          </React.Fragment>
        )
      })}
    </ol>
  )
}

export { Thread }
