# Handoff jam-300

## Next action

The operator tests the change on the Vercel preview, ticks Ready to merge, then says `release JAM-300`.

## How to test

On the preview, open the home page, a vitrine page, the sign-in page, a portal and `/design-system`. Check that no button is dark green, that titles and navigation are in capitals, that the logotype is on the home and sign-in pages and the footer and the logomark on the inner pages, and that no 1, 2, 3 badge remains. Hover a button on each background, and in the admin queue check that « Refuser » is red.

## Acceptance criteria

- No colour outside the charter in `globals.css`; the inks are gone (verify: CI): met. The `ci` run is green at aa6efd6.
- No dark green button (verify: operator): to check on the preview.
- Buttons on the four backgrounds, hover (verify: operator): to check on the preview and `/design-system`.
- Display face in capitals at the DA sizes, the rest Nunito (verify: operator): to check on the preview.
- Logotype and logomark placement (verify: operator): to check on the preview.
- Large photos and the pearl block on the home page (verify: operator): to check on the preview.
- No numbered badge (verify: agent): met. On the preview `/comment-ca-marche` shows no number badge. The onboarding steps draw no number. The text « Étape n sur 4 » stays.
- Filled rounded icons (verify: agent): met. Every icon comes from `src/components/icons.tsx` (Phosphor fill). The stars are filled. `lucide-react` is removed. The preview shows only filled SVGs.
- No two striped sections in a row, text over the stripes in a plain block (verify: agent): met. One striped section on the home page, in a taupe block, then the footer.
- Red refuse and confirmation colours (verify: operator): to check in the admin queue.
- `/design-system` shows the palette, the button rows, the type scale and the icons (verify: operator).
- Contrast test skipped with a note (verify: CI): met. `describe.skip` with the JAM-300 note, and the `ci` run is green.
- Decision note in `.icm/intake/README.md` (verify: agent): met. `CLAUDE.md` follows it.

## Notes for the operator

- On a 375 px phone the hero H1 breaks « PROFESSIONNELLES » without a hyphen in the agent's browser. That browser has no French hyphenation dictionary. Chrome and Safari on a phone add the hyphen. Check it on a real phone.
- The white text on the pearl block over the photo is light, as the DA shows it. The client accepts it below AA.
- The H3 titles (cards, profile names) are now Nunito Bold, as the DA says, not the display face.

## Blockers

- none

## Do not touch

- `.icm/_system/`
- The family's "yellow/green clicks" question. It is open with the client.
