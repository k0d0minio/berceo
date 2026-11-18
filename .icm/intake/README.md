# Intake

This file has the decisions and the epics of the build. Since 2026-11-18 the pipeline is the
BAXTER blueprint (`.icm/_system/ROUTER.md`), and a ticket is a Linear key of the team `JAM`.
The rules for this folder are in `.icm/_system/rules/ticket.md`. The markdown stubs of the epics
and of `triage/` are the backlog of before that date: `.icm/local/ROUTES.md` says how one
becomes a ticket.

- `tickets/<KEY>.md`: one stub for each ticket in work.
- `_done/<KEY>.md`: the stub after the merge.

## Order`, the decisions of record that bind the epics, the milestones. Jamie sets `## Order`,
the order of the epics (`CONTEXT.md`, The order of the epics).

## Order

Set by Jamie on 2026-10-29, for the markdown backlog.

1. triage
2. annulations-credits

## The backlog on 2026-10-23

The founders' feedback round 1 (Drive, `feedback-round-1.pdf`, 2026-10-23) replaced the open
backlog whole. The epics it opened:

- `abonnements-familles`: the four family subscriptions of the devis.
- `onboarding-retour-1`: the professional's file, the charter, the 130 € floor.
- `demande-retour-1`: the request's address, extra hours, children, feeding, regular nights.
- `vitrine-retour-1`: the words the founders asked for on the public site.

Decisions of record that bind them: a feedback request supersedes an earlier requirement, except
the insurance wording, which stays out until a contract exists (D-8, Jamie 2026-10-23). The
milestones: a soft launch in mid-December 2026, the public push in January 2027.

## The backlog on 2026-10-29

The UAT review of 2026-10-29 (a family, a professional and a founder walked uat.berceo.be
against feedback round 1, the devis and the answers) found every feedback item built. It opened
six triage stubs and, on Jamie's word, three epics the devis sells and no round had cut:

- `comptes-2fa`: a second factor at sign-in for professionals and founders.
- `annulations-credits`: the founders' cancellation table and the Berceo credits.
- `favoris`: a family keeps her favourite professionals and re-books.

Decisions of record (Jamie, 2026-10-29): D-8 is superseded for the fee sentence on `/tarifs`,
which names the insurance as the founders wrote it (`triage/tarifs-frais-assurance`). The phone
verification by SMS and the « type de professionnelle recherchée » on the request wait for a
later round. The students switch is on in UAT.
