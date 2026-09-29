# Handoff: gardes-refund-failure-unflagged

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. The operator smokes the preview https://berceo-git-claude-adoring-dijkstra-o6099q-kodominio.vercel.app/admin/paiements as an admin: seed one paid booking cancelled by the professional (`bookings.status = 'annulee'`, `cancelled_by = 'professionnelle'`, `cancellation_kind = 'annulation'`, its payment still `payee`) on the preview's Neon branch, then check the row mark, the « À rembourser » filter, the overview line on `/admin`, and the refund dialog's text.
2. The operator ticks **Ready to merge** on https://github.com/k0d0minio/berceo/pull/63, then `release gardes-refund-failure-unflagged`.

## Blockers

- blocked on operator: smoke the preview and tick **Ready to merge** on https://github.com/k0d0minio/berceo/pull/63.

## Do not

- Do not tick Ready to merge or any acceptance box from a session.
- Do not touch `src/lib/gardes/` or the other two stubs of `gardes-annulation-suivi`.
- Do not add a column or a migration for the flag (D-162).
