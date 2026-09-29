# Handoff: onboarding-double-photo-race

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. Operator: smoke the preview https://berceo-git-claude-zen-clarke-6b3scp-kodominio.vercel.app
   (a professional's space: upload a photo, pick a second one quickly; the file view shows one
   photo), tick **Ready to merge** in https://github.com/k0d0minio/berceo/pull/60, then run
   `/pipeline release onboarding-double-photo-race`.
2. Release: read `03_build/output/notes.md` → Notes for Release — the overlap with
   k0d0minio/berceo#61 on `confirmUpload`'s photo block.

## Blockers

- blocked on operator: tick **Ready to merge** on https://github.com/k0d0minio/berceo/pull/60

## Do not

- Do not tick the gate.
- Do not reintroduce a `removeDocuments` call on the photo path when resolving a conflict with
  #61: the replacement lives in `recordUpload` now.
