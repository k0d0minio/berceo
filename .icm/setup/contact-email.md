# Setup — the address of the contact form

Language: en

This file belongs to the repo. It is one act that a person does in Vercel. A session reads
the boxes and does not tick them.

The page `/contact` sends each message to the address of the environment variable
`CONTACT_EMAIL` (JAM-327). The value is never in git. Where the variable is empty, the page
answers 404 and no link leads to it.

## The act

- [ ] In Vercel, project `berceo`, Settings, Environment Variables: add `CONTACT_EMAIL` for
      the environment `uat` and for Preview. The value is the address that receives the
      messages.
- [ ] Add `CONTACT_EMAIL` for Production, before the promotion of the release that has
      JAM-327.
- [ ] Redeploy each environment. The header reads the variable at build.
- [ ] Open `/contact` on UAT. Send one message. Make sure that it arrives, and that a reply
      goes to the writer's address.

## Notes

- `RESEND_API_KEY` and `EMAIL_FROM` must have a value in the same environment. The form uses
  them to send.
- The page does not limit how many messages one visitor sends. If spam arrives, clear the
  variable: the page then does not exist.
