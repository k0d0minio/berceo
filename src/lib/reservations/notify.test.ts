import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RequestCard } from "@/lib/demandes/requests";

import { notifyBooking, notifyNewAnswer, notifyPriority } from "./notify";

/**
 * Spec (candidature-et-reservation): each answer e-mails the family with a
 * button to the professional's profile opened from that request, and a failed
 * send leaves the answer as it is; a booking e-mails both sides and tells the
 * other applicants « not retained »; a priority request e-mails its
 * professional at once. The database and Resend are mocked at their boundaries.
 */

const { answerNotice, bookingNotice, declinedNotices, priorityNotice, sendEmail } = vi.hoisted(() => ({
  answerNotice: vi.fn(),
  bookingNotice: vi.fn(),
  declinedNotices: vi.fn(),
  priorityNotice: vi.fn(),
  sendEmail: vi.fn<(to: string, email: { subject: string; text: string }, key?: string) => Promise<void>>(),
}));

vi.mock("./notices", () => ({ answerNotice, bookingNotice, declinedNotices, priorityNotice }));
vi.mock("@/lib/email/send", () => ({ sendEmail }));

const SITE = "https://uat.berceo.be";

const card: RequestCard = {
  id: "r1",
  urgent: false,
  nightDate: "2026-09-30",
  startTime: "20:00:00",
  children: "un_bebe",
  babyAgeValue: 3,
  babyAgeUnit: "mois",
  communeIns: "21009",
  postcode: "1050",
  locality: "Ixelles",
  createdAt: new Date("2026-09-25T08:00:00Z"),
};

beforeEach(() => {
  vi.clearAllMocks();
  sendEmail.mockResolvedValue(undefined);
  declinedNotices.mockResolvedValue([]);
});

describe("a new answer", () => {
  beforeEach(() => {
    answerNotice.mockResolvedValue({
      requestId: "r1",
      nightDate: "2026-09-30",
      family: { email: "sophie@example.be", firstName: "Sophie" },
      professional: { profileId: "p1", firstName: "Emma", profession: "sage_femme" },
    });
  });

  it("e-mails the family, with a button to her profile opened from the request", async () => {
    await notifyNewAnswer("a1", 2, SITE);
    expect(sendEmail).toHaveBeenCalledTimes(1);
    const [to, email, key] = sendEmail.mock.calls[0];
    expect(to).toBe("sophie@example.be");
    expect(email.subject).toBe("Emma a répondu à votre demande");
    expect(email.text).toContain("Emma, sage-femme, a postulé pour votre garde du 30/09/2026.");
    expect(email.text).toContain(`${SITE}/espace/famille/professionnelles/p1?demande=r1`);
    expect(key).toBe("reponse-a1-2");
  });

  it("logs a failed send and never throws", async () => {
    sendEmail.mockRejectedValue(new Error("Resend refused"));
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(notifyNewAnswer("a1", 1, SITE)).resolves.toBeUndefined();
    expect(logged).toHaveBeenCalled();
  });
});

describe("a booking", () => {
  it("confirms to both sides and tells the other applicants", async () => {
    bookingNotice.mockResolvedValue({
      id: "b1",
      nightDate: "2026-09-30",
      startTime: "20:00:00",
      family: { email: "sophie@example.be", firstName: "Sophie" },
      professional: { email: "emma@example.be", firstName: "Emma" },
    });
    declinedNotices.mockResolvedValue([
      { key: "a2", email: "julie@example.be", firstName: "Julie", request: card },
    ]);

    await notifyBooking("b1", ["a2"], SITE);

    const by = (to: string) => sendEmail.mock.calls.find(([address]) => address === to)!;
    expect(by("sophie@example.be")[1].subject).toBe("Votre garde du 30/09/2026 est confirmée ✓");
    expect(by("sophie@example.be")[1].text).toContain(`${SITE}/espace/famille/reservations/b1`);
    expect(by("emma@example.be")[1].subject).toBe("Garde confirmée : 30/09/2026 chez Sophie");
    expect(by("emma@example.be")[1].text).toContain(`${SITE}/espace/professionnelle/gardes/b1`);
    expect(by("julie@example.be")[1].subject).toBe("Votre disponibilité pour la garde du 30/09/2026");
    expect(by("julie@example.be")[2]).toBe("non-retenue-a2");
    expect(declinedNotices).toHaveBeenCalledWith(["a2"]);
  });
});

describe("a priority request", () => {
  it("e-mails the professional it was sent to, once", async () => {
    priorityNotice.mockResolvedValue({ key: "r1", email: "emma@example.be", firstName: "Emma", request: card });
    await notifyPriority("r1", SITE);
    const [to, email, key] = sendEmail.mock.calls[0];
    expect(to).toBe("emma@example.be");
    expect(email.subject).toBe("Une famille vous envoie sa demande en priorité");
    expect(key).toBe("priorite-r1");
  });

  it("sends nothing when the request is no longer open or she is no longer validated", async () => {
    priorityNotice.mockResolvedValue(null);
    await notifyPriority("r1", SITE);
    expect(sendEmail).not.toHaveBeenCalled();
  });
});
