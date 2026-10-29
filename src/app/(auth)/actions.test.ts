import { beforeEach, describe, expect, it, vi } from "vitest";

/*
 * Spec (comptes-orphaned-auth-identity, D-159, D-160, D-171, D-172): a sign-up whose
 * `users` row fails to write never locks the address out. The identity is
 * deleted when the batch fails; a retry that meets an identity with no row (an
 * orphan) replaces it, once; a real account still reads like a new sign-up
 * (D-34); an orphan that signs in is told to sign up again.
 *
 * Spec (abonnements-inscription-famille): a family's sign-up needs one of the
 * four plans, and her users row keeps it beside the two consent rows; a
 * professional's sign-up has no plan. Neon Auth, the database and the orphan helpers are mocked at their module boundary.
 *
 * Spec (comptes-2fa): after her password, a professional or a founder on a
 * device no code trusted gets a code and lands on the code page; a trusted
 * device and a family land as before. The code page's action checks the six
 * digits, trusts the device, or sends a new code. The store and the sender
 * are mocked at their module boundary.
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
    orphanByEmail: vi.fn(),
    deleteOrphanIdentity: vi.fn(async (_authUserId: string) => true),
    cookieGet: vi.fn((_name: string): { value: string } | undefined => undefined),
    cookieSet: vi.fn(),
    currentUser: vi.fn(),
    isDeviceTrusted: vi.fn(async (_userId: string, _token: string | undefined) => false),
    checkSignInCode: vi.fn(),
    trustDevice: vi.fn(async (_userId: string) => ({ token: "jeton-brut", expiresAt: new Date() })),
    sendSignInCode: vi.fn(async (_user: unknown): Promise<"sent" | "too-soon" | "failed"> => "sent"),
  };
});

vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new m.Redirected(to);
  },
}));
vi.mock("next/headers", () => ({ cookies: async () => ({ set: m.cookieSet, get: m.cookieGet }) }));
vi.mock("@/lib/auth/current-user", () => ({ currentUser: m.currentUser }));
vi.mock("@/lib/auth/second-factor-store", () => ({
  isDeviceTrusted: m.isDeviceTrusted,
  checkSignInCode: m.checkSignInCode,
  trustDevice: m.trustDevice,
}));
vi.mock("@/lib/auth/second-factor-send", () => ({ sendSignInCode: m.sendSignInCode }));
vi.mock("@/lib/auth/server", () => ({
  getAuth: () => ({ signUp: { email: m.signUpEmail }, signIn: { email: m.signInEmail }, signOut: m.signOut }),
}));
vi.mock("@/lib/auth/users", () => ({
  userByAuthId: m.userByAuthId,
  orphanByEmail: m.orphanByEmail,
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

const { signIn, signInCode, signUp } = await import("./actions");

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
  form.set("formule", "serenite");
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
  m.cookieGet.mockReturnValue(undefined);
  m.isDeviceTrusted.mockResolvedValue(false);
  m.sendSignInCode.mockResolvedValue("sent");
  m.trustDevice.mockResolvedValue({ token: "jeton-brut", expiresAt: new Date() });
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
        values: {
          prenom: "Julie",
          nom: "Dupont",
          email: "Julie.Dupont@Exemple.be",
          telephone: "0470 12 34 56",
          formule: "serenite",
        },
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
    m.orphanByEmail.mockResolvedValue({ authUserId: "auth-1", pastGrace: true });

    expect(await signUpParent()).toEqual({ redirect: "/verification-email" });
    expect(m.orphanByEmail).toHaveBeenCalledWith(EMAIL);
    expect(m.deleteOrphanIdentity).toHaveBeenCalledExactlyOnceWith("auth-1");
    expect(m.signUpEmail).toHaveBeenCalledTimes(2);

    const [statements] = m.batch.mock.calls[0] as [{ values: unknown }[]];
    const [userRow, consents] = statements.map((statement) => statement.values);
    expect(userRow).toMatchObject({ authUserId: "auth-2", email: EMAIL, role: "parent", firstName: "Julie" });
    expect(consents).toHaveLength(2);
  });

  it("leaves a real account alone and lands on /verification-email exactly as a new sign-up", async () => {
    m.signUpEmail.mockResolvedValue(refused("USER_ALREADY_EXISTS"));
    m.orphanByEmail.mockResolvedValue(null);

    expect(await signUpParent()).toEqual({ redirect: "/verification-email" });
    expect(m.deleteOrphanIdentity).not.toHaveBeenCalled();
    expect(m.signUpEmail).toHaveBeenCalledTimes(1);
    expect(m.batch).not.toHaveBeenCalled();
  });

  it("leaves an identity with no row inside its grace alone and asks to retry in a few minutes (D-172)", async () => {
    m.signUpEmail.mockResolvedValue(refused("USER_ALREADY_EXISTS"));
    m.orphanByEmail.mockResolvedValue({ authUserId: "auth-1", pastGrace: false });

    expect(await signUpParent()).toMatchObject({ state: { message: "inscriptionEnCours" } });
    expect(m.deleteOrphanIdentity).not.toHaveBeenCalled();
    expect(m.signUpEmail).toHaveBeenCalledTimes(1);
  });

  it("answers « generique » when the sign-up after replacing an orphan is refused, and tries no third time", async () => {
    m.signUpEmail.mockResolvedValue(refused("USER_ALREADY_EXISTS"));
    m.orphanByEmail.mockResolvedValue({ authUserId: "auth-1", pastGrace: true });

    expect(await signUpParent()).toMatchObject({ state: { message: "generique" } });
    expect(m.signUpEmail).toHaveBeenCalledTimes(2);
    expect(m.deleteOrphanIdentity).toHaveBeenCalledTimes(1);
    expect(m.batch).not.toHaveBeenCalled();
  });

  it("gives the password field error Neon returns on the sign-up after replacing an orphan", async () => {
    m.signUpEmail
      .mockResolvedValueOnce(refused("USER_ALREADY_EXISTS"))
      .mockResolvedValueOnce(refused("PASSWORD_TOO_SHORT"));
    m.orphanByEmail.mockResolvedValue({ authUserId: "auth-1", pastGrace: true });

    expect(await signUpParent()).toMatchObject({ state: { errors: { motDePasse: "motDePasseCourt" } } });
    expect(m.signUpEmail).toHaveBeenCalledTimes(2);
  });
});

describe("the plan on a sign-up (abonnements-inscription-famille)", () => {
  beforeEach(() => {
    m.signUpEmail.mockResolvedValue(created("auth-1"));
  });

  it("writes a family's plan on her users row, beside the two consent rows", async () => {
    expect(await signUpParent()).toEqual({ redirect: "/verification-email" });
    const [statements] = m.batch.mock.calls[0] as [{ values: unknown }[]];
    const [userRow, consents] = statements.map((statement) => statement.values);
    expect(userRow).toMatchObject({ role: "parent", signupPlan: "serenite" });
    expect(consents).toEqual([
      expect.objectContaining({ document: "cgu" }),
      expect.objectContaining({ document: "confidentialite" }),
    ]);
  });

  it.each([[""], ["gratuit"]])("refuses a family's form whose plan is %o, and keeps the typed values", async (formule) => {
    const form = signUpForm();
    form.set("formule", formule);
    const result = await outcome(signUp("parent", null, {}, form));
    expect(result).toMatchObject({
      state: { errors: { formule: "formule" }, values: { email: "Julie.Dupont@Exemple.be", formule } },
    });
    expect(m.signUpEmail).not.toHaveBeenCalled();
  });

  it("signs a professional up with no plan, whatever the form sends", async () => {
    const form = signUpForm();
    form.delete("formule");
    expect(await outcome(signUp("professionnel", null, {}, form))).toEqual({ redirect: "/verification-email" });
    const [statements] = m.batch.mock.calls[0] as [{ values: unknown }[]];
    expect(statements[0].values).toMatchObject({ role: "professionnel", signupPlan: null });
  });
});

describe("a sign-in with no users row (D-171)", () => {
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

const row = (role: "parent" | "professionnel" | "admin") => ({
  id: `u-${role}`,
  authUserId: "auth-1",
  email: EMAIL,
  firstName: "Julie",
  role,
  suspendedAt: null,
});

function signInForm(): FormData {
  const form = new FormData();
  form.set("email", EMAIL);
  form.set("motDePasse", "nuit-calme");
  return form;
}

describe("the second factor at sign-in (comptes-2fa)", () => {
  beforeEach(() => {
    m.signInEmail.mockResolvedValue({ data: { user: { id: "auth-1" } }, error: null });
  });

  it.each([["professionnel", "/connexion/code"], ["admin", "/connexion/code"]] as const)(
    "sends a %s on a device no code trusted a code, then to the code page",
    async (role, page) => {
      m.userByAuthId.mockResolvedValue(row(role));
      expect(await outcome(signIn(null, {}, signInForm()))).toEqual({ redirect: page });
      expect(m.isDeviceTrusted).toHaveBeenCalledWith(`u-${role}`, undefined);
      expect(m.sendSignInCode).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ id: `u-${role}` }));
    },
  );

  it("keeps the way back through the code page", async () => {
    m.userByAuthId.mockResolvedValue(row("professionnel"));
    expect(await outcome(signIn("/espace/professionnelle/demandes", {}, signInForm()))).toEqual({
      redirect: "/connexion/code?retour=%2Fespace%2Fprofessionnelle%2Fdemandes",
    });
  });

  it("says on the code page when the e-mail did not leave", async () => {
    m.userByAuthId.mockResolvedValue(row("admin"));
    m.sendSignInCode.mockResolvedValue("failed");
    expect(await outcome(signIn(null, {}, signInForm()))).toEqual({ redirect: "/connexion/code?envoi=echec" });
  });

  it("lands a professional on a trusted device in her space, with no code", async () => {
    m.userByAuthId.mockResolvedValue(row("professionnel"));
    m.cookieGet.mockReturnValue({ value: "jeton-brut" });
    m.isDeviceTrusted.mockResolvedValue(true);
    expect(await outcome(signIn(null, {}, signInForm()))).toEqual({ redirect: "/espace/professionnelle" });
    expect(m.isDeviceTrusted).toHaveBeenCalledWith("u-professionnel", "jeton-brut");
    expect(m.sendSignInCode).not.toHaveBeenCalled();
  });

  it("asks a family nothing: her password opens her space", async () => {
    m.userByAuthId.mockResolvedValue(row("parent"));
    expect(await outcome(signIn(null, {}, signInForm()))).toEqual({ redirect: "/espace/famille" });
    expect(m.isDeviceTrusted).not.toHaveBeenCalled();
    expect(m.sendSignInCode).not.toHaveBeenCalled();
  });
});

describe("the code page's action (comptes-2fa)", () => {
  const codeForm = (code: string, intention = "valider") => {
    const form = new FormData();
    form.set("code", code);
    form.set("intention", intention);
    return form;
  };

  beforeEach(() => {
    m.currentUser.mockResolvedValue({ status: "needs-code", user: row("professionnel") });
  });

  it("trusts the device on a correct code: the cookie is set and she lands where she was going", async () => {
    m.checkSignInCode.mockResolvedValue("ok");
    expect(await outcome(signInCode("/espace/professionnelle/gardes", {}, codeForm("123 456")))).toEqual({
      redirect: "/espace/professionnelle/gardes",
    });
    expect(m.checkSignInCode).toHaveBeenCalledWith("u-professionnel", "123456");
    expect(m.trustDevice).toHaveBeenCalledExactlyOnceWith("u-professionnel");
    expect(m.cookieSet).toHaveBeenCalledWith(
      "berceo-appareil",
      "jeton-brut",
      expect.objectContaining({ httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 30 * 24 * 60 * 60 }),
    );
  });

  it.each([
    ["wrong", "codeIncorrect"],
    ["dead", "codeEpuise"],
    ["expired", "codeExpire"],
    ["none", "codeExpire"],
  ] as const)("answers a %s code with « %s » and trusts nothing", async (check, message) => {
    m.checkSignInCode.mockResolvedValue(check);
    expect(await outcome(signInCode(null, {}, codeForm("000000")))).toEqual({ state: { message } });
    expect(m.trustDevice).not.toHaveBeenCalled();
    expect(m.cookieSet).not.toHaveBeenCalled();
  });

  it("refuses anything but six digits before any read", async () => {
    expect(await outcome(signInCode(null, {}, codeForm("12345")))).toEqual({ state: { message: "codeInvalide" } });
    expect(m.checkSignInCode).not.toHaveBeenCalled();
  });

  it.each([
    ["sent", "codeRenvoye"],
    ["too-soon", "codeAttendre"],
    ["failed", "codeEnvoiEchoue"],
  ] as const)("« Renvoyer le code » answers %s with « %s »", async (sent, message) => {
    m.sendSignInCode.mockResolvedValue(sent);
    expect(await outcome(signInCode(null, {}, codeForm("", "renvoyer")))).toEqual({ state: { message } });
    expect(m.checkSignInCode).not.toHaveBeenCalled();
  });

  it("sends a session that owes no code to its space, and a signed-out visitor to sign-in", async () => {
    m.currentUser.mockResolvedValue({ status: "ok", user: row("admin") });
    expect(await outcome(signInCode(null, {}, codeForm("123456")))).toEqual({ redirect: "/admin" });
    m.currentUser.mockResolvedValue({ status: "signed-out" });
    expect(await outcome(signInCode(null, {}, codeForm("123456")))).toEqual({ redirect: "/connexion" });
    expect(m.checkSignInCode).not.toHaveBeenCalled();
  });
});
