import { beforeAll, describe, expect, it } from "vitest";

/**
 * Spec (reservations-reponse-suspendue, D-146): when she reopens a validated
 * file, every answer of hers still waiting becomes `retiree`, in the same
 * batch and only if that batch moved her profile out of `valide`. Her other
 * answers, and every other professional's, are untouched. The statement is
 * built, never run.
 */

beforeAll(() => {
  process.env.DATABASE_URL ??= "postgresql://test:test@localhost/test";
});

const PROFILE = "7d6f2a9e-3b1c-4e8a-9f0d-2c5b8a1e4f60";
const AT = new Date("2026-09-28T09:15:42.123Z");

async function statement() {
  const { reopeningWithdrawsAnswers } = await import("./answers");
  return reopeningWithdrawsAnswers(PROFILE, AT).toSQL();
}

describe("reopeningWithdrawsAnswers", () => {
  it("sets her answers to retiree, stamped with the reopening's moment", async () => {
    const { sql, params } = await statement();
    expect(sql).toMatch(/^update "care_request_applications" set "status" = \$\d+, "updated_at" = \$\d+/);
    expect(params).toContain("retiree");
    expect(params).toContain(AT.toISOString());
  });

  it("touches only her waiting answers", async () => {
    const { sql, params } = await statement();
    expect(sql).toContain('"care_request_applications"."status" = $');
    expect(sql).toContain('"care_request_applications"."profile_id" = $');
    expect(params).toContain("en_attente");
    expect(params).toContain(PROFILE);
    // Booked, declined and already withdrawn answers are never named.
    for (const kept of ["retenue", "non_retenue"]) expect(params).not.toContain(kept);
  });

  it("withdraws nothing unless this batch moved her profile out of valide at that moment", async () => {
    const { sql } = await statement();
    expect(sql).toContain(
      "exists (select 1 from professional_profiles as rp where rp.id = $",
    );
    expect(sql).toContain("rp.status <> 'valide'");
    expect(sql).toMatch(/rp\.updated_at = \$\d+::timestamptz/);
  });
});
