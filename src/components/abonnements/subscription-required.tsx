import Link from "next/link"

import { abonnements } from "@/content/abonnements"
import { words } from "@/content/locale"
import { SUBSCRIPTION_PATH } from "@/lib/abonnements/paths"
import { cn } from "@/lib/utils"

/*
 * The one line that takes the place of an action a family without a
 * subscription cannot do (abonnements-acces), with the link to « Votre
 * abonnement ». The page decides where it goes, from `familyMay`.
 */

const t = words(abonnements).requis

function SubscriptionRequired({ className }: { className?: string }) {
  return (
    <p className={cn("max-w-2xl text-corps text-encre-taupe", className)}>
      {t.texte}{" "}
      <Link href={SUBSCRIPTION_PATH} className="font-semibold text-encre-sauge underline underline-offset-4">
        {t.lien}
      </Link>
    </p>
  )
}

export { SubscriptionRequired }
