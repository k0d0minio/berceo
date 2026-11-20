# Setup — the calendar of the sleep consultation

Language: en

This file belongs to the repo. It has acts that a person does in Vercel and in Calendly. A
session reads the boxes and does not tick them.

The page `/consultation-sommeil` shows the founders' Calendly calendar in the page, after the
visitor clicks « Choisir un créneau » (JAM-305, JAM-352). The address of the calendar is the
environment variable `SLEEP_CONSULTATION_URL`. The value is never in git. Where the variable is
empty or is not an `https://` address, the page and its confirmation page answer 404 and no link
leads to them. The calendar shows in the page only where the address is on
`https://calendly.com`; for a different host, the button is a link.

## Part 1 — the variable (necessary)

- [ ] Get the address of one event type from the founders: `https://calendly.com/<account>/<event>`.
- [ ] In Vercel, project `berceo`, Settings, Environment Variables: set `SLEEP_CONSULTATION_URL`
      for the environment `uat`, for Preview and for Production.
- [ ] Redeploy each environment. Production: with the promotion of the release that has JAM-352.
- [ ] Open `/consultation-sommeil` on UAT and click « Choisir un créneau ». Make sure that the
      calendar shows in the page.
- [ ] Make one test booking with an invented person. Make sure that « Votre rendez-vous est
      enregistré » shows above the calendar. Then cancel the booking in Calendly.

## Part 2 — the redirect in Calendly (optional)

The page confirms a booking from a message that Calendly posts to it. The redirect is a second
path, for a visitor who booked on calendly.com directly. The labels below are from memory: make
sure that they agree with Calendly's screen. The option can need a paid Calendly plan.

- [ ] In Calendly, on the event type of production: after a booking, redirect to an external
      site, with the address `https://www.berceo.be/consultation-sommeil/confirmation`.
- [ ] Leave the option that passes the event details to the redirected page off. With it on,
      Calendly adds the invitee's name and e-mail address to the address, and the access log of
      Vercel records them.
- [ ] One event type has one redirect address. For UAT, use a second event type with
      `https://uat.berceo.be/consultation-sommeil/confirmation`, or set no redirect for UAT.
- [ ] Make one test booking in the page with the redirect on. Record if the redirect happens
      inside the frame or in the full window.

## The privacy page

- [ ] The legal text of `/confidentialite` names Calendly as a recipient of the booking data:
      the visitor's name, e-mail address and what they type in the calendar go to Calendly.
