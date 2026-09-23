import "server-only";

import { createNeonAuth } from "@neondatabase/auth/next/server";

/**
 * The one Neon Auth instance (D-13), created on first use so importing this
 * module (Next collects server code at build time) never needs the variables;
 * only a request does. `NEON_AUTH_BASE_URL` is the auth URL of the Neon branch
 * this deployment's database lives on; `NEON_AUTH_COOKIE_SECRET` signs the
 * session cache cookie (32+ characters). Both are env vars, never in git.
 */
type NeonAuth = ReturnType<typeof createNeonAuth>;

let instance: NeonAuth | null = null;

export function authBaseUrl(): string {
  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  if (!baseUrl) {
    throw new Error(
      "NEON_AUTH_BASE_URL is not set — accounts are unavailable. See .env.example.",
    );
  }
  return baseUrl.replace(/\/$/, "");
}

export function getAuth(): NeonAuth {
  if (instance) return instance;

  const secret = process.env.NEON_AUTH_COOKIE_SECRET;
  if (!secret) {
    throw new Error(
      "NEON_AUTH_COOKIE_SECRET is not set — accounts are unavailable. See .env.example.",
    );
  }

  instance = createNeonAuth({
    baseUrl: authBaseUrl(),
    cookies: { secret },
  });
  return instance;
}
