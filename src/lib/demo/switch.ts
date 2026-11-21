/**
 * The local demo (JAM-462): its switch and its walls, written once and pure,
 * so a test holds each refusal.
 *
 * The demo lets a checktest run on `npm run demo:dev` sign in as each role of
 * the demo database with no mailbox and no call to Neon Auth, and it keeps
 * every e-mail in the server log. Three walls, all required:
 *
 * 1. The switch `BERCEO_LOCAL_DEMO` is `1`. Only `.env.demo.local` sets it.
 *    No Vercel environment has it.
 * 2. The server is not a Vercel deployment and not a production build:
 *    `VERCEL` and `VERCEL_ENV` are empty, and `NODE_ENV` is not `production`.
 *    So UAT, each preview and production refuse, whatever their variables say.
 * 3. For a sign-in: the request's host is a local development host.
 *
 * And the demo signs in only an account of the demo set: an address
 * `test+<name>@jamienisbet.com` (`isDemoAddress`).
 */

/** The environment variable that turns the local demo on. */
export const DEMO_SWITCH = "BERCEO_LOCAL_DEMO";

/** The domain of every demo account (J, 2026-11-21). */
export const DEMO_DOMAIN = "jamienisbet.com";

/** The cookie that holds the demo account's id, on a local host only. */
export const DEMO_COOKIE = "berceo-demo";

/** Where a checktest run goes to sign in: `?compte=<name>&retour=<path>`. */
export const DEMO_SIGN_IN_PATH = "/api/demo/connexion";

export type DemoEnv = {
  /** `BERCEO_LOCAL_DEMO` */
  flag?: string;
  /** `VERCEL`: set to `1` on each Vercel build and deployment. */
  vercel?: string;
  /** `VERCEL_ENV`: `production`, `preview` or `development` on Vercel. */
  vercelEnv?: string;
  /** `NODE_ENV`: `production` on each `next build` and `next start`. */
  nodeEnv?: string;
};

/** The four variables the walls read. */
export function demoEnvFrom(env: Record<string, string | undefined>): DemoEnv {
  return {
    flag: env[DEMO_SWITCH],
    vercel: env.VERCEL,
    vercelEnv: env.VERCEL_ENV,
    nodeEnv: env.NODE_ENV,
  };
}

/** Walls 1 and 2: the switch is on, and this server is not on Vercel and not a production build. */
export function demoSwitchOn(env: DemoEnv): boolean {
  if (env.flag !== "1") return false;
  if (env.vercel || env.vercelEnv) return false;
  return env.nodeEnv !== "production";
}

/**
 * Wall 3: the host of the request, with or without its port, is
 * `localhost`, a name that ends in `.localhost`, `127.0.0.1` or `[::1]`.
 */
export function isLocalHost(host: string | null | undefined): boolean {
  if (!host) return false;
  const value = host.trim().toLowerCase();
  const name = value.startsWith("[")
    ? value.slice(0, value.indexOf("]") + 1)
    : value.replace(/:\d+$/, "");
  if (name === "localhost" || name === "127.0.0.1" || name === "[::1]") return true;
  return /^[a-z0-9-]+(\.[a-z0-9-]+)*\.localhost$/.test(name);
}

/** All three walls: the demo may sign in on this request. */
export function demoSignInAllowed(env: DemoEnv, host: string | null | undefined): boolean {
  return demoSwitchOn(env) && isLocalHost(host);
}

const DEMO_ADDRESS = /^test\+([a-z0-9]+(?:-[a-z0-9]+)*)@jamienisbet\.com$/;

/** True for an address of the demo set: `test+<name>@jamienisbet.com`, lower case. */
export function isDemoAddress(email: string): boolean {
  return DEMO_ADDRESS.test(email);
}

/** The demo address of `name`: `famille-serenite` gives `test+famille-serenite@jamienisbet.com`. */
export function demoAddress(name: string): string {
  const email = `test+${name}@${DEMO_DOMAIN}`;
  if (!isDemoAddress(email)) throw new Error(`not a demo account name: ${name}`);
  return email;
}

export type DemoSignIn = { kind: "refuse" } | { kind: "sign-in"; email: string; retour: string | null };

/**
 * What `/api/demo/connexion` does with a request: refuse it (the route
 * answers 404, as if it did not exist), or sign in the demo account `compte`
 * names. `compte` is the name after `test+` or the full demo address.
 */
export function demoSignInDecision(input: {
  env: DemoEnv;
  host: string | null | undefined;
  compte: string | null | undefined;
  retour: string | null | undefined;
}): DemoSignIn {
  if (!demoSignInAllowed(input.env, input.host)) return { kind: "refuse" };
  const compte = input.compte?.trim().toLowerCase();
  if (!compte) return { kind: "refuse" };
  const email = compte.includes("@") ? compte : `test+${compte}@${DEMO_DOMAIN}`;
  if (!isDemoAddress(email)) return { kind: "refuse" };
  return { kind: "sign-in", email, retour: input.retour ?? null };
}
