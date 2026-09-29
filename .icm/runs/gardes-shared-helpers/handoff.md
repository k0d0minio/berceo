# Handoff: gardes-shared-helpers

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. The operator smoke-tests the preview https://berceo-git-claude-funny-johnson-8h00zm-kodominio.vercel.app against the UAT-preview criterion in `02_define/output/spec.md`:
   - the night's end moves the conversation, « Terminée » and the address together;
   - both sides' cancellation e-mails;
   - a booking confirmation;
   - optionally the cron refusals (`curl -X POST …/api/cron/demandes-digest` gives 401, `curl …/api/cron/purge-dossiers-refuses` gives 404).
2. The operator ticks **Ready to merge** on https://github.com/k0d0minio/berceo/pull/56, then runs `/pipeline release gardes-shared-helpers`.

## Blockers

- blocked on operator: smoke the preview and tick **Ready to merge** on https://github.com/k0d0minio/berceo/pull/56

## Do not

- Do not tick either gate or any acceptance box from a session.
- Do not move `care_requests` reads out of `gardes.ts` or `reservations/bookings.ts`: `care-requests-read-ownership` owns that, and it builds on this run's shape once it has merged.
- After the merge, if the Actions runs of `demandes-digest`, `gardes-rappel` or `avis-invitations` answer 401 on UAT, the `CRON_SECRET` there is under 16 characters (D-153). That is the operator's secret to lengthen, not a code change.
