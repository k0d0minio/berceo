import type { ReactNode } from "react";

import { Callout, Stat, StatRow, Term, Terms } from "@/components/proposal/blocks";
import { Section } from "@/components/proposal/section";
import { Badge } from "@/components/ui/badge";
import { proposal, sections, type SectionId } from "@/content/proposal";

/**
 * The proposal. One page, one column, ordered by `sections` in
 * `src/content/proposal.ts` — each entry renders its body from `content` below.
 */

const content: Record<SectionId, ReactNode> = {
  summary: (
    <>
      <p>
        Je suis ingénieur full-stack senior et consultant IA. Mon métier :
        transformer des contraintes métier réelles en systèmes en production, en
        partant de zéro — architecture, développement, mise en ligne,
        exploitation. C’est exactement la nature de Berceo aujourd’hui : un
        cahier des charges ambitieux, aucune ligne de code, et des décisions
        structurantes encore ouvertes.
      </p>
      <p>
        Ce dont vous avez besoin n’est pas un exécutant qui code le document tel
        quel, mais un lead engineer qui arbitre avec vous : plusieurs choix de
        votre cahier des charges déterminent directement le budget, le
        calendrier et la conformité légale de la plateforme. Je propose donc de
        commencer par un sprint de cadrage court et facturé, qui tranche ces
        points, fige le périmètre de la V1 et débouche sur un devis ferme. Vous
        savez ainsi exactement ce que vous achetez avant d’engager le budget de
        développement.
      </p>
      <StatRow>
        <Stat
          label="Taux horaire"
          value="120 €"
          note="HTVA — structure aménageable (commission, participation…)"
        />
        <Stat
          label="Sprint de cadrage"
          value="5 jours"
          note="Forfait 4 800 € HTVA, devis V1 ferme à la clé"
        />
        <Stat label="Rythme" value="2–3 j/sem" note="À distance, points réguliers" />
        <Stat label="Démarrage" value="< 2 sem." note="Après accord sur le cadrage" />
      </StatRow>
    </>
  ),

  understanding: (
    <>
      <p>
        Berceo met en relation des familles et des professionnelles de la garde
        de nuit pour nouveau-nés, en Belgique francophone : profils vérifiés,
        demande de garde, messagerie intégrée, frais de service et abonnements —
        le règlement de la garde elle-même se faisant directement entre famille
        et professionnelle.
      </p>
      <p>
        Le cœur de la valeur n’est pas la mise en relation, c’est la confiance :
        confier son nouveau-né, la nuit, à une personne rencontrée via une
        plateforme. La vérification d’identité et de qualifications n’est donc
        pas une fonctionnalité parmi d’autres — c’est le produit. Le reste
        (recherche, réservation, messagerie, paiement) est de la mécanique de
        place de marché que je maîtrise.
      </p>
      <p>
        J’ai analysé votre cahier des charges en détail, annotations comprises.
        Il est riche, mais plusieurs choix encore ouverts — flux de paiement,
        dispositif de vérification, visibilité des profils, grille tarifaire des
        abonnements — ont des conséquences directes sur l’architecture, le
        modèle de revenus et les obligations légales de la plateforme. Ils
        doivent être tranchés avant d’écrire la première ligne de code : c’est
        précisément l’objet du sprint de cadrage.
      </p>
    </>
  ),

  scope: (
    <>
      <p>
        Tout construire d’un coup est la façon la plus sûre de dépasser le
        budget avant d’avoir un seul utilisateur. Je recommande une V1 resserrée
        qui met la plateforme sur le marché rapidement et teste l’hypothèse
        centrale — des familles paient pour réserver des professionnelles
        vérifiées — puis des itérations courtes guidées par l’usage réel.
      </p>
      <h3>Socle probable de la V1</h3>
      <ul>
        <li>Comptes et rôles : famille, professionnelle, administration.</li>
        <li>
          Profils et vérification : identité, diplômes et attestations, avec un
          circuit de validation manuelle outillé.
        </li>
        <li>Demandes de garde et mise en relation, cycle de vie complet.</li>
        <li>Messagerie interne cadrée par la demande de garde.</li>
        <li>Paiement des frais de service et logique d’annulation (Stripe).</li>
        <li>Évaluations mutuelles.</li>
        <li>
          Back-office d’administration — l’outil dans lequel vous vivrez au
          quotidien : vérifications, modération, suivi. Non négociable en V1.
        </li>
        <li>Site vitrine et pages publiques.</li>
      </ul>
      <p>
        Le reste — second mode de mise en relation, abonnements et cartes
        cadeaux, automatisation de la revue documentaire, et la feuille de route
        (application native, garde de jour, expansion) — se phase en V1.1 et
        au-delà. La répartition exacte V1 / V1.1 est un livrable du sprint de
        cadrage, pas une opinion a priori.
      </p>
    </>
  ),

  approach: (
    <>
      <p>
        Une stack éprouvée et sobre : Next.js, PostgreSQL managé, hébergement en
        Europe, RGPD dès la conception (minimisation des données, rétention,
        droit à l’effacement). Pas de zoo technologique — un socle qu’un
        ingénieur seul fait avancer vite et qu’une équipe pourra reprendre sans
        archéologie. L’isolation des rôles (famille / professionnelle / admin)
        est imposée au niveau de la base de données, pas seulement dans le code.
      </p>
      <p>
        Les intégrations externes — vérification d’identité, paiement,
        cartographie — sont les vrais risques du planning : certaines imposent
        des démarches contractuelles avec des délais propres, indépendants du
        développement. Je les traite en premier, avec des solutions de repli
        chiffrées, pour qu’aucun tiers ne bloque votre lancement.
      </p>
      <p>
        Côté IA, deux apports concrets : une revue assistée des documents
        (diplômes, attestations, identité) qui rend votre validation manuelle
        rapide et cohérente — l’IA assiste, vous décidez — et mon propre outillage
        de développement assisté par IA, qui est une partie de ce qui rend un
        ingénieur seul compétitif face à une agence.
      </p>
    </>
  ),

  timeline: (
    <>
      <Terms>
        <Term label="Phase 0 — Cadrage">
          5 jours, répartis sur environ deux semaines. Ateliers avec vous,
          arbitrage des points ouverts, architecture cible, backlog V1 priorisé.
          Livrables : document de cadrage et devis ferme pour la V1.
        </Term>
        <Term label="Phase 1 — Construction V1">
          Développement itératif avec démonstration à chaque cycle : vous voyez
          le produit avancer semaine après semaine, sur un environnement de
          test. Durée et montant fixés à l’issue de la phase 0.
        </Term>
        <Term label="Phase 2 — Lancement & itérations">
          Mise en production, corrections, mesures d’usage, puis V1.1 priorisée
          sur ce que les premiers utilisateurs révèlent.
        </Term>
      </Terms>
      <p>
        Rythme : 2 à 3 jours par semaine, à distance, avec des points réguliers
        en visio. Dès le cadrage, je vous signale les démarches tierces à lancer
        en parallèle pour qu’elles n’allongent pas le calendrier.
      </p>
    </>
  ),

  commercials: (
    <>
      <Terms>
        <Term label="Taux horaire">
          120 € HTVA. Ce taux est ma base actuelle ; il peut être aménagé selon
          le montage retenu — commission sur l’activité, participation au
          capital, forfaits par phase ou retainer mensuel. J’en discute
          volontiers.
        </Term>
        <Term label="Sprint de cadrage">
          Forfait de 4 800 € HTVA (5 jours). Le document de cadrage vous
          appartient, quelle que soit la suite.
        </Term>
        <Term label="Facturation">
          Mensuelle, avec relevé détaillé des heures.
        </Term>
        <Term label="Engagement">
          Chaque phase est engagée séparément : vous décidez de continuer — ou
          non — à la fin de chacune.
        </Term>
        <Term label="Propriété">
          Code, infrastructure et livrables vous appartiennent intégralement
          une fois les factures réglées.
        </Term>
        <Term label="Modalités">
          À distance depuis le Portugal (même fuseau de travail), déplacements
          ponctuels en Belgique possibles.
        </Term>
      </Terms>
    </>
  ),

  risks: (
    <>
      <p>
        Poser ces questions maintenant coûte cinq jours de cadrage ; les
        découvrir en cours de développement coûte des mois. Voici les
        principales — leur analyse détaillée est le contenu du sprint :
      </p>
      <ol>
        <li>
          <strong>Flux de paiement.</strong> Le règlement de la garde hors
          plateforme a des implications fiscales, légales et business majeures.
          Quel flux exactement, et validé par qui ?
        </li>
        <li>
          <strong>Vérification d’identité.</strong> L’intégration d’itsme
          suppose un cadre contractuel et des délais propres. Qui pilote cette
          démarche, et quelle solution de repli ?
        </li>
        <li>
          <strong>Profils : visibilité ou exclusivité ?</strong> Deux objectifs
          du cahier des charges sont incompatibles en l’état — référencement
          public des profils et accès réservé aux abonnés. Un arbitrage
          s’impose.
        </li>
        <li>
          <strong>Tarification.</strong> Abonnements et cartes cadeaux sans
          grille tarifaire ne peuvent être ni construits ni budgétés.
        </li>
        <li>
          <strong>Cadre réglementaire.</strong> La garde de nouveau-nés à
          domicile et le statut des professionnelles touchent plusieurs
          réglementations belges et européennes. Un avis juridique est
          indispensable avant lancement — je vous préparerai les questions
          précises à poser à votre conseil.
        </li>
        <li>
          <strong>Modes de mise en relation.</strong> Le cahier des charges en
          décrit deux ; construire les deux en V1 double le coût du cœur du
          produit. Lequel d’abord ?
        </li>
      </ol>
      <Callout title="Si vous savez déjà répondre à ces six questions">
        <p>
          Tant mieux — le cadrage n’en sera que plus court. Sinon, c’est
          exactement ce que nous réglerons ensemble en phase 0.
        </p>
      </Callout>
    </>
  ),

  "next-steps": (
    <>
      <ol>
        <li>Un appel de 30 à 45 minutes pour valider la démarche et répondre à vos questions.</li>
        <li>Sprint de cadrage — démarrage possible sous deux semaines.</li>
        <li>Devis ferme pour la V1, puis lancement du développement.</li>
      </ol>
      <p>
        Un e-mail suffit pour enclencher la suite :{" "}
        <a href={`mailto:${proposal.author.email}`}>{proposal.author.email}</a>.
      </p>
    </>
  ),
};

export default function Home() {
  return (
    <main id="top" className="mx-auto max-w-3xl px-6 pb-24">
      <header className="py-16 sm:py-24">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{proposal.client}</Badge>
          {proposal.version ? (
            <Badge variant="outline">{proposal.version}</Badge>
          ) : null}
          {proposal.date ? (
            <span className="text-sm text-muted-foreground">
              {proposal.date}
            </span>
          ) : null}
        </div>

        <h1 className="mt-6 font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {proposal.title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground text-pretty">
          {proposal.standfirst || proposal.subtitle}
        </p>

        <p className="mt-8 text-sm text-muted-foreground">
          {proposal.author.name} · {proposal.author.role} ·{" "}
          {proposal.author.location}
        </p>
      </header>

      {sections.map((section) => (
        <Section key={section.id} {...section}>
          {content[section.id]}
        </Section>
      ))}
    </main>
  );
}
