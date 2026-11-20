# Setup — the address of the sleep consultation

Language: en

This file belongs to the repo. It is one act that a person does in Vercel. A session reads
the boxes and does not tick them.

The page `/consultation-sommeil` has one button that opens the founders' calendar. Its address
is the environment variable `SLEEP_CONSULTATION_URL` (JAM-305). The value is never in git.
Where the variable is empty or is not an `https://` address, the page answers 404 and no link
leads to it.

## The act

- [ ] Get the address of the calendar from the founders.
- [ ] In Vercel, project `berceo`, Settings, Environment Variables: add
      `SLEEP_CONSULTATION_URL` for the environment `uat` and for Preview.
- [ ] Add `SLEEP_CONSULTATION_URL` for Production, before the promotion of the release that
      has JAM-305.
- [ ] Redeploy each environment.
- [ ] Open `/consultation-sommeil` on UAT. Make sure that the button opens the calendar in a
      new tab.
