import "server-only";

import { and, asc, count, desc, eq, exists, inArray, sql, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import {
  bookings,
  careRequestApplications,
  careRequests,
  conversations,
  db,
  messages,
  professionalProfiles,
  users,
  type BerceoMessage,
  type CareRequestStatus,
  type Profession,
} from "@/db";
import { UUID } from "@/lib/demandes/requests";
import { NIGHT_HOURS, TIME_ZONE } from "@/lib/demandes/rules";

import { isConversationOpen, type Author, type Side } from "./rules";

/**
 * Every read and write of a conversation and its messages (messagerie). Only
 * the two parties read one: the family who owns the request (her user id) and
 * the professional who answered it (her profile's user id), both taken from
 * the session; any other id reads as not found (D-91). A conversation is made
 * with its answer and receives Berceo's messages inside the answer's and the
 * booking's own statements (`withConversation`, `bonneGardeStatement`); the
 * people's messages go through `sendMessage`, which holds the party and the
 * closing rule (D-89) again in its SQL.
 */

/** Whether the viewer is this conversation's family, or its professional. */
function partyOf(side: Side, userId: string): SQL {
  return side === "famille"
    ? eq(conversations.familyUserId, userId)
    : exists(
        db
          .select({ id: professionalProfiles.id })
          .from(professionalProfiles)
          .where(and(eq(professionalProfiles.id, conversations.profileId), eq(professionalProfiles.userId, userId))),
      );
}

/** The same, in raw SQL over a conversation aliased `c`. */
function partyOfC(side: Side, userId: string): SQL {
  return side === "famille"
    ? sql`c.family_user_id = ${userId}`
    : sql`exists (select 1 from professional_profiles p where p.id = c.profile_id and p.user_id = ${userId})`;
}

/** The side's read marker. */
function markerOf(side: Side) {
  return side === "famille" ? conversations.familyLastReadAt : conversations.professionalLastReadAt;
}

/** The other person: the professional's user for the family, the family's for the professional. */
function otherUserJoin(side: Side): SQL {
  return side === "famille" ? eq(users.id, professionalProfiles.userId) : eq(users.id, conversations.familyUserId);
}

/** Whether the viewer has a message from the other side or Berceo after her marker. */
function hasUnread(side: Side): SQL<boolean> {
  return sql<boolean>`exists (
    select 1 from ${messages}
    where ${messages.conversationId} = ${conversations.id}
      and ${messages.author} <> ${side}::message_author
      and ${messages.createdAt} > coalesce(${markerOf(side)}, '-infinity'::timestamptz)
  )`;
}

// ---------------------------------------------------------------------------
// Inside the answer and the booking
// ---------------------------------------------------------------------------

/**
 * Wraps the answer's INSERT (which must return `id`, `answer_count`,
 * `request_id` and `profile_id`) so the same statement makes the answer's
 * conversation with Berceo's amorce (D-87). A re-answer after a withdrawal
 * finds its conversation and adds nothing; the unique index on `berceo_key`
 * holds one amorce per conversation whatever happens.
 */
export function withConversation(answerInsert: SQL, at: string): SQL {
  return sql`
    with answer as (${answerInsert}),
    conversation as (
      insert into conversations (application_id, request_id, profile_id, family_user_id, last_message_at, created_at, updated_at)
      select a.id, a.request_id, a.profile_id, r.family_user_id, ${at}::timestamptz, ${at}::timestamptz, ${at}::timestamptz
      from answer a join care_requests r on r.id = a.request_id
      on conflict (application_id) do nothing
      returning id
    ),
    amorce as (
      insert into messages (conversation_id, author, berceo_key, created_at)
      select id, 'berceo', 'amorce', ${at}::timestamptz from conversation
      on conflict do nothing
    )
    select id, answer_count from answer
  `;
}

/**
 * For the booking's batch, after the booking is made: Berceo's « excellente
 * garde » in the booked answer's conversation, and in no other (D-87). An
 * answer without a conversation (none should remain after the migration)
 * gets one here. Nothing happens when this batch did not make the booking
 * (a second click finds the first one's booking, confirmed at another moment).
 */
export function bonneGardeStatement(applicationId: string, at: string): SQL {
  return sql`
    with conversation as (
      insert into conversations (application_id, request_id, profile_id, family_user_id, last_message_at, created_at, updated_at)
      select b.application_id, b.request_id, b.profile_id, b.family_user_id, ${at}::timestamptz, ${at}::timestamptz, ${at}::timestamptz
      from bookings b where b.application_id = ${applicationId} and b.confirmed_at = ${at}::timestamptz
      on conflict (application_id) do update
        set last_message_at = excluded.last_message_at, updated_at = excluded.updated_at
      returning id
    )
    insert into messages (conversation_id, author, berceo_key, created_at)
    select id, 'berceo', 'bonne_garde', ${at}::timestamptz from conversation
    on conflict do nothing
  `;
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/** The last message of a conversation, as the list previews it. */
export type LastMessage = { author: Author; body: string | null; berceoKey: BerceoMessage | null };

export type ConversationRow = {
  id: string;
  /** The other person's first name; her profession when the viewer is the family. */
  firstName: string;
  profession: Profession | null;
  nightDate: string;
  startTime: string;
  status: CareRequestStatus;
  lastMessageAt: Date;
  last: LastMessage | null;
  unread: boolean;
};

/** « Messages »: the viewer's conversations, the latest message first. */
export async function conversationList(userId: string, side: Side): Promise<ConversationRow[]> {
  const rows = await db
    .select({
      id: conversations.id,
      firstName: users.firstName,
      profession: professionalProfiles.profession,
      nightDate: careRequests.nightDate,
      startTime: careRequests.startTime,
      status: careRequests.status,
      lastMessageAt: conversations.lastMessageAt,
      last: sql<LastMessage | null>`(
        select json_build_object('author', m.author, 'body', m.body, 'berceoKey', m.berceo_key)
        from messages m where m.conversation_id = ${conversations.id}
        order by m.created_at desc, m.id desc limit 1
      )`,
      unread: hasUnread(side),
    })
    .from(conversations)
    .innerJoin(careRequests, eq(careRequests.id, conversations.requestId))
    .innerJoin(professionalProfiles, eq(professionalProfiles.id, conversations.profileId))
    .innerJoin(users, otherUserJoin(side))
    .where(side === "famille" ? eq(conversations.familyUserId, userId) : eq(professionalProfiles.userId, userId))
    .orderBy(desc(conversations.lastMessageAt));
  return rows.map((row) => ({ ...row, profession: side === "famille" ? row.profession : null }));
}

/** How many of the viewer's conversations hold an unread message: the header's count. */
export async function unreadCount(userId: string, side: Side): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(conversations)
    .where(and(partyOf(side, userId), hasUnread(side)));
  return Number(row?.n ?? 0);
}

export type ThreadMessage = {
  id: string;
  author: Author;
  body: string | null;
  berceoKey: BerceoMessage | null;
  createdAt: Date;
};

export type Thread = {
  id: string;
  requestId: string;
  firstName: string;
  profession: Profession | null;
  nightDate: string;
  startTime: string;
  status: CareRequestStatus;
  /** Her answer is the booked one: no reminder line (D-88). */
  booked: boolean;
  bookingId: string | null;
  otherLastReadAt: Date | null;
  messages: ThreadMessage[];
};

/** One conversation for one of its two parties, its messages in the order they were sent; null for anyone else. */
export async function conversationFor(userId: string, side: Side, id: string): Promise<Thread | null> {
  if (!UUID.test(id)) return null;
  const [row] = await db
    .select({
      id: conversations.id,
      requestId: conversations.requestId,
      firstName: users.firstName,
      profession: professionalProfiles.profession,
      nightDate: careRequests.nightDate,
      startTime: careRequests.startTime,
      status: careRequests.status,
      answerStatus: careRequestApplications.status,
      bookingId: bookings.id,
      familyLastReadAt: conversations.familyLastReadAt,
      professionalLastReadAt: conversations.professionalLastReadAt,
    })
    .from(conversations)
    .innerJoin(careRequests, eq(careRequests.id, conversations.requestId))
    .innerJoin(careRequestApplications, eq(careRequestApplications.id, conversations.applicationId))
    .innerJoin(professionalProfiles, eq(professionalProfiles.id, conversations.profileId))
    .innerJoin(users, otherUserJoin(side))
    .leftJoin(bookings, eq(bookings.applicationId, conversations.applicationId))
    .where(and(eq(conversations.id, id), partyOf(side, userId)))
    .limit(1);
  if (!row) return null;

  const thread = await db
    .select({
      id: messages.id,
      author: messages.author,
      body: messages.body,
      berceoKey: messages.berceoKey,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(eq(messages.conversationId, row.id))
    .orderBy(asc(messages.createdAt), asc(messages.id));

  const { answerStatus, familyLastReadAt, professionalLastReadAt, ...header } = row;
  return {
    ...header,
    profession: side === "famille" ? header.profession : null,
    booked: answerStatus === "retenue",
    otherLastReadAt: side === "famille" ? professionalLastReadAt : familyLastReadAt,
    messages: thread,
  };
}

/** Opening the conversation moves the viewer's read marker to now (D-91). */
export async function markRead(userId: string, side: Side, id: string, now: Date): Promise<void> {
  if (!UUID.test(id)) return;
  await db
    .update(conversations)
    .set(side === "famille" ? { familyLastReadAt: now } : { professionalLastReadAt: now })
    .where(and(eq(conversations.id, id), partyOf(side, userId)));
}

/** The family's conversation on each of her answers, by answer id: « Écrire à [Prénom] ». */
export async function conversationsOfAnswers(userId: string, applicationIds: string[]): Promise<Map<string, string>> {
  const ids = applicationIds.filter((id) => UUID.test(id));
  if (ids.length === 0) return new Map();
  const rows = await db
    .select({ applicationId: conversations.applicationId, id: conversations.id })
    .from(conversations)
    .where(and(inArray(conversations.applicationId, ids), eq(conversations.familyUserId, userId)));
  return new Map(rows.map((r) => [r.applicationId, r.id]));
}

/** The professional's conversation on each request she answered, by request id: « Voir la conversation ». */
export async function conversationsOfRequests(userId: string, requestIds: string[]): Promise<Map<string, string>> {
  const ids = requestIds.filter((id) => UUID.test(id));
  if (ids.length === 0) return new Map();
  const rows = await db
    .select({ requestId: conversations.requestId, id: conversations.id })
    .from(conversations)
    .where(and(inArray(conversations.requestId, ids), partyOf("professionnelle", userId)));
  return new Map(rows.map((r) => [r.requestId, r.id]));
}

/** The conversation of one of the viewer's bookings. */
export async function conversationOfBooking(userId: string, side: Side, bookingId: string): Promise<string | null> {
  if (!UUID.test(bookingId)) return null;
  const [row] = await db
    .select({ id: conversations.id })
    .from(conversations)
    .innerJoin(bookings, eq(bookings.applicationId, conversations.applicationId))
    .where(and(eq(bookings.id, bookingId), partyOf(side, userId)))
    .limit(1);
  return row?.id ?? null;
}

// ---------------------------------------------------------------------------
// Sending
// ---------------------------------------------------------------------------

export type SendResult =
  | { ok: true; inserted: boolean }
  | { ok: false; reason: "introuvable" | "fermee" };

/**
 * One of the two people writes (E-01). The facts are read first for a precise
 * message, then held again by the statement: the viewer is a party, the
 * request is not cancelled and its night has not ended (D-89). The message
 * takes the id the browser gave it, so a retried or double-clicked send
 * inserts once and reports `inserted: false`, and the caller sends no second
 * e-mail. The sender's own marker moves with her message.
 */
export async function sendMessage(
  userId: string,
  side: Side,
  conversationId: string,
  messageId: string,
  body: string,
  now: Date,
): Promise<SendResult> {
  if (!UUID.test(conversationId) || !UUID.test(messageId)) return { ok: false, reason: "introuvable" };

  const [facts] = await db
    .select({ status: careRequests.status, nightDate: careRequests.nightDate, startTime: careRequests.startTime })
    .from(conversations)
    .innerJoin(careRequests, eq(careRequests.id, conversations.requestId))
    .where(and(eq(conversations.id, conversationId), partyOf(side, userId)))
    .limit(1);
  if (!facts) return { ok: false, reason: "introuvable" };
  if (!isConversationOpen(facts, now)) return { ok: false, reason: "fermee" };

  const at = now.toISOString();
  const marker = sql.raw(side === "famille" ? "family_last_read_at" : "professional_last_read_at");
  const written = await db.execute<{ open: number; inserted: number }>(sql`
    with target as (
      select c.id from conversations c
      join care_requests r on r.id = c.request_id
      where c.id = ${conversationId}
        and ${partyOfC(side, userId)}
        and r.status <> 'annulee'
        and (r.night_date + r.start_time + ${`${NIGHT_HOURS} hours`}::interval) > (now() at time zone ${TIME_ZONE})
    ),
    inserted as (
      insert into messages (id, conversation_id, author, body, created_at)
      select ${messageId}::uuid, t.id, ${side}::message_author, ${body}, ${at}::timestamptz from target t
      on conflict (id) do nothing
      returning id
    ),
    touched as (
      update conversations
      set last_message_at = ${at}::timestamptz, updated_at = ${at}::timestamptz, ${marker} = ${at}::timestamptz
      where id = ${conversationId} and exists (select 1 from inserted)
      returning id
    )
    select (select count(*) from target)::int as open, (select count(*) from inserted)::int as inserted
  `);
  const [result] = written.rows;
  // Cancelled, or the night ended, between the read and the write.
  if (!result || Number(result.open) === 0) return { ok: false, reason: "fermee" };
  return { ok: true, inserted: Number(result.inserted) === 1 };
}

// ---------------------------------------------------------------------------
// The e-mail's facts
// ---------------------------------------------------------------------------

const familyUser = alias(users, "family_user");
const professionalUser = alias(users, "professional_user");

export type MessageNotice = {
  conversationId: string;
  nightDate: string;
  /** Who receives the e-mail, and on which side. */
  recipient: { side: Side; email: string; firstName: string };
  /** Who wrote: her first name only. */
  senderFirstName: string;
};

/**
 * A message one of the two people wrote, as its e-mail to the other needs it;
 * null for Berceo's, and when the other is suspended.
 */
export async function messageNotice(messageId: string): Promise<MessageNotice | null> {
  if (!UUID.test(messageId)) return null;
  const [row] = await db
    .select({
      author: messages.author,
      conversationId: conversations.id,
      nightDate: careRequests.nightDate,
      family: { email: familyUser.email, firstName: familyUser.firstName, suspendedAt: familyUser.suspendedAt },
      professional: {
        email: professionalUser.email,
        firstName: professionalUser.firstName,
        suspendedAt: professionalUser.suspendedAt,
      },
    })
    .from(messages)
    .innerJoin(conversations, eq(conversations.id, messages.conversationId))
    .innerJoin(careRequests, eq(careRequests.id, conversations.requestId))
    .innerJoin(familyUser, eq(familyUser.id, conversations.familyUserId))
    .innerJoin(professionalProfiles, eq(professionalProfiles.id, conversations.profileId))
    .innerJoin(professionalUser, eq(professionalUser.id, professionalProfiles.userId))
    .where(eq(messages.id, messageId))
    .limit(1);
  if (!row || row.author === "berceo") return null;

  const fromFamily = row.author === "famille";
  const { suspendedAt, ...recipient } = fromFamily ? row.professional : row.family;
  // A suspended account cannot sign in to read it (D-134): no e-mail.
  if (suspendedAt) return null;
  return {
    conversationId: row.conversationId,
    nightDate: row.nightDate,
    recipient: { side: fromFamily ? "professionnelle" : "famille", ...recipient },
    senderFirstName: (fromFamily ? row.family : row.professional).firstName,
  };
}
