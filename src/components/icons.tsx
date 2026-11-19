import type { Icon, IconProps } from "@phosphor-icons/react"
import {
  CaretDown,
  CaretLeft,
  CaretRight,
  CaretUp,
  Check,
  CurrencyEur,
  FileText,
  Heart,
  List,
  ShieldCheck,
  User,
  X,
} from "@phosphor-icons/react/ssr"

/*
 * The platform's icons (DA, Iconographie; JAM-300): filled, simple and
 * rounded, never thin or angular. Every icon comes from Phosphor in its fill
 * weight, through this one file, so no other weight can creep in. The size
 * comes from the caller's `size-*` class at the DA's steps: 20–24 px in
 * fields and navigation, 24–32 in cards, 40–56 for services. The colour is
 * `currentColor`.
 */
function filled(Glyph: Icon) {
  function FilledIcon(props: Omit<IconProps, "weight">) {
    return <Glyph size={24} {...props} weight="fill" />
  }
  FilledIcon.displayName = `${Glyph.displayName ?? "Icon"}Fill`
  return FilledIcon
}

export const CaretDownIcon = filled(CaretDown)
export const CaretLeftIcon = filled(CaretLeft)
export const CaretRightIcon = filled(CaretRight)
export const CaretUpIcon = filled(CaretUp)
export const CheckIcon = filled(Check)
export const EuroIcon = filled(CurrencyEur)
export const FileTextIcon = filled(FileText)
export const HeartIcon = filled(Heart)
export const MenuIcon = filled(List)
export const ShieldCheckIcon = filled(ShieldCheck)
export const UserIcon = filled(User)
export const XIcon = filled(X)
