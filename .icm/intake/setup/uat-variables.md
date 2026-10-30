# Setup: the application's variables on the UAT environment

- setup-slug: uat-variables
- needs: uat
- where: Vercel → each UAT project → Settings → Environment Variables

## Why

The `uat` environment has its own variables. A name that `uat` does not have is empty in the
UAT build, and the client tests a broken page.

## Steps

1. Read `.env.example`. Find each name whose suffix names `uat`, and each name the application
   reads.
2. On each UAT project, add each name to the environment `uat`.
3. Use sandbox keys and test accounts. Never use a live key on `uat`.

## Done when

- [ ] Each UAT project has each name of `.env.example` that `uat` needs.
- [ ] No variable on `uat` holds a live key.

## Notes

2026-10-30: `vercel env ls uat --scope kodominio` on the project `berceo` was checked
against every name in `.env.example` that applies to `uat` (`production`/`preview` names
the Neon integration injects, plus the application's own names). Present on `uat`:
`DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`,
`EMAIL_FROM`, `DOCUMENTS_S3_ENDPOINT`, `DOCUMENTS_S3_REGION`, `DOCUMENTS_BUCKET`,
`DOCUMENTS_S3_ACCESS_KEY_ID`, `DOCUMENTS_S3_SECRET_ACCESS_KEY`, `CRON_SECRET`,
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_DECOUVERTE`,
`STRIPE_PRICE_PARENTHESE`, `STRIPE_PRICE_SERENITE`, `STRIPE_PRICE_PREMIUM`,
`STRIPE_TEST_CLOCKS`.

**`RESEND_API_KEY` is missing from `uat`.** `.env.example` names it for
`production,preview,development`, and the application's transactional e-mail route reads
it; without it, any e-mail the app sends on UAT fails. `EMAIL_FROM` is set but the key it
pairs with is not. A sandbox Resend key needs creating in the Resend dashboard (an
account action, not available from this machine's CLIs) and adding to `uat` as
`RESEND_API_KEY`. This stub stays open for that one variable.

No variable's value can be read back (all are `Hidden`/`Secret` or masked `Config` in the
CLI), so "no variable on `uat` holds a live key" is not independently verifiable here;
Jamie's existing discipline (test accounts, sandbox keys) is taken on trust for the values
already set.
