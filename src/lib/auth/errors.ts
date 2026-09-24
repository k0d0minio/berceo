/**
 * Neon Auth (Better Auth) error codes, mapped to what the page says. The code
 * is read, never the upstream message, so no English and no hint about which
 * of the e-mail or the password was wrong reaches the user.
 */

export type AuthOutcome =
  | "identifiants"
  | "nonVerifie"
  | "existe"
  | "lienInvalide"
  | "motDePasseCourt"
  | "motDePasseLong"
  | "generique";

const BY_CODE: Record<string, AuthOutcome> = {
  INVALID_EMAIL_OR_PASSWORD: "identifiants",
  INVALID_PASSWORD: "identifiants",
  INVALID_EMAIL: "identifiants",
  USER_NOT_FOUND: "identifiants",
  CREDENTIAL_ACCOUNT_NOT_FOUND: "identifiants",
  EMAIL_NOT_VERIFIED: "nonVerifie",
  USER_ALREADY_EXISTS: "existe",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "existe",
  INVALID_TOKEN: "lienInvalide",
  TOKEN_EXPIRED: "lienInvalide",
  PASSWORD_TOO_SHORT: "motDePasseCourt",
  PASSWORD_TOO_LONG: "motDePasseLong",
};

export function authOutcome(error: { code?: string | null } | null | undefined): AuthOutcome {
  const code = error?.code;
  return (code && BY_CODE[code]) || "generique";
}
