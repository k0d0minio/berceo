
## Test site — comment on JAM-583

PR: https://github.com/k0d0minio/berceo/pull/146 (CI green). Preview: https://berceo-git-contact-jam-583-berceo-showhide-con-4ea591-kodominio.vercel.app

How each AC is met:
- AC-1: `Field` renders each `type="password"` field as the new `PasswordInput`. It has a button « Afficher » / « Masquer » that toggles the text visible and hidden. This covers sign-in (/connexion), both sign-ups (/inscription-famille, /inscription-professionnelle: password and confirmation) and the new password page (/nouveau-mot-de-passe: both fields). The site has no other password field.
- AC-2: The control is a `<button type="button">`, so it does not submit the form. Its screen-reader name is « Afficher le mot de passe » or « Masquer le mot de passe ». The name changes with the state. The visible text is at the start of the name.
- AC-3: The state starts hidden. The input renders as `type="password"` on load. `src/components/auth/password-input.test.ts` holds AC-2 and AC-3.

To test: open /connexion on the preview and type a password. The text is hidden. Press « Afficher »: the text shows and the button says « Masquer ».

The four new strings carry `@relecture` for Surya. Gate Ready to merge waits for Jamie.
- filed: https://linear.app/jamienisbet/issue/JAM-583/berceo-showhide-control-on-password-fields#comment-d4f6743b
