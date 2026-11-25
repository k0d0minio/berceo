import type { Metadata } from "next";

import { signUp } from "@/app/(auth)/actions";
import { AuthPage } from "@/components/auth/auth-page";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { abonnements } from "@/content/abonnements";
import { comptes } from "@/content/comptes";
import { fill, words } from "@/content/locale";
import { monthlyLine, planWords } from "@/lib/abonnements/format";
import { NIGHT_PASS_CHOICE, PLANS } from "@/lib/abonnements/rules";
import { redirectIfSignedIn } from "@/lib/auth/guard";
import { safeReturnPath, SIGN_IN_PATH, withReturn } from "@/lib/auth/routing";

const t = words(comptes);
const a = words(abonnements);

/**
 * The one-night plan, then the four plans of the devis, in the order of
 * `/tarifs` (JAM-581), as the form's radio cards. A subscription of more than
 * one month shows its price per month.
 */
const plans = {
  choices: [
    {
      value: NIGHT_PASS_CHOICE,
      name: a.uneNuit.name,
      duree: fill(a.espace.duree, { duree: a.uneNuit.duree }),
      prix: a.uneNuit.prix,
      parMois: null,
    },
    ...PLANS.map((plan) => {
      const { name, duree, prix } = planWords(plan);
      return { value: plan, name, duree: fill(a.espace.duree, { duree }), prix, parMois: monthlyLine(plan) };
    }),
  ],
  legende: a.inscription.legende,
  lignes: [a.inscription.donne, a.inscription.suite],
};

export const metadata: Metadata = {
  title: t.meta.inscriptionFamille.title,
  description: t.meta.inscriptionFamille.description,
};

export const dynamic = "force-dynamic";

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/*
 * Family sign-up (B-01): the guide's message and hook sentence, then the form,
 * which opens on the one-night plan and the four plans: no account without one
 * (abonnements-inscription-famille). The plan is paid after the e-mail
 * confirmation, on Stripe's Checkout.
 * The URL can carry a way back (`retour`, only a path inside a space): a
 * signed-in visitor goes there at once, and a new family gets there after
 * confirming her e-mail in this browser (D-129).
 */
export default async function InscriptionFamillePage({ searchParams }: PageProps<"/inscription-famille">) {
  const retour = safeReturnPath(first((await searchParams).retour));
  await redirectIfSignedIn(retour);

  return (
    <AuthPage
      title={t.inscription.famille.title}
      intro={[t.inscription.message, t.inscription.famille.accroche]}
    >
      <SignUpForm
        action={signUp.bind(null, "parent", retour)}
        signInHref={withReturn(SIGN_IN_PATH, retour)}
        plans={plans}
      />
    </AuthPage>
  );
}
