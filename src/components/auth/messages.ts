import type { FormMessage } from "@/app/(auth)/actions"
import { comptes } from "@/content/comptes"
import { words } from "@/content/locale"
import type { FieldError } from "@/lib/auth/validation"

/* The words behind the keys the actions and the validation return. */

const t = words(comptes)

export function fieldError(error: FieldError | undefined): string | undefined {
  return error ? t.erreurs[error] : undefined
}

export function formMessage(message: FormMessage | undefined): string | undefined {
  switch (message) {
    case undefined:
      return undefined
    case "renvoye":
      return t.connexion.renvoye
    case "confirmation":
      return t.motDePasseOublie.confirmation
    case "codeRenvoye":
      return t.code.renvoye
    case "codeAttendre":
      return t.code.attendre
    case "codeEnvoiEchoue":
      return t.code.envoiEchoue
    case "codeIncorrect":
      return t.code.incorrect
    case "codeEpuise":
      return t.code.epuise
    case "codeExpire":
      return t.code.expire
    case "codeInvalide":
      return t.code.invalide
    default:
      return t.erreurs[message]
  }
}
