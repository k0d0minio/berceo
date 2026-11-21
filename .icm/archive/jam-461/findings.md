# Findings jam-461

1. Les catalogues hors vitrine ont encore une espace sécable entre un nombre et « € » ou « % » : `professionnelle.ts` (130 €, 1 €), `paiement.ts` (3 %), `gardes.ts` (3 %), `emails.ts` (3 %), `design-system.ts` (les parts en %). Le test de JAM-461 couvre seulement la vitrine. Proposition : un ticket tweak qui applique la même règle à tout `src/content/`.
2. La page `/inscription-famille` ne s'affiche pas en local sans les variables d'authentification (HTTP 500). Ses prix viennent de `planWords`, donc du catalogue corrigé.
