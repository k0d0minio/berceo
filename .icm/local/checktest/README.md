# The checktest config of berceo

`checktest.json` is the config that the BAXTER checktest reads for this repo
(`checktest_engine.py`, `checktest_auth.py` of BAXTER). It wins over the copy in BAXTER's
data folder.

- `server`: the dev server of a local run.
- `targets.uat`: the UAT host. The engine refuses production.
- `sandboxes`: hosts that can get a request that changes data on UAT. Stripe only.
- `auth`: the sign-in of a storyboard with `role`. It signs in on `/connexion`, types the
  code of the newest mail on `/connexion/code`, and expects « Vue d'ensemble » on `/admin`.
  It fits the role `admin` (and the code step fits `professionnel`).
- `auth.mail.code`: the e-mail writes the six digits in two groups ("042 917"). The pattern
  reads the two groups. The form removes the space.
- `admin-signin.json`: the storyboard of the admin sign-in. It passed on UAT on 2026-11-27.

A storyboard of the role `admin` must give its first scene a `start` on a public page
(`"start": "/"`). The player opens the first page of the first scene before it signs in.
`/admin` answers 404 to a visitor who is not signed in (`src/lib/auth/routing.ts`). With no
`start`, the player opens `/admin`, gets the 404, and charges it to the first scene. The
scene then passes only on its second try ("flaky").
- No `signup`: a family's sign-up goes to Stripe Checkout, so the engine cannot finish it.
  A session signed up `test+berceo-admin@jamienisbet.com` on UAT on 2026-11-26 (Jamie,
  chat: "let's do this"). Its password is in BAXTER's data. The seed script gives it the
  role (`.icm/setup/checktest-accounts.md`).
