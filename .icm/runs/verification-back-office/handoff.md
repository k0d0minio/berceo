# Handoff: verification-back-office

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. The operator smokes the preview (https://berceo-git-claude-eager-noether-7eic1m-kodominio.vercel.app, behind Vercel SSO) with an admin account: the queue, a file, each decision, the journal, and a professional's "Renvoyer mon dossier".
2. The operator ticks **Ready to merge** on https://github.com/k0d0minio/berceo/pull/39 (the acceptance-criteria boxes are unticked: ticking them from the session was refused as self-approval; `03_build/output/notes.md` → Acceptance criteria status has each one).
3. Then `/pipeline release verification-back-office`.

## Blockers

- blocked on operator: smoke the preview and tick **Ready to merge** on https://github.com/k0d0minio/berceo/pull/39.
- Before the batch is promoted to production: `CRON_SECRET` in Vercel Production (`env.sh audit --changed` reports it as the one GAP, by design).

## Do not

- Do not tick any PR checkbox from a session.
- Do not add a contact address to the complément or refusal e-mails (D-51), or a new state for held student files (D-52).
- Do not edit `drizzle/0004_verification_back_office.sql` once merged: the trigger lines are hand-appended and `db:verify` hashes the file.
- Do not write production's Neon project or Vercel Production variables.
