# Stub: The request's calendar opens on the first night a family can pick

- lane: tweak
- found-by: the UAT review of 2026-10-29 · 2026-10-29
- complexity: low
- priority: P2

## Problem

On 29 October, « Publier une demande » opens its calendar on October with thirty disabled days
above the one night of the window, 31 October. On the last two days of a month, the first night
is in the next month, and the calendar opens on a month with no night to pick. The regular-nights
calendar does the same.

## Proposed change

Open the calendar on the month of the first selectable night and give that night the focus, for
the one-off request, the regular nights and the urgent request. The edit page opens on the month
of the request's night.

## Acceptance criteria

- [ ] On the last two days of a month, the calendar opens on the next month.
- [ ] In the month of the first selectable night, the weeks that end before that night do not show.
- [ ] The first selectable night holds the calendar's tab stop. The page moves no focus on load.
- [ ] The edit page opens on the month of the request's night, also when the night is before today's window.
- [ ] The windows of D-60 and `seriesWindow` do not change.
