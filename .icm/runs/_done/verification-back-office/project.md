# Project: verification-back-office

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/plateforme-v1/verification-back-office.md
- scope: .icm/runs/plateforme-v1/01_scope/output/scope.md
- spec: 02_define/output/spec.md
- touches: src/db/schema.ts, drizzle/**, src/app/(portail)/admin/**, src/app/(portail)/espace/professionnelle/**, src/app/api/cron/**, src/lib/admin/**, src/lib/professionnelle/**, src/lib/settings/**, src/lib/email/**, src/components/admin/**, src/content/admin.ts, src/content/emails.ts, src/content/professionnelle.ts, vercel.json, .env.example, README.md, AGENTS.md
- complexity: standard → model: sonnet (executor — select-model.sh --stage 03_build)

## Constraints

- Only `valide` profiles may ever be shown to anyone but their owner and the admins; this run shows none to families.
- The journal has no update or delete path, in code or in the database (trigger); names are snapshots, no foreign keys.
- No contact address is invented (AGENTS.md standing rule): the complément and refusal e-mails omit the guide's `[email]` sentences.
- Red and green only in confirmation dialogs (D-24); every word in `src/content/` (D-19); no insurance wording (D-8).
- Every server action checks the admin role at runtime (Learned rules).
- Production's Neon project and Vercel Production variables are never written from a run: `CRON_SECRET` in Production is the operator's.

## Context budget

- Define read Surya's guide (verification tool, e-mails, back-office sections), the onboarding spec and decisions, and the schema, rules, settings, e-mail and file-serving code to fix states, routes and the data model.
