import Link from "next/link"
import { notFound } from "next/navigation"

import { SubscriptionRequired } from "@/components/abonnements/subscription-required"
import { Composer } from "@/components/messagerie/composer"
import { Thread } from "@/components/messagerie/thread"
import { Button } from "@/components/ui/button"
import { words } from "@/content/locale"
import { messagerie } from "@/content/messagerie"
import { familyRequestPath, PROFESSIONAL_REQUESTS_PATH } from "@/lib/demandes/paths"
import { sendMessageAction } from "@/lib/messagerie/actions"
import { conversationFor, markRead, type Thread as ThreadData } from "@/lib/messagerie/conversations"
import { conversationNight } from "@/lib/messagerie/format"
import { messagesPath } from "@/lib/messagerie/paths"
import { isConversationOpen, type Side } from "@/lib/messagerie/rules"
import { professionLabel } from "@/lib/reservations/format"
import { familyBookingPath, professionalBookingPath } from "@/lib/reservations/paths"

/*
 * One conversation, for one of its two parties (D-91): the other person and
 * the night, a way back to the request or the booking, the messages, and the
 * field while the conversation accepts messages (D-89), the closed line once
 * it does not. Opening it moves the viewer's read marker, after the messages
 * are read, so the count in the header drops on this very page. `locked`: a
 * family without a subscription reads an open conversation she may not write
 * in, and the invitation line takes the field's place (abonnements-acces).
 * The field and the lines that take its place are white cards on the pearl
 * page (JAM-327).
 */

const t = words(messagerie)

/** Where the header leads back to: the booking once booked, else the request (or her list). */
function backLink(side: Side, thread: ThreadData): { href: string; label: string } {
  if (thread.bookingId) {
    return side === "famille"
      ? { href: familyBookingPath(thread.bookingId), label: t.conversation.voirReservation }
      : { href: professionalBookingPath(thread.bookingId), label: t.conversation.voirGarde }
  }
  return side === "famille"
    ? { href: familyRequestPath(thread.requestId), label: t.conversation.voirDemande }
    : { href: PROFESSIONAL_REQUESTS_PATH, label: t.conversation.voirDemandes }
}

/** The conversation's data, or the not-found page for anyone but its two parties. */
async function loadConversation(userId: string, side: Side, id: string): Promise<ThreadData> {
  const thread = await conversationFor(userId, side, id)
  if (!thread) notFound()
  await markRead(userId, side, id, new Date())
  return thread
}

function ConversationView({ side, thread, locked = false }: { side: Side; thread: ThreadData; locked?: boolean }) {
  const back = backLink(side, thread)
  const open = isConversationOpen(thread, new Date())

  return (
    <>
      <div className="flex flex-col gap-1">
        {thread.profession ? (
          <p className="text-corps text-taupe">{professionLabel(thread.profession)}</p>
        ) : null}
        <p className="text-corps font-semibold text-taupe">
          {conversationNight(thread.nightDate, thread.startTime, thread.extraHours)}
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="raye">
          <Link href={back.href}>{back.label}</Link>
        </Button>
        <Button asChild variant="raye">
          <Link href={messagesPath(side)}>{t.conversation.toutes}</Link>
        </Button>
      </div>
      <Thread
        messages={thread.messages}
        side={side}
        otherName={thread.firstName}
        otherLastReadAt={thread.otherLastReadAt}
        booked={thread.booked}
      />
      <div className="max-w-3xl">
        {open && locked ? (
          <SubscriptionRequired className="rounded-carte bg-blanc px-6 py-4" />
        ) : open ? (
          <Composer action={sendMessageAction.bind(null, side, thread.id)} />
        ) : (
          <p className="rounded-carte bg-blanc px-6 py-4 text-corps text-taupe">{t.conversation.fermee}</p>
        )}
      </div>
    </>
  )
}

export { ConversationView, loadConversation }
