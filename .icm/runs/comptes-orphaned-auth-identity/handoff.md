# Handoff: comptes-orphaned-auth-identity

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. Once **Ready to merge** is ticked on https://github.com/k0d0minio/berceo/pull/62: `/pipeline release comptes-orphaned-auth-identity`.

## Blockers

- blocked on operator: smoke the preview (https://berceo-git-claude-wizardly-darwin-dk0jc8-kodominio.vercel.app) per the last acceptance criterion, then tick **Ready to merge** on https://github.com/k0d0minio/berceo/pull/62.

A blocking operator act is written here **and** in the stop report's `Operator:` list; a
non-blocking one lives only in that list, never here (`_shared/output.md` → Split by actor).

## Do not

- Tick any gate box, or any acceptance-criterion box in the PR body (learned rule: refused as self-approval).
- Touch `src/app/(auth)/verification-email/confirmer/route.ts`: it is `comptes-welcome-email-no-retry`'s.
- Rebuild a `users` row from what the Neon identity carries (D-165).
