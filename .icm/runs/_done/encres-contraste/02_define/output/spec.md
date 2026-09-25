# Spec: Legible ink on every surface

- slug: encres-contraste
- personas: parent, professionnel, admin
- touches: src/app/globals.css, src/app/contrast.test.ts (new), src/components/ui/button.tsx, src/components/ui/card.tsx, src/components/ui/input.tsx, src/components/ui/tabs.tsx, src/components/ui/striped-section.tsx, src/components/vitrine/section.tsx, src/components/shell/public-footer.tsx, src/components/shell/public-header.tsx, src/components/shell/portal-shell.tsx, src/components/shell/mobile-menu.tsx, src/components/professionnelle/steps-header.tsx, src/components/professionnelle/file-slot.tsx, src/components/disponibilites/availability-calendar.tsx, src/app/(public)/design-system/page.tsx, src/content/design-system.ts, and every file under src/ that names `text-sauge` or `text-taupe` (67 files, 241 uses, a mechanical rename)
- complexity: standard

## Problem

Every text colour of the DA's palette fails WCAG AA on the surface it sits on (measured on uat.berceo.be on 2026-09-25, scope finition-accueil): body text is taupe on white at 1.98:1, the steps are taupe on pearl at 1.47:1, headings, the nav and the outlined buttons are sage on white at 2.41:1, and white on sage (the footer, the filled buttons, the "Pourquoi Berceo ?" heading) is 2.41:1. Field borders and the focus ring are under the 3:1 AA asks of a control. Families read the site at night on a phone, the DA itself asks for « un contraste suffisant » (p. 13) and « contraste lisible » (p. 24), and plateforme-v1 committed to WCAG 2.1 AA. This is the first of three stubs that bring the homepage to a finished state before the first usable version on uat.berceo.be (Plateforme Berceo V1, before December 2026); it is solved on the tokens so the vitrine, the sign-in pages and the three signed-in spaces are fixed at once (D-3).

## Proposed change

**Two ink tones join the tokens (D-1).** Declared in `src/app/globals.css` only, next to the five DA colours, which keep their values and stay as surfaces, borders and accents:

| Token | Value | on white | on pearl | on butter | on sage | white on it |
| --- | --- | --- | --- | --- | --- | --- |
| `encre-sauge` | `#3c584b` | 7.81 | 5.80 | 7.04 | 3.25 | 7.81 |
| `encre-taupe` | `#646254` | 6.15 | 4.57 | 5.54 | 2.56 | 6.15 |

Both are sage and taupe darkened on their own hue (HSL lightness 0.29 and 0.36). The sage ink is deeper than the scope's « about #48685a » on purpose: #48685a reaches only 2.57:1 on the light sage band, where D-2 puts an ink heading and where the focus ring and the filled button sit; the operator chose one darker sage ink over two (2026-09-25). Both values carry a `@relecture` note for Surya in the CSS comment; the contrast test, not the eye, is what holds them.

**Which ink where.** Every text that was sage takes the sage ink (headings, the nav, links, outlined buttons); every text that was taupe takes the taupe ink (body, captions, fields). The shadcn contract is remapped on the tokens so the components in `src/components/ui/` follow without edits: `--foreground`, `--card-foreground`, `--popover-foreground`, `--secondary-foreground`, `--muted-foreground`, `--accent-foreground`, `--destructive` and `--input` become the taupe ink; `--primary` and `--ring` become the sage ink; `::selection` keeps butter with the taupe ink. The explicit `text-taupe` and `text-sauge` utilities (241 uses in 67 files) are renamed to `text-encre-taupe` and `text-encre-sauge`, prefixes and opacity suffixes kept (`hover:`, `placeholder:`, `/70`). A rename was chosen over redefining `text-taupe` to mean the ink: the utility's name then says the colour it paints, `bg-taupe` and `text-taupe` never disagree, and the chain after this stub branches from the merged result, so the size of the rename costs no conflict.

**White text only on an ink surface (D-2).**

- The footer moves from sage to the sage ink, with white text (7.81:1).
- The light sage band (`VitrineSection tone="sauge"`, on `/` and `/comment-ca-marche`) keeps its colour; its H2 takes the sage ink (3.25:1, large text), and it no longer sets white text on the band, whose body text lives in its white cards (`ReasonGrid`).
- The block on the stripes defaults to the white block with taupe-ink text; the taupe block option is removed from `StripedSection`, so no caller can put white text on taupe again.
- The card's `sauge` and `taupe` tones become the sage ink and the taupe ink, with white text; the `blanc` tone carries the taupe ink.
- The hand-drawn filled marks that set white on sage (a marked night in the availability calendar, a done step's number in the professional's step header, the file slot's hover) move to the sage ink.

**The four button rows keep their shape; their colours change.** Text passes AA in the resting and the hover state, and the resting outline reaches 3:1 against the surface the row is meant for.

| Row (surface) | Resting | Hover |
| --- | --- | --- |
| `blanc` (white) | white fill, sage-ink border and text | sage-ink fill and border, white text |
| `raye` (stripes, white) | white fill, taupe-ink border and text | butter fill and border, taupe-ink text |
| `sauge` (sage band) | sage-ink fill, white border, white text | butter fill and border, sage-ink text |
| `taupe` (white block on the stripes) | taupe-ink fill, white border, white text | butter fill and border, taupe-ink text |

The "Trouver une professionnelle" button on the light sage band stays on the `sauge` row, so it is deep sage filled with white text, and its fill reaches 3.25:1 against the band (operator's choice, 2026-09-25). The homepage's "Rejoindre le réseau" button stays on the `taupe` row inside the now-white block. The butter hover's edge against a white or sage surface is below 3:1; that is accepted, because the hovered button is still identified by its AA text and the 3:1 rule is held on the resting state.

**Controls reach 3:1.** Field borders (`--input`) are the taupe ink (6.15:1 on white); the invalid border (`--destructive`) is the same ink, as today it is the same taupe. The focus ring is the sage ink (7.81 on white, 5.80 on pearl, 3.25 on the sage band); on the two ink surfaces (the footer, an ink card) it is white, set on those surfaces, so a focused footer link is not ringed in its own background. The current step's border in the step header and the selected night's outline in the calendar take the inks. Separators and card borders in pearl stay pearl: they are decoration, not a control's boundary. The progress bar's sage fill stays: the step counter above it says the same thing in text.

**Dimmed text.** Placeholder and dimmed labels that use an opacity suffix (`placeholder:text-taupe/70` in the input, `text-foreground/60` in the inactive tab) are composited on their surface in the test; each opacity is raised to the lowest step of ten that passes 4.5:1. Disabled controls (`disabled:opacity-50`) are exempt, as WCAG exempts them.

**The contrast test.** A new unit test, `src/app/contrast.test.ts`, reads the colour values from `src/app/globals.css` (never a copy of them), and holds a table of every text and surface pair the platform declares: each ink and white on each surface it is used on, each button row resting and hovered, the placeholder and dimmed pairs composited, the field border, the resting button outlines and the focus ring on each surface, each row with its size class. It fails below 4.5:1 for body text and 3:1 for large text (24 px, or 18.66 px bold) and for a control's boundary. A second check fails if any file under `src/` names `text-sauge` or `text-taupe` (with any prefix or opacity), so the DA's light colours cannot come back as text.

**The design system page shows the inks.** `/design-system` gets two swatches, « Encre sauge » and « Encre taupe », with their role (text on white and pearl, and the filled surfaces that carry white text), in `src/content/design-system.ts` and flagged `@relecture`; its hand-written hover samples follow the new rows. `/design-system/portail` renders with the new tokens without its own edit.

## Acceptance criteria

- [ ] `src/app/contrast.test.ts` reads the values from `src/app/globals.css`, lists every text and surface pair above, and fails below 4.5:1 for body text and below 3:1 for text at 24 px or more (18.66 px bold) and for a control's boundary; it passes on this branch.
- [ ] The same test fails if any file under `src/` names `text-sauge` or `text-taupe`, with any variant prefix or opacity suffix; none does.
- [ ] `--encre-sauge` is `#3c584b` and `--encre-taupe` is `#646254`, declared in `src/app/globals.css` only, each flagged `@relecture` for Surya; the five DA values (`#ffffff`, `#8baf9f`, `#bab9ad`, `#e0ded8`, `#fef5b5`) are unchanged, and no component, page or content file carries a colour literal (the test alone names the five DA values, to assert them).
- [ ] The four button rows (`blanc`, `raye`, `sauge`, `taupe`) show the resting and hover colours of the table above, and their text passes 4.5:1 in both states.
- [ ] Field borders, the resting outlines of the `blanc` and `raye` rows, and the focus ring reach 3:1 against their surface; on the footer the focus ring is white.
- [ ] The footer is the sage ink with white text; the light sage band's H2 is the sage ink and the band sets no white text; the block on the stripes is white with taupe-ink text and `StripedSection` has no taupe block option; the card's `sauge` and `taupe` tones are the inks with white text.
- [ ] No page shows white text on sage, taupe, pearl or butter: the availability calendar's marked night, the step header's done step and the file slot's hover use the sage ink.
- [ ] Placeholder and dimmed text pass 4.5:1 composited on their surface.
- [ ] `/design-system` shows the two ink swatches and the new button rows; `/design-system/portail` renders with the new tokens.
- [ ] Checked on the preview at 390 and 1440 px: `/`, `/comment-ca-marche`, `/tarifs`, `/faq`, a sign-in page, and one page of each signed-in space (famille, professionnelle, admin) show ink text, no white text on a light surface, and no layout change.

## Out of scope

- Any layout or size change: the header nav, the hero, the step list, the reason cards, Gardiennes and the striped block's length are premier-ecran and blocs-accueil. [D-4, D-6]
- Any word on the public pages, metadata or alt text. [D-5] The only new words are the two swatch names and their role on the noindex `/design-system` page, flagged `@relecture`.
- Changing the five DA colours' values. [D-1]
- Redesigning the signed-in spaces: they receive the tokens and the rename, and are checked. [D-3]
- A dark theme, a new component, motion.
- Surya's confirmation of the two ink values: asked through the `@relecture` flag, not waited for.

## Open questions

- none — the three points the scope left open for this stub are closed above: the hexes (one sage ink at `#3c584b`, the operator's choice, and `#646254`), the hover states (ink on butter), and the band's button (deep sage filled, the operator's choice).

Context budget: read `button.tsx`, `card.tsx`, `striped-section.tsx`, `section.tsx`, `public-footer.tsx`, `reason-grid.tsx`, parts of `steps-header.tsx`, `availability-calendar.tsx`, `design-system.ts` and the homepage beyond the Inputs, to fix the button rows and every white-on-light pair; the contrast figures were computed from the token values in session.
