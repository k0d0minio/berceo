import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RequestCard } from "@/lib/demandes/requests";

import { notifyBooking, notifyNewAnswer, notifyPriority, notifySeriesBooking, notifySeriesPriority } from "./notify";

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
  extraHours: 0,
  childAges: [{ value: 3, unit: "mois" }],
  feedings: ["allaitement_maternel"],
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

  it("says so when her answer proposes another start, and says nothing otherwise (JAM-306)", async () => {
    await notifyNewAnswer("a1", 1, SITE);
    expect(sendEmail.mock.calls[0][1].text).not.toContain("propose une autre heure de début");

    answerNotice.mockResolvedValue({
      requestId: "r1",
      nightDate: "2026-09-30",
      adapted: true,
      family: { email: "sophie@example.be", firstName: "Sophie" },
      professional: { profileId: "p1", firstName: "Emma", profession: "sage_femme" },
    });
    await notifyNewAnswer("a1", 2, SITE);
    expect(sendEmail.mock.calls[1][1].text).toContain(
      "Emma propose une autre heure de début. Vous la verrez sur sa réponse, et vous l'acceptez ou non au moment de réserver.",
    );
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

  it("names the credit part of the fee in the family's e-mail only (credits-au-paiement)", async () => {
    bookingNotice.mockResolvedValue({
      id: "b1",
      nightDate: "2026-09-30",
      startTime: "20:00:00",
      family: { email: "sophie@example.be", firstName: "Sophie" },
      professional: { email: "emma@example.be", firstName: "Emma" },
    });
    declinedNotices.mockResolvedValue([]);

    await notifyBooking("b1", [], SITE, { amountCents: 450, creditCents: 200 });

    const by = (to: string) => sendEmail.mock.calls.find(([address]) => address === to)!;
    expect(by("sophie@example.be")[1].text).toContain(
      "Vos frais de service de 4,50 € sont réglés : 2,00 € avec votre crédit Berceo et 2,50 € par Stripe.",
    );
    expect(by("emma@example.be")[1].text).not.toContain("avec votre crédit Berceo");
  });
});

describe("a booking at a proposed start (JAM-306)", () => {
  it("tells the other applicants the night at the start the family asked for, not at the booked professional's", async () => {
    bookingNotice.mockResolvedValue({
      id: "b1",
      nightDate: "2026-09-30",
      startTime: "21:00:00",
      family: { email: "sophie@example.be", firstName: "Sophie" },
      professional: { email: "emma@example.be", firstName: "Emma" },
    });
    // The request is booked: its start is Emma's proposal, and it keeps the family's 20:00.
    declinedNotices.mockResolvedValue([
      {
        key: "a2",
        email: "julie@example.be",
        firstName: "Julie",
        request: { ...card, startTime: "21:00:00", requestedStartTime: "20:00:00" },
      },
    ]);

    await notifyBooking("b1", ["a2"], SITE);

    const by = (to: string) => sendEmail.mock.calls.find(([address]) => address === to)!;
    expect(by("julie@example.be")[1].text).toContain("30/09/2026 de 20h00 à 7h00");
    expect(by("julie@example.be")[1].text).not.toContain("21h00");
    // The family's confirmation gives the agreed start.
    expect(by("sophie@example.be")[1].text).toContain("à partir de 21h00");
  });
});

/**
 * Spec (JAM-351): the confirmation of a regular request gives each side the
 * agreed start. Each night of the booked answer can hold its own proposed
 * start (JAM-306), so the family's e-mail gives each night its start when they
 * differ, and says the start once when they are the same.
 */
describe("the booking of a regular request (JAM-351)", () => {
  const night = (id: string, nightDate: string, startTime: string) => ({
    id,
    nightDate,
    startTime,
    family: { email: "sophie@example.be", firstName: "Sophie" },
    professional: { email: "emma@example.be", firstName: "Emma" },
  });
  const family = () => sendEmail.mock.calls.find(([address]) => address === "sophie@example.be")!;

  it("gives each night its agreed start when the nights do not start at the same hour", async () => {
    const nights = [night("b2", "2026-11-05", "21:30:00"), night("b1", "2026-11-02", "20:00:00")];
    bookingNotice.mockImplementation(async (id: string) => nights.find((n) => n.id === id) ?? null);

    await notifySeriesBooking(["b1", "b2"], [], SITE);

    expect(family()[1].subject).toBe("Votre garde du 02/11/2026, 05/11/2026 est confirmée ✓");
    expect(family()[1].text).toContain(
      "Tout est prêt. Emma sera chez vous le 02/11/2026 à partir de 20h00 et le 05/11/2026 à partir de 21h30. L'adresse lui a été transmise.",
    );
    expect(family()[2]).toBe("reservation-famille-b1");
  });

  it("says the start once when every night has the same", async () => {
    const nights = [night("b1", "2026-11-02", "21:00:00"), night("b2", "2026-11-05", "21:00")];
    bookingNotice.mockImplementation(async (id: string) => nights.find((n) => n.id === id) ?? null);

    await notifySeriesBooking(["b1", "b2"], [], SITE);

    expect(family()[1].text).toContain(
      "Tout est prêt. Emma sera chez vous le 02/11/2026, 05/11/2026 à partir de 21h00. L'adresse lui a été transmise.",
    );
  });
});

describe("a priority request", () => {
  it("reads the night at the start the family asked for (JAM-351)", async () => {
    priorityNotice.mockResolvedValue({
      key: "r1",
      email: "emma@example.be",
      firstName: "Emma",
      request: { ...card, startTime: "21:30:00", requestedStartTime: "20:00:00" },
    });
    await notifyPriority("r1", SITE);
    expect(sendEmail.mock.calls[0][1].text).toContain("30/09/2026 de 20h00 à 7h00");
    expect(sendEmail.mock.calls[0][1].text).not.toContain("21h30");
  });


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

/**
 * Spec (demande-nuits-regulieres, D-71): regular nights sent in priority are
 * one e-mail with each night still open, keyed by the first night.
 */
describe("regular nights sent in priority", () => {
  const notice = (id: string, nightDate: string) => ({
    key: id,
    email: "emma@example.be",
    firstName: "Emma",
    request: { ...card, id, nightDate },
  });

  it("sends one e-mail with each night still open, keyed by the first", async () => {
    priorityNotice.mockImplementation(async (id: string) =>
      id === "r2" ? null : notice(id, id === "r1" ? "2026-11-02" : "2026-11-09"),
    );
    await notifySeriesPriority(["r1", "r2", "r3"], SITE);
    expect(sendEmail).toHaveBeenCalledTimes(1);
    const [to, email, key] = sendEmail.mock.calls[0];
    expect(to).toBe("emma@example.be");
    expect(email.text).toContain("2 nuits régulières de 20h00 à 7h00 : 02/11/2026 et 09/11/2026.");
    expect(key).toBe("priorite-r1");
  });

  it("sends nothing when no night is still open", async () => {
    priorityNotice.mockResolvedValue(null);
    await notifySeriesPriority(["r1", "r2"], SITE);
    expect(sendEmail).not.toHaveBeenCalled();
  });
});
