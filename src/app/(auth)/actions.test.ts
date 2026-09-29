import { beforeEach, describe, expect, it, vi } from "vitest";

/*
 * Spec (comptes-orphaned-auth-identity, D-159, D-160, D-165): a sign-up whose
 * `users` row fails to write never locks the address out. The identity is
 * deleted when the batch fails; a retry that meets an identity with no row (an
 * orphan) replaces it, once; a real account still reads like a new sign-up
 * (D-34); an orphan that signs in is told to sign up again. Neon Auth, the
 * database and the orphan helpers are mocked at their module boundary.
 */

const m = vi.hoisted(() => {
  class Redirected extends Error {
    constructor(readonly to: string) {
      super(`redirect ${to}`);
    }
  }
  return {
    Redirected,
    signUpEmail: vi.fn(),
    signInEmail: vi.fn(),
    signOut: vi.fn(async () => {}),
    batch: vi.fn(async (_statements: unknown[]) => {}),
    userByAuthId: vi.fn(),
    identityByEmail: vi.fn(),
    deleteOrphanIdentity: vi.fn(async (_authUserId: string) => true),
  };
});

vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new m.Redirected(to);
  },
}));
vi.mock("next/headers", () => ({ cookies: async () => ({ set: vi.fn() }) }));
vi.mock("@/lib/auth/server", () => ({
  getAuth: () => ({ signUp: { email: m.signUpEmail }, signIn: { email: m.signInEmail }, signOut: m.signOut }),
}));
vi.mock("@/lib/auth/users", () => ({
  userByAuthId: m.userByAuthId,
  identityByEmail: m.identityByEmail,
  deleteOrphanIdentity: m.deleteOrphanIdentity,
}));
vi.mock("@/db", async () => {
  const schema = await vi.importActual<typeof import("@/db/schema")>("@/db/schema");
  return {
    users: schema.users,
    userConsents: schema.userConsents,
    db: {
      batch: m.batch,
      insert: (table: unknown) => ({ values: (values: unknown) => ({ table, values }) }),
    },
  };
});

const { signIn, signUp } = await import("./actions");

const EMAIL = "julie.dupont@exemple.be";

function signUpForm(): FormData {
  const form = new FormData();
  form.set("prenom", "Julie");
  form.set("nom", "Dupont");
  form.set("email", "Julie.Dupont@Exemple.be");
  form.set("telephone", "0470 12 34 56");
  form.set("motDePasse", "nuit-calme");
  form.set("confirmation", "nuit-calme");
  form.set("consentement", "on");
  return form;
}

const created = (id: string) => ({ data: { user: { id } }, error: null });
const refused = (code: string) => ({ data: null, error: { code, status: 422 } });

/** Where the action redirected, or its returned state when it did not. */
async function outcome<T>(action: Promise<T>): Promise<{ redirect: string } | { state: T }> {
  try {
    return { state: await action };
  } catch (error) {
    if (error instanceof m.Redirected) return { redirect: error.to };
    throw error;
  }
}

const signUpParent = () => outcome(signUp("parent", null, {}, signUpForm()));

const errors = vi.spyOn(console, "error").mockImplementation(() => {});

beforeEach(() => {
  vi.clearAllMocks();
  m.batch.mockResolvedValue(undefined);
  m.deleteOrphanIdentity.mockResolvedValue(true);
});

describe("a sign-up whose users row fails to write (D-159)", () => {
  beforeEach(() => {
    m.signUpEmail.mockResolvedValue(created("auth-1"));
    m.batch.mockRejectedValue(new Error("connection reset"));
  });

  it("deletes the identity it just created and answers « generique » with the typed values", async () => {
    const result = await signUpParent();
    expect(m.deleteOrphanIdentity).toHaveBeenCalledExactlyOnceWith("auth-1");
    expect(result).toEqual({
      state: {
        message: "generique",
        values: { prenom: "Julie", nom: "Dupont", email: "Julie.Dupont@Exemple.be", telephone: "0470 12 34 56" },
      },
    });
  });

  it("logs a [comptes] line with the authUserId when that delete fails too, and still answers « generique »", async () => {
    m.deleteOrphanIdentity.mockRejectedValue(new Error("connection reset"));
    const result = await signUpParent();
    expect(result).toMatchObject({ state: { message: "generique" } });
    const notRemoved = errors.mock.calls.filter(
      ([line, fields]) =>
        String(line).startsWith("[comptes]") &&
        String(line).includes("not removed") &&
        (fields as { authUserId?: string }).authUserId === "auth-1",
    );
    expect(notRemoved).toHaveLength(1);
  });
});

describe("a sign-up retry on an address Neon Auth already has (D-160, D-34)", () => {
  it("replaces an orphan: deleted, signed up again, row and consents written, on to /verification-email", async () => {
    m.signUpEmail.mockResolvedValueOnce(refused("USER_ALREADY_EXISTS")).mockResolvedValueOnce(created("auth-2"));
    m.identityByEmail.mockResolvedValue({ authUserId: "auth-1", hasRow: false });

    expect(await signUpParent()).toEqual({ redirect: "/verification-email" });
    expect(m.identityByEmail).toHaveBeenCalledWith(EMAIL);
    expect(m.deleteOrphanIdentity).toHaveBeenCalledExactlyOnceWith("auth-1");
    expect(m.signUpEmail).toHaveBeenCalledTimes(2);

    const [statements] = m.batch.mock.calls[0] as [{ values: unknown }[]];
    const [userRow, consents] = statements.map((statement) => statement.values);
    expect(userRow).toMatchObject({ authUserId: "auth-2", email: EMAIL, role: "parent", firstName: "Julie" });
    expect(consents).toHaveLength(2);
  });

  it("leaves a real account alone and lands on /verification-email exactly as a new sign-up", async () => {
    m.signUpEmail.mockResolvedValue(refused("USER_ALREADY_EXISTS"));
    m.identityByEmail.mockResolvedValue({ authUserId: "auth-1", hasRow: true });

    expect(await signUpParent()).toEqual({ redirect: "/verification-email" });
    expect(m.deleteOrphanIdentity).not.toHaveBeenCalled();
    expect(m.signUpEmail).toHaveBeenCalledTimes(1);
    expect(m.batch).not.toHaveBeenCalled();
  });

  it("answers « generique » when the sign-up after replacing an orphan is refused, and tries no third time", async () => {
    m.signUpEmail.mockResolvedValue(refused("USER_ALREADY_EXISTS"));
    m.identityByEmail.mockResolvedValue({ authUserId: "auth-1", hasRow: false });

    expect(await signUpParent()).toMatchObject({ state: { message: "generique" } });
    expect(m.signUpEmail).toHaveBeenCalledTimes(2);
    expect(m.deleteOrphanIdentity).toHaveBeenCalledTimes(1);
    expect(m.batch).not.toHaveBeenCalled();
  });

  it("gives the password field error Neon returns on the sign-up after replacing an orphan", async () => {
    m.signUpEmail
      .mockResolvedValueOnce(refused("USER_ALREADY_EXISTS"))
      .mockResolvedValueOnce(refused("PASSWORD_TOO_SHORT"));
    m.identityByEmail.mockResolvedValue({ authUserId: "auth-1", hasRow: false });

    expect(await signUpParent()).toMatchObject({ state: { errors: { motDePasse: "motDePasseCourt" } } });
    expect(m.signUpEmail).toHaveBeenCalledTimes(2);
  });
});

describe("a sign-in with no users row (D-165)", () => {
  it("ends the new session and answers « inscriptionIncomplete »", async () => {
    m.signInEmail.mockResolvedValue({ data: { user: { id: "auth-1" } }, error: null });
    m.userByAuthId.mockResolvedValue(null);
    const form = new FormData();
    form.set("email", EMAIL);
    form.set("motDePasse", "nuit-calme");

    expect(await outcome(signIn(null, {}, form))).toEqual({
      state: { message: "inscriptionIncomplete", email: EMAIL },
    });
    expect(m.signOut).toHaveBeenCalledTimes(1);
  });
});
