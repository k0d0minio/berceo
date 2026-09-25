import { beforeEach, describe, expect, it, vi } from "vitest";

import { notifyUrgentRequest, sendRequestDigest } from "./notify";
import type { Recipient, RequestCard } from "./requests";

/**
 * Spec (demande-de-garde, D-51): the digest leaves at 18:00 Brussels or later,
 * sends each matching validated professional one e-mail listing her new normal
 * requests, and nothing to a professional with none; the urgent e-mail goes at
 * once to every validated professional serving the commune, and a failed send
 * never throws. The database and Resend are mocked at their boundaries.
 */

const { claimDigestRequests, professionalsServing, requestForNotice, sendEmail } = vi.hoisted(() => ({
  claimDigestRequests: vi.fn<() => Promise<RequestCard[]>>(),
  professionalsServing: vi.fn<(communes: string[]) => Promise<Recipient[]>>(),
  requestForNotice: vi.fn(),
  sendEmail: vi.fn<(to: string, email: { subject: string; text: string }, key?: string) => Promise<void>>(),
}));

vi.mock("./requests", () => ({ claimDigestRequests, professionalsServing, requestForNotice }));
vi.mock("@/lib/email/send", () => ({ sendEmail }));

const SITE = "https://uat.berceo.be";
// 18:05 in Brussels, summer time.
const AFTER_SIX = new Date("2026-09-25T16:05:00Z");
// 17:55 in Brussels, summer time.
const BEFORE_SIX = new Date("2026-09-25T15:55:00Z");

function request(id: string, communeIns: string, nightDate = "2026-09-30"): RequestCard {
  return {
    id,
    urgent: false,
    nightDate,
    startTime: "20:00:00",
    children: "un_bebe",
    babyAgeValue: 3,
    babyAgeUnit: "mois",
    communeIns,
    postcode: "1050",
    locality: "Ixelles",
    createdAt: new Date("2026-09-25T08:00:00Z"),
  };
}

const julie: Recipient = { profileId: "p-julie", email: "julie@example.be", firstName: "Julie", communeIns: "21009" };
const emma: Recipient = { profileId: "p-emma", email: "emma@example.be", firstName: "Emma", communeIns: "21016" };

beforeEach(() => {
  vi.clearAllMocks();
  sendEmail.mockResolvedValue(undefined);
});

describe("the daily digest", () => {
  it("does nothing before 18:00 in Brussels", async () => {
    expect(await sendRequestDigest(BEFORE_SIX, SITE)).toEqual({ skipped: "avant-18h" });
    expect(claimDigestRequests).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("sends each professional one e-mail with her communes' requests only", async () => {
    claimDigestRequests.mockResolvedValue([
      request("r1", "21009", "2026-10-02"),
      request("r2", "21009", "2026-09-30"),
      request("r3", "21016"),
    ]);
    professionalsServing.mockResolvedValue([julie, emma]);

    expect(await sendRequestDigest(AFTER_SIX, SITE)).toEqual({ requests: 3, professionals: 2, failed: 0 });
    expect(sendEmail).toHaveBeenCalledTimes(2);

    const toJulie = sendEmail.mock.calls.find(([to]) => to === julie.email)!;
    expect(toJulie[1].subject).toBe("2 nouvelles demandes de garde dans votre zone");
    // Soonest night first.
    expect(toJulie[1].text.indexOf("30/09/2026")).toBeLessThan(toJulie[1].text.indexOf("02/10/2026"));
    expect(toJulie[1].text).toContain(`${SITE}/espace/professionnelle/demandes`);
    expect(toJulie[2]).toMatch(/^digest-p-julie-2026-09-25-[0-9a-f]{16}$/);

    const toEmma = sendEmail.mock.calls.find(([to]) => to === emma.email)!;
    expect(toEmma[1].subject).toBe("Une nouvelle demande de garde dans votre zone");
  });

  it("sends nothing when no request is new, and nothing to a professional without one", async () => {
    claimDigestRequests.mockResolvedValue([]);
    expect(await sendRequestDigest(AFTER_SIX, SITE)).toEqual({ requests: 0, professionals: 0, failed: 0 });
    expect(professionalsServing).not.toHaveBeenCalled();

    claimDigestRequests.mockResolvedValue([request("r1", "21009")]);
    professionalsServing.mockResolvedValue([julie]);
    await sendRequestDigest(AFTER_SIX, SITE);
    expect(sendEmail.mock.calls.map(([to]) => to)).toEqual([julie.email]);
  });

  it("counts a failed send without throwing", async () => {
    claimDigestRequests.mockResolvedValue([request("r1", "21009")]);
    professionalsServing.mockResolvedValue([julie]);
    sendEmail.mockRejectedValue(new Error("Resend refused"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await sendRequestDigest(AFTER_SIX, SITE)).toEqual({ requests: 1, professionals: 1, failed: 1 });
  });
});

describe("the urgent e-mail", () => {
  it("goes at once to every validated professional serving the commune", async () => {
    requestForNotice.mockResolvedValue({ ...request("r9", "21009"), urgent: true, status: "ouverte" });
    professionalsServing.mockResolvedValue([julie, { ...julie, communeIns: "21009" }]);

    await notifyUrgentRequest("r9", SITE);

    expect(professionalsServing).toHaveBeenCalledWith(["21009"]);
    expect(sendEmail).toHaveBeenCalledTimes(1);
    const [to, email, key] = sendEmail.mock.calls[0];
    expect(to).toBe(julie.email);
    expect(email.subject).toBe("Demande urgente à Ixelles pour le 30/09/2026");
    expect(key).toBe("demande-r9-p-julie");
  });

  it("sends nothing for a cancelled or a normal request", async () => {
    requestForNotice.mockResolvedValue({ ...request("r9", "21009"), urgent: true, status: "annulee" });
    await notifyUrgentRequest("r9", SITE);
    requestForNotice.mockResolvedValue({ ...request("r9", "21009"), urgent: false, status: "ouverte" });
    await notifyUrgentRequest("r9", SITE);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("logs a failed send and never throws", async () => {
    requestForNotice.mockResolvedValue({ ...request("r9", "21009"), urgent: true, status: "ouverte" });
    professionalsServing.mockResolvedValue([julie]);
    sendEmail.mockRejectedValue(new Error("Resend refused"));
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(notifyUrgentRequest("r9", SITE)).resolves.toBeUndefined();
    expect(logged).toHaveBeenCalled();
  });
});
