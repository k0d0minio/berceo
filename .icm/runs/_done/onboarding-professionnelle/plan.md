# Plan: onboarding-professionnelle

Build's execution plan in passes — each pass one layer of the change, in the order it lands, so
a session that resumes mid-build sees where it is. Written by the advisor pass (Define, or
Build's first act on `sonnet` after reading the spec), executed pass by pass, and rewritten when
reality disagrees with it — never left describing a plan that was abandoned.

## Passes

1. **Schema and migration** — `src/db/schema.ts` (enums: profile status, profession, experience,
   document kind, declaration key; tables `professional_profiles`, `professional_communes`,
   `professional_documents`, `professional_declarations`, `app_settings` with the rate and bio
   `CHECK`s), `npm run db:generate -- --name onboarding_professionnelle`, load
   `.icm/skills/database-migration/` first — done when: the one new migration is committed, the
   journal test passes, and a test proves the rate `CHECK`.
2. **Pure rules** — `src/lib/professionnelle/` (the per-profession requirements table, step
   completeness, the first incomplete step, the state transitions: submit, edit while
   `en_attente`, the `valide` → `en_attente` rule; INAMI normalisation; field validation) and
   `src/lib/settings/` (read and write the students switch) — done when: unit tests cover every
   acceptance criterion that names a rule, with no database or network.
3. **Communes data** — `scripts/communes/` (regenerate from NGI's 2025 register + bpost's postcodes, sources named; Statbel refuses scripts)
   and `src/lib/communes/` (the committed data, search by FR name, NL name, postcode) — done when:
   the count and NIS-uniqueness test passes and a search test finds a commune three ways.
4. **Storage** — `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`; `src/lib/documents/`
   (client from the five `DOCUMENTS_*` env vars — Vercel reserves `AWS_*`, D-43 —, presigned PUT bound to type and size, confirm = HEAD + first
   bytes check or delete, delete, stream) and `src/app/api/fichiers/[id]/route.ts` (owner or
   admin, else 404); Neon API: private bucket, CORS, `storage:write` credential on the nonprod
   `main` branch; Vercel Preview and `uat` env vars; `.env.example` — done when: the route's
   access tests pass (owner, admin, signed-out, parent, other professional) and an upload
   round-trip works on the nonprod store.
5. **Words** — `src/content/professionnelle.ts`, `src/content/admin.ts`, guide lines verbatim,
   the rest `@relecture Surya` — done when: the content tests (no `!`, `…`, `—`, no insurance
   wording) pass on the new files.
6. **The onboarding UI** — `src/components/professionnelle/` (step header and progress bar, file
   slots, commune picker) and `src/app/(portail)/espace/professionnelle/**` (the space's
   redirect by state, `inscription/profil|justificatifs|declarations`, the submission message,
   `profil` with the edit rules and the confirmation dialog), server actions calling pass 2's
   rules — done when: a professional can go from a verified account to `en_attente` on a preview.
7. **The students switch** — `src/app/(portail)/admin/` (the setting, its confirmation dialog,
   the admin-only server action) — done when: the switch flips on a preview and a non-admin
   call is refused.
8. **Docs** — `README.md` (storage, the five env vars, the routes), `AGENTS.md` (routing rows for
   `src/lib/documents/`, `src/lib/communes/`, the onboarding) — done when: both name every new
   surface.

## Risks

- Vercel previews run on Neon branches the integration creates; the store is reached through the
  nonprod `main` endpoint, so a preview's objects land in the UAT store. Signal: an upload works
  on UAT but 403s on a preview (credential lineage) — then check the credential was minted on
  nonprod `main`.
- Browser PUT to the Neon store needs the bucket's CORS rule; preview origins are
  `*.vercel.app`. Signal: a CORS error in the console on upload.
- Streaming a 10 MB file through a Vercel function: signal a truncated download or a 413 on the
  route; fall back to a streamed `Response` body, never a public URL.
- The Statbel and bpost sources may have moved or changed format; the script must fail loudly
  rather than commit a short list (the count test guards it).
- Production's bucket, credential and env vars are the operator's (D41); UAT works without them,
  the promotion does not.
