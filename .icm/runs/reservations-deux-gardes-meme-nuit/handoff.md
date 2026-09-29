# Handoff: reservations-deux-gardes-meme-nuit

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. Operator smokes the preview of https://github.com/k0d0minio/berceo/pull/59 (Vercel deployment for head ece9e38): as a family with a booked night, publish a new request for that night and move another open request onto it, both must show « Vous avez déjà une demande pour cette nuit. » on the date.
2. Operator ticks **Ready to merge** in the PR body, then `release reservations-deux-gardes-meme-nuit`.

## Blockers

- blocked on operator: smoke the preview and tick **Ready to merge** on https://github.com/k0d0minio/berceo/pull/59.

## Do not

- Do not tick either gate box.
- Do not add a data fix to the migration (D-158).
- Do not touch `src/lib/reservations/answers.ts`: the epic's next two stubs own it.
- Do not renumber D-156–D-158 again; the sibling runs' D-153–D-155 collision is theirs to settle.
