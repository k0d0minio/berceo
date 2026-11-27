# Setup — the request button

A client asks for a change from the app itself: the button opens a form, and the request
goes to the store of this repo with a capture of the page (`.icm/_system/features/requests.md`).

## The code: one import, one route (a session can do this part)
The root layout (`app/layout.tsx` or `src/app/layout.tsx`) gets one import and one element
in `<body>`. Use the relative path from the layout to `.icm/` (`../.icm` from `app/`,
`../../.icm` from `src/app/`):

```tsx
import { RequestButton } from "../../.icm/_system/request-button/RequestButton";
// in <body>, after {children}:
<RequestButton />
```

The form has the language of this repo: `language` of `.icm/project.json` (fr).
Give `lang` (`en`, `fr` or `pt`) only for a site in a different language.

The route is one new file, `app/api/baxter-request/route.ts` (or below `src/`):

```ts
export { POST } from "../../../../.icm/_system/request-button/route";
```

No other code file changes. The prop `user` (`signedIn`, `role`, `id`) adds the user to the
capture when the layout knows the user. The id leaves the server only as a hash.

## The look: CSS variables (a session can do this part)
The button and its form read CSS variables of the app. Each one has a neutral fallback:
with no variable, the button is black and white. Set them in `:root` of the global style
sheet, with the tokens of the design system:

```css
:root {
  --baxter-accent: /* the button, the selected chip */;
  --baxter-accent-text: /* the text on the accent */;
  --baxter-surface: /* the panel */;
  --baxter-text: /* the text */;
  --baxter-muted: /* the notes */;
  --baxter-border: /* the fields and the chips */;
  --baxter-font: /* the text font */;
  --baxter-heading-font: /* the title font */;
  --baxter-radius: /* the panel corners */;
}
```

More variables, optional: `--baxter-chip`, `--baxter-chip-text`, `--baxter-control-radius`
(default capsule), `--baxter-field-radius`, `--baxter-heading-transform`,
`--baxter-heading-color`, `--baxter-overlay`, `--baxter-shadow`, `--baxter-launcher-shadow`,
`--baxter-focus`, `--baxter-status`. Set the two shadows to `none` for a design with no
shadow.

## The env values (the operator)
Set these in Vercel for the UAT environment. A local dev server shows the button with no
value.

- [ ] `BAXTER_REQUEST_ENV` = `uat` on UAT. Not set on production: the button does not show.
      Production only with `production` and `BAXTER_REQUEST_PRODUCTION` = `on`.
- [ ] `BAXTER_REQUEST_LINEAR_API_KEY`: a Linear API key of the client's workspace that can
      create issues and labels in the team `requests.linear_team` of `.icm/project.json`.
- Optional: `BAXTER_REQUEST_LINEAR_TEAM` (a team key), `BAXTER_REQUEST_LINEAR_PROJECT` (a
  project name, slug or id of that team, or `none`) and `BAXTER_REQUEST_LINEAR_LABELS`
  (label names, with commas). They replace `requests.linear_team`, `linear_project` and
  `linear_label` of `.icm/project.json` for this deployment. An unknown team or project
  stops the request with an error.

Each value is a secret of the deployment. Never put one in the code or in this repo.
