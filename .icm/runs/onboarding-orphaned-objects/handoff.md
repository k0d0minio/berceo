# Handoff: onboarding-orphaned-objects

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. Operator: smoke the preview on https://github.com/k0d0minio/berceo/pull/61 (a professional
   removes a file, replaces her photo, changes profession — all as before), then tick
   **Ready to merge**.
2. Then `/pipeline release onboarding-orphaned-objects`.

## Blockers

- blocked on operator: smoke the preview and tick **Ready to merge** on https://github.com/k0d0minio/berceo/pull/61

## Do not

- Do not touch the photo's single-slot logic beyond the removal order: `onboarding-double-photo-race`.
- Do not fix the "last file" race in `removeFile` here: parked as
  `.icm/intake/triage/onboarding-remove-last-file-race.md`.
- Never tick a gate.
