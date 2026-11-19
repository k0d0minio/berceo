### Q1. Which display font do H1, H2 and the navigation use until the licensed Comodo files arrive?
- type: single
- options: Keep Fraunces in capitals at the DA sizes | Wait for the Comodo files before Build
- default: Keep Fraunces in capitals at the DA sizes, until Jamie supplies the licensed files (JAM-308)
- answer: _waiting_

### Q2. What happens to the contrast test `src/app/contrast.test.ts`?
- type: single
- options: Skip it with a note that links this decision | Delete it | Keep it and change the pairs it checks
- default: Skip it with a note that links this decision. Do not delete it
- answer: _waiting_

### Q3. Which colour does text on white use when the two inks are removed?
- type: single
- options: Taupe #BAB9AD and sage #8BAF9F as the DA shows | Keep encre-taupe for body text only
- default: Taupe #BAB9AD and sage #8BAF9F as the DA shows, accepted below AA by the client
- answer: _waiting_

### Q4. Which icon set replaces the thin line icons of lucide-react?
- type: single
- options: Phosphor Icons in the fill weight | Keep lucide-react for this run
- default: Phosphor Icons (`@phosphor-icons/react`) in the fill weight replace lucide-react on every page
- answer: _waiting_

### Q5. Which photographs does the run use for the large photos?
- type: single
- options: The 4 photos in public/photos | A selection from the Drive image bank that Jamie supplies
- default: The 4 photos in `public/photos/`, shown large. Jamie adds more from the Drive bank in a later ticket
- answer: _waiting_

### Q6. Does the red #ED5957 replace #bc312f everywhere the red token is used?
- type: single
- options: Yes, one red token for dialogs, refuse and form errors | Only in confirmation dialogs and the refuse button
- default: Yes. `--rouge-confirmation` becomes #ED5957 for dialogs, the admin refuse button and the field that blocks a form
- answer: _waiting_
