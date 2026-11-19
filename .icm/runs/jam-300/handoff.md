# Handoff jam-300

## Next action

The operator answers the six questions on the HUD card or in the pull request body. The operator then says `new JAM-300`. The session runs `questions.sh JAM-300`, puts the answers in `spec.md`, and runs `new-run.sh JAM-300 --refresh-body`. The operator then ticks Spec approved and says `build JAM-300`.

## How to test

On the Vercel preview, open the home page, `/comment-ca-marche`, a sign-in page, a portal and `/design-system`. Check that no button is dark green, that titles are in capitals, that the logo sits where the DA says, and that no 1, 2, 3 badge remains. Hover a button on each background and check the butter or sage hover.

## Blockers

- Six questions wait for an answer (Q1 to Q6 in the pull request body).

## Do not touch

- `.icm/_system/`
- The family's "yellow/green clicks" question. It is open with the client.
