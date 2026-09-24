import { generateKeyPairSync, sign } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

import { handleNeonAuthWebhook, MAX_AGE_MS, type Jwk, type WebhookDeps } from "./webhook";

/**
 * Spec: /api/webhooks/neon-auth answers 401 to an unsigned, wrongly signed or
 * stale request and sends nothing; delivering the same event id twice sends
 * one e-mail. Signed here exactly as Neon documents it: Ed25519, detached JWS,
 * signing input `header.base64url(timestamp.base64url(body))`.
 */

const NOW = Date.UTC(2026, 8, 23, 12, 0, 0);
const SITE = "https://uat.berceo.be";

const { publicKey, privateKey } = generateKeyPairSync("ed25519");
const jwk: Jwk = { ...publicKey.export({ format: "jwk" }), kid: "k1" };
const other = generateKeyPairSync("ed25519").privateKey;

const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64url");

function signed(body: string, opts: { at?: number; key?: typeof privateKey; kid?: string } = {}) {
  const timestamp = String(opts.at ?? NOW);
  const header = b64(JSON.stringify({ alg: "EdDSA", kid: opts.kid ?? "k1" }));
  const input = `${header}.${b64(`${timestamp}.${b64(body)}`)}`;
  const signature = sign(null, Buffer.from(input), opts.key ?? privateKey).toString("base64url");
  return new Headers({
    "x-neon-signature": `${header}..${signature}`,
    "x-neon-signature-kid": opts.kid ?? "k1",
    "x-neon-timestamp": timestamp,
  });
}

function event(linkType: string, id = "evt-1", name = "Julie|Dupont") {
  return JSON.stringify({
    event_id: id,
    event_type: "send.magic_link",
    timestamp: new Date(NOW).toISOString(),
    user: { email: "julie@exemple.be", name },
    event_data: { link_type: linkType, token: "tok/en+1", link_url: "https://neon.example/verify" },
  });
}

function deps(overrides: Partial<WebhookDeps> = {}): WebhookDeps {
  return {
    keyFor: async (kid) => (kid === "k1" ? jwk : null),
    firstNameFor: async () => null,
    send: vi.fn(async () => {}),
    now: () => NOW,
    seen: new Set(),
    ...overrides,
  };
}

describe("Neon Auth webhook: signature", () => {
  it("refuses an unsigned request and sends nothing", async () => {
    const d = deps();
    const result = await handleNeonAuthWebhook(event("email-verification"), new Headers(), SITE, d);
    expect(result).toEqual({ status: 401, sent: false });
    expect(d.send).not.toHaveBeenCalled();
  });

  it("refuses a request signed with another key", async () => {
    const d = deps();
    const body = event("email-verification");
    const result = await handleNeonAuthWebhook(body, signed(body, { key: other }), SITE, d);
    expect(result.status).toBe(401);
    expect(d.send).not.toHaveBeenCalled();
  });

  it("refuses a body changed after signing", async () => {
    const d = deps();
    const headers = signed(event("email-verification"));
    const result = await handleNeonAuthWebhook(event("forget-password"), headers, SITE, d);
    expect(result.status).toBe(401);
    expect(d.send).not.toHaveBeenCalled();
  });

  it("refuses a request older than five minutes", async () => {
    const d = deps();
    const body = event("email-verification");
    const result = await handleNeonAuthWebhook(body, signed(body, { at: NOW - MAX_AGE_MS - 1 }), SITE, d);
    expect(result.status).toBe(401);
    expect(d.send).not.toHaveBeenCalled();
  });

  it("refuses an unknown key id", async () => {
    const d = deps();
    const body = event("email-verification");
    const result = await handleNeonAuthWebhook(body, signed(body, { kid: "k9" }), SITE, d);
    expect(result.status).toBe(401);
  });
});

describe("Neon Auth webhook: e-mails", () => {
  it("sends the verification e-mail with a link to this site", async () => {
    const d = deps();
    const body = event("email-verification");
    const result = await handleNeonAuthWebhook(body, signed(body), SITE, d);

    expect(result).toEqual({ status: 200, sent: true });
    const [to, email, key] = vi.mocked(d.send).mock.calls[0];
    expect(to).toBe("julie@exemple.be");
    expect(key).toBe("neon-auth-evt-1");
    expect(email.text).toContain(
      "https://uat.berceo.be/verification-email/confirmer?token=tok%2Fen%2B1",
    );
    expect(email.text).toContain("Bonjour Julie,");
  });

  it("greets with the whole first name when it is compound and the users row is not written yet", async () => {
    const d = deps();
    const body = event("email-verification", "evt-compound", "Marie Claire|Dupont");
    await handleNeonAuthWebhook(body, signed(body), SITE, d);
    const [, email] = vi.mocked(d.send).mock.calls[0];
    expect(email.text).toContain("Bonjour Marie Claire,");
  });

  it("sends the reset e-mail with a link to the new-password page", async () => {
    const d = deps({ firstNameFor: async () => "Jules" });
    const body = event("forget-password");
    await handleNeonAuthWebhook(body, signed(body), SITE, d);
    const [, email] = vi.mocked(d.send).mock.calls[0];
    expect(email.text).toContain("https://uat.berceo.be/nouveau-mot-de-passe?token=tok%2Fen%2B1");
    expect(email.text).toContain("Bonjour Jules,");
  });

  it("sends one e-mail when the same event is delivered twice", async () => {
    const d = deps();
    const body = event("email-verification", "evt-dup");
    await handleNeonAuthWebhook(body, signed(body), SITE, d);
    const again = await handleNeonAuthWebhook(body, signed(body), SITE, d);
    expect(again).toEqual({ status: 200, sent: false });
    expect(d.send).toHaveBeenCalledTimes(1);
  });

  it("does not mark an event handled when sending failed, so Neon's retry can send it", async () => {
    const failing = vi.fn(async () => {
      throw new Error("resend down");
    });
    const d = deps({ send: failing });
    const body = event("email-verification", "evt-retry");
    await expect(handleNeonAuthWebhook(body, signed(body), SITE, d)).rejects.toThrow("resend down");
    expect(d.seen.has("evt-retry")).toBe(false);
  });

  it("acknowledges an event it does not handle without sending", async () => {
    const d = deps();
    const body = event("sign-in");
    expect(await handleNeonAuthWebhook(body, signed(body), SITE, d)).toEqual({ status: 200, sent: false });
    expect(d.send).not.toHaveBeenCalled();
  });
});
