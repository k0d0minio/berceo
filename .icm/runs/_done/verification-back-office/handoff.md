# Handoff: verification-back-office

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. Merged and archived; nothing to pick up. The batch reaches production with the operator's promotion (`promote status`, then `promote approve "<who>"` once the founders sign it off on uat.berceo.be).

## Blockers

- none

## Do not

- Do not edit `drizzle/0004_verification_back_office.sql`: the trigger lines are hand-appended and `db:verify` hashes the file.
- Do not add a contact address to the complément or refusal e-mails until Berceo publishes one (D-51) — that is a tweak of its own.
