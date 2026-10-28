import { words } from "@/content/locale";
import { professionnelle } from "@/content/professionnelle";

const { textes, anciens } = words(professionnelle).declarations;

/**
 * A declaration in the words she accepted it under: the sentence of its
 * version when that sentence changed since (`anciens`), else today's
 * (`textes`). The ledger keeps the version, so « Mon dossier » and the
 * founders' file page never show an older row in newer words.
 */
export function declarationText(declaration: string, version: string): string {
  const older: Readonly<Record<string, Readonly<Record<string, string>>>> = anciens;
  const current: Readonly<Record<string, string>> = textes;
  return older[version]?.[declaration] ?? current[declaration] ?? declaration;
}
