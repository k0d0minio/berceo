import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { signInCode } from "@/app/(auth)/actions";
import { AuthPage } from "@/components/auth/auth-page";
import { SignInCodeForm } from "@/components/auth/sign-in-code-form";
import { comptes } from "@/content/comptes";
import { fill, words } from "@/content/locale";
import { currentUser } from "@/lib/auth/current-user";
import { landingFor, safeReturnPath, SIGN_IN_PATH } from "@/lib/auth/routing";
import { sendSignInCode } from "@/lib/auth/second-factor-send";
import { hasLiveCode } from "@/lib/auth/second-factor-store";

const t = words(comptes);

export const metadata: Metadata = {
  title: t.meta.code,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/*
 * The code a professional or a founder types after her password (comptes-2fa).
 * Sign-in sends the code and lands here; the guard sends here a session that
 * owes one (an open session at the merge, a device past its 30 days). When no
 * code is live on arrival, one leaves now, inside the 60-second rule. A
 * visitor who owes no code goes where she belongs.
 */
export default async function CodePage({ searchParams }: PageProps<"/connexion/code">) {
  const params = await searchParams;
  const retour = safeReturnPath(first(params.retour));

  const who = await currentUser();
  if (who.status === "ok") redirect(landingFor(who.user.role, retour));
  if (who.status !== "needs-code") redirect(SIGN_IN_PATH);

  let notice = first(params.envoi) === "echec" ? t.code.envoiEchoue : undefined;
  if (!(await hasLiveCode(who.user.id))) {
    const sent = await sendSignInCode(who.user);
    if (sent === "failed") notice = t.code.envoiEchoue;
    if (sent === "too-soon") notice = t.code.attendre;
  }

  return (
    <AuthPage title={t.code.title} intro={[fill(t.code.intro, { email: who.user.email }), t.code.pourquoi]}>
      <SignInCodeForm action={signInCode.bind(null, retour)} notice={notice} />
    </AuthPage>
  );
}
