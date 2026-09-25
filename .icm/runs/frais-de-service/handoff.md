# Handoff: frais-de-service

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. The operator sets the Stripe test key (and, once the UAT endpoint is registered, the webhook secret) in Vercel, then smokes the preview https://berceo-git-claude-relaxed-cray-iu7op8-kodominio.vercel.app : a family accepts an answer, pays with Stripe's test card 4242 4242 4242 4242 and with the Bancontact test flow, lands on the booking; « Retour » on Stripe's page returns to the open request; `/admin/paiements` lists the fees and refunds one.
2. The operator ticks **Ready to merge** on https://github.com/k0d0minio/berceo/pull/45, then `/pipeline release frais-de-service`.
3. Release: read `03_build/output/notes.md` → Notes for Release first (the D-87..D-91 collision and the 0008 migration shared with messagerie; env GAPS 2).

## Blockers

- blocked on operator: `STRIPE_SECRET_KEY` (a Stripe test-mode key) in Vercel for Preview and Development, and Bancontact enabled on that Stripe account — without them the payment itself cannot be smoked (D-88).
- blocked on operator: `STRIPE_WEBHOOK_SECRET` for Preview, from the endpoint `https://uat.berceo.be/api/webhooks/stripe` registered in Stripe's test mode with the seven events in README « The service fee ». Release's `env.sh audit --changed` stops on both until they exist (Production may stay empty until the company's live account, D-88).

## Do not

- Do not renumber messagerie's decisions from this run; the run that merges second renumbers its own.
- Do not hand-edit `drizzle/meta/_journal.json` if messagerie merges first: regenerate this run's migration on the merged tree.
- Do not tick the PR's acceptance-criteria boxes from a session (Learned rules); their status is in notes.md.
