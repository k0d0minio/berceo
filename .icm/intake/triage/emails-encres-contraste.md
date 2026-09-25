# Stub: The transactional e-mails still use the DA's light text colours

- lane: tweak
- found-by: encres-contraste build · 2026-09-25
- complexity: low

## Problem

`src/lib/email/templates.ts` repeats the DA's palette as literals (`SAUGE`, `TAUPE`, `PERLE`, `BLANC`), because e-mail clients cannot read CSS variables. The site moved text and filled controls to two inks in encres-contraste (sage ink `#3c584b`, taupe ink `#646254`, `src/app/globals.css`, finition-accueil D-1, D-2), but the e-mails still set taupe text on white (1.98:1) and, where the capsule button is sage with white text, 2.41:1. Every e-mail a family or a professional receives fails WCAG AA the way the site did.

## Proposed change

Add the two ink literals next to the others in `templates.ts`, with the same "mirrors globals.css, change both together" comment `src/app/theme-color.ts` carries. Body text takes the taupe ink, the logotype and links the sage ink, and the button the sage-ink fill with white text. Words and layout unchanged. The e-mail tests already render every template, so they cover the change.
