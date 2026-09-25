# Handoff: back-office-admin

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. The operator smokes the preview (https://berceo-git-claude-zen-clarke-421zu4-kodominio.vercel.app, signed in as an admin), especially the criteria left unticked in `03_build/output/notes.md`: the sign-in refusal and the session ending for a suspended account, a real deletion (bucket files, Neon Auth identity), a real « Contacter l'utilisateur » e-mail and its Reply-To, the pages' look.
2. The operator ticks **Ready to merge** on https://github.com/k0d0minio/berceo/pull/51, then runs `release back-office-admin`.

## Blockers

- blocked on operator: smoke the preview and tick **Ready to merge** on PR #51.

## Do not

- Do not tick either gate checkbox, or the acceptance criteria in the PR body (Learned rules).
- Do not hard-delete a `users` row, cancel a confirmed garde on suspension, or touch the journal trigger (D-134, D-136, D-54).
- Do not commit the `scripts/.probe-*.mts` files (excluded locally).
