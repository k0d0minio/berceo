# Setup — the calendar of the sleep consultation

Language: en

This file belongs to the repo. It has acts that a person does in Vercel. Calendly needs no
setting: the page uses no redirect from Calendly. A
session reads the boxes and does not tick them.

The page `/consultation-sommeil` shows the founders' Calendly calendar in the page, after the
visitor clicks « Choisir un créneau » (JAM-305, JAM-352). The address of the calendar is the
environment variable `SLEEP_CONSULTATION_URL`. The value is never in git. Where the variable is
empty or is not an `https://` address, the page answers 404 and no link leads to it. The calendar shows in the page only where the address is on
`https://calendly.com`; for a different host, the button is a link.

## The variable

- [x] Get the address of one event type from the founders: `https://calendly.com/<account>/<event>`.
- [x] In Vercel, project `berceo`, Settings, Environment Variables: set `SLEEP_CONSULTATION_URL`
      for the environment `uat`, for Preview and for Production.
- [ ] Redeploy each environment. Production: with the promotion of the release that has JAM-352.
- [ ] Open `/consultation-sommeil` on UAT and click « Choisir un créneau ». Make sure that the
      calendar shows in the page.
- [ ] Make one test booking with an invented person. Make sure that « Votre rendez-vous est
      enregistré » shows above the calendar. Then cancel the booking in Calendly.

## The privacy page

- [ ] Read the block « Consultation sommeil et Calendly » of `/confidentialite`
      (`src/content/legal.ts`). It names Calendly as the recipient of the booking data. A person
      who knows the law of personal data approves the text before the launch.
