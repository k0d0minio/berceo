# Findings jam-327

Faits vus pendant le Build, hors du ticket. Jamie les trie.

1. **Le formulaire de contact n'a pas de limite d'envoi.** Un champ piège écarte les robots simples. Un visiteur peut envoyer beaucoup de messages. Proposition : un ticket pour une limite par adresse IP.
2. **« Toutes diplômées » peut être faux.** Les textes du deck gardent « diplômées » (réponse à Q6). La plateforme admet des étudiantes sages-femmes, et la carte de la diapositive 25 en montre une. Proposition : demander à Surya et aux fondatrices une formulation vraie.
3. **Retirer un justificatif n'a pas de confirmation** (`src/components/professionnelle/file-slot.tsx`). La spec dit « toute confirmation » suit la diapositive 22. Aucune confirmation n'a été ajoutée : ce serait un changement de comportement.
4. **Les boutons secondaires gardent la variante `raye`** (contour taupe sur blanc) dans les trois espaces. Le deck réserve ce traitement au motif rayé. Une décision pour tous les espaces est nécessaire.
5. **`SeriesEntry` (espace professionnelle)** montre « en priorité » et le tarif en lignes simples, pas en marque jaune ni en ligne à icône comme `RequestCard`.
6. **La banque d'images n'a que quatre photos.** Les photos des diapositives 20 et 29 (mains qui tiennent des pieds, mère et bébé) n'y sont pas. Le site utilise `mains-pieds` et `ours-berceau` à leur place.
7. **Le deck n'a pas d'icône de menu.** Le bouton de menu mobile garde l'icône Phosphor.
