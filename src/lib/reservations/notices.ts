import "server-only";

import { alias } from "drizzle-orm/pg-core";
import { and, eq, inArray, isNull } from "drizzle-orm";

import {
  bookings,
  careRequestApplications,
  careRequests,
  db,
  professionalProfiles,
  users,
  type Profession,
} from "@/db";
import { cardColumns, type RequestCard } from "@/lib/demandes/requests";

/**
 * What the e-mails of an answer and a booking need, read by id after the
 * write they follow. The family's e-mail learns the professional's first name
 * and profession; the professional's e-mails learn the request's commune, night
 * and children, and the family's first name only once she is booked (D-15).
 */

const familyUser = alias(users, "family_user");
const professionalUser = alias(users, "professional_user");

export type AnswerNotice = {
  requestId: string;
  nightDate: string;
  family: { email: string; firstName: string };
  professional: { profileId: string; firstName: string; profession: Profession | null };
};

/** A new answer: to the family who published the request. */
export async function answerNotice(applicationId: string): Promise<AnswerNotice | null> {
  const [row] = await db
    .select({
      requestId: careRequests.id,
      nightDate: careRequests.nightDate,
      family: { email: familyUser.email, firstName: familyUser.firstName },
      professional: {
        profileId: professionalProfiles.id,
        firstName: professionalUser.firstName,
        profession: professionalProfiles.profession,
      },
    })
    .from(careRequestApplications)
    .innerJoin(careRequests, eq(careRequests.id, careRequestApplications.requestId))
    .innerJoin(familyUser, eq(familyUser.id, careRequests.familyUserId))
    .innerJoin(professionalProfiles, eq(professionalProfiles.id, careRequestApplications.profileId))
    .innerJoin(professionalUser, eq(professionalUser.id, professionalProfiles.userId))
    .where(and(eq(careRequestApplications.id, applicationId), eq(careRequestApplications.status, "en_attente")))
    .limit(1);
  return row ?? null;
}

export type BookingNotice = {
  id: string;
  nightDate: string;
  startTime: string;
  family: { email: string; firstName: string };
  professional: { email: string; firstName: string };
};

/** A booking confirmed: to both sides. */
export async function bookingNotice(bookingId: string): Promise<BookingNotice | null> {
  const [row] = await db
    .select({
      id: bookings.id,
      nightDate: careRequests.nightDate,
      startTime: careRequests.startTime,
      family: { email: familyUser.email, firstName: familyUser.firstName },
      professional: { email: professionalUser.email, firstName: professionalUser.firstName },
    })
    .from(bookings)
    .innerJoin(careRequests, eq(careRequests.id, bookings.requestId))
    .innerJoin(familyUser, eq(familyUser.id, bookings.familyUserId))
    .innerJoin(professionalProfiles, eq(professionalProfiles.id, bookings.profileId))
    .innerJoin(professionalUser, eq(professionalUser.id, professionalProfiles.userId))
    .where(eq(bookings.id, bookingId))
    .limit(1);
  return row ?? null;
}

export type ProfessionalNotice = {
  /** The answer's id, or the request's for a priority e-mail: the e-mail's key. */
  key: string;
  email: string;
  firstName: string;
  request: RequestCard;
};

/** Declined answers: to each professional, with the request's card and nothing about the family. */
export async function declinedNotices(applicationIds: string[]): Promise<ProfessionalNotice[]> {
  if (applicationIds.length === 0) return [];
  return db
    .select({
      key: careRequestApplications.id,
      email: professionalUser.email,
      firstName: professionalUser.firstName,
      request: cardColumns,
    })
    .from(careRequestApplications)
    .innerJoin(careRequests, eq(careRequests.id, careRequestApplications.requestId))
    .innerJoin(professionalProfiles, eq(professionalProfiles.id, careRequestApplications.profileId))
    .innerJoin(professionalUser, eq(professionalUser.id, professionalProfiles.userId))
    .where(
      and(
        inArray(careRequestApplications.id, applicationIds),
        eq(careRequestApplications.status, "non_retenue"),
      ),
    );
}

/** A priority request: to the professional it was sent to, while it is open and she is validated. */
export async function priorityNotice(requestId: string): Promise<ProfessionalNotice | null> {
  const [row] = await db
    .select({
      key: careRequests.id,
      email: professionalUser.email,
      firstName: professionalUser.firstName,
      request: cardColumns,
    })
    .from(careRequests)
    .innerJoin(professionalProfiles, eq(professionalProfiles.id, careRequests.priorityProfileId))
    .innerJoin(professionalUser, eq(professionalUser.id, professionalProfiles.userId))
    .where(
      and(
        eq(careRequests.id, requestId),
        eq(careRequests.status, "ouverte"),
        eq(professionalProfiles.status, "valide"),
        isNull(professionalUser.suspendedAt),
      ),
    )
    .limit(1);
  return row ?? null;
}
