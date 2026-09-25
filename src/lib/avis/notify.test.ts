import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Spec (avis-etoiles, D-120): each side owed an invitation is claimed just
 * before its send, gets its own e-mail linking to its own form (the family the
 * guide's), and is released when the send fails so the next pass tries again;
 * a side another pass already claimed is not sent twice. Which gardes are owed
 * (terminée, not annulée, inside the window, not yet rated) is the SQL of
 * `invitationsDue` and `claimInvitation`.
 */

const mocks = vi.hoisted(() => ({
  invitationsDue: vi.fn(),
  claimInvitation: vi.fn(),
  releaseInvitation: vi.fn(),
  logError: vi.fn(),
  gardeNotice: vi.fn(),
  sendEmail: vi.fn(),
}));

vi.mock("./ratings", () => ({
  invitationsDue: mocks.invitationsDue,
  claimInvitation: mocks.claimInvitation,
  releaseInvitation: mocks.releaseInvitation,
  logError: mocks.logError,
}));
vi.mock("@/lib/gardes/gardes", () => ({ gardeNotice: mocks.gardeNotice }));
vi.mock("@/lib/email/send", () => ({ sendEmail: mocks.sendEmail }));

import { sendInvitations } from "./notify";

const SITE = "https://uat.berceo.be";
const NOW = new Date("2026-10-01T06:00:00Z");
const BOOKING = "11111111-1111-4111-8111-111111111111";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.gardeNotice.mockResolvedValue({
    id: BOOKING,
    nightDate: "2026-09-30",
    startTime: "20:00:00",
    cancelledBy: null,
    cancellationKind: null,
    family: { email: "sophie@example.be", firstName: "Sophie" },
    professional: { email: "emma@example.be", firstName: "Emma" },
  });
  mocks.claimInvitation.mockResolvedValue(true);
  mocks.releaseInvitation.mockResolvedValue(undefined);
  mocks.sendEmail.mockResolvedValue(undefined);
});

describe("sendInvitations", () => {
  it("sends each side its own e-mail, to its own form, claimed first", async () => {
    mocks.invitationsDue.mockResolvedValue([
      { bookingId: BOOKING, side: "famille" },
      { bookingId: BOOKING, side: "professionnelle" },
    ]);
    expect(await sendInvitations(NOW, SITE)).toEqual({ sent: 2, failed: 0 });

    expect(mocks.claimInvitation).toHaveBeenCalledWith(BOOKING, "famille", NOW);
    expect(mocks.claimInvitation).toHaveBeenCalledWith(BOOKING, "professionnelle", NOW);
    const [family, professional] = mocks.sendEmail.mock.calls;
    expect(family[0]).toBe("sophie@example.be");
    expect(family[1].subject).toBe("Votre garde avec Emma est terminée : partagez votre retour");
    expect(family[1].text).toContain(`${SITE}/espace/famille/reservations/${BOOKING}/avis`);
    expect(family[2]).toBe(`avis-invitation-${BOOKING}-famille`);
    expect(professional[0]).toBe("emma@example.be");
    expect(professional[1].subject).toBe("Votre garde chez Sophie est terminée : partagez votre retour");
    expect(professional[1].text).toContain(`${SITE}/espace/professionnelle/gardes/${BOOKING}/avis`);
    expect(professional[2]).toBe(`avis-invitation-${BOOKING}-professionnelle`);
  });

  it("sends nothing for a side another pass already claimed", async () => {
    mocks.invitationsDue.mockResolvedValue([{ bookingId: BOOKING, side: "famille" }]);
    mocks.claimInvitation.mockResolvedValue(false);
    expect(await sendInvitations(NOW, SITE)).toEqual({ sent: 0, failed: 0 });
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it("releases a failed send so the next pass tries again, and carries on", async () => {
    mocks.invitationsDue.mockResolvedValue([
      { bookingId: BOOKING, side: "famille" },
      { bookingId: BOOKING, side: "professionnelle" },
    ]);
    mocks.sendEmail.mockRejectedValueOnce(new Error("Resend refused"));
    expect(await sendInvitations(NOW, SITE)).toEqual({ sent: 1, failed: 1 });
    expect(mocks.releaseInvitation).toHaveBeenCalledWith(BOOKING, "famille");
    expect(mocks.releaseInvitation).not.toHaveBeenCalledWith(BOOKING, "professionnelle");
  });

  it("sends nothing when nothing is owed", async () => {
    mocks.invitationsDue.mockResolvedValue([]);
    expect(await sendInvitations(NOW, SITE)).toEqual({ sent: 0, failed: 0 });
    expect(mocks.claimInvitation).not.toHaveBeenCalled();
  });
});
