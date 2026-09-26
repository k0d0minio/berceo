# Handoff: comptes-auth-cleanups

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. Operator: smoke the preview https://berceo-git-claude-cool-cannon-poc3zn-kodominio.vercel.app — as a signed-in family open `/espace/famille/recherche?commune=<x>` and a notice URL such as `/espace/famille/profil?completer=1` (the page, not a redirect); request a password reset and check the e-mail arrives with a link to `/nouveau-mot-de-passe` (if it does not, look for `[comptes] reset request failed` in the logs — see notes.md → Notes for Release).
2. Operator: tick **Ready to merge** in the body of https://github.com/k0d0minio/berceo/pull/52, then `/pipeline release comptes-auth-cleanups`.

## Blockers

- blocked on operator: smoke the preview and tick **Ready to merge** on https://github.com/k0d0minio/berceo/pull/52.

## Do not

- Do not tick either gate on the PR.
- Do not start `comptes-orphaned-auth-identity` or `comptes-welcome-email-no-retry` on this branch.
- Do not change `/admin` pages or `src/proxy.ts`.
