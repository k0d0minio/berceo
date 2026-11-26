# The checktest config of berceo

`checktest.json` is the config that the BAXTER checktest reads for this repo
(`checktest_engine.py`, `checktest_auth.py` of BAXTER). It wins over the copy in BAXTER's
data folder.

- `server`: the dev server of a local run.
- `targets.uat`: the UAT host. The engine refuses production.
- `sandboxes`: hosts that can get a request that changes data on UAT. Stripe only.
- `auth`: the sign-in of a storyboard with `role`. It signs in on `/connexion`, types the
  six-digit code of the newest mail on `/connexion/code`, and expects « Vue d'ensemble » on
  `/admin`. It fits the role `admin` (and the code step fits `professionnel`).
- No `signup`: a family's sign-up goes to Stripe Checkout, so the engine cannot finish it.
  A session signed up `test+berceo-admin@jamienisbet.com` on UAT on 2026-11-26 (Jamie,
  chat: "let's do this"). Its password is in BAXTER's data. The seed script gives it the
  role (`.icm/setup/checktest-accounts.md`).
