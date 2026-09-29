# Handoff: comptes-welcome-email-no-retry

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. The operator smokes the preview (https://berceo-git-claude-affectionate-ptolemy-i5mxea-kodominio.vercel.app): sign up as a family, click the verification link, land in `/espace/famille` signed in, and receive the welcome e-mail with a link to the preview's address.
2. Once **Ready to merge** is ticked on https://github.com/k0d0minio/berceo/pull/64, run `/pipeline release comptes-welcome-email-no-retry`.

## Blockers

- blocked on operator: smoke the preview and tick **Ready to merge** on https://github.com/k0d0minio/berceo/pull/64.

## Do not

- Do not tick the gate yourself, and do not tick acceptance-criteria boxes in the PR body (their status is in `03_build/output/notes.md`).
- Do not touch `comptes-orphaned-auth-identity` (its own run on `claude/wizardly-darwin-dk0jc8`).
