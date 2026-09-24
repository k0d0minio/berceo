import type { ReactNode } from "react";

import { PublicFooter } from "@/components/shell/public-footer";
import { PublicHeader } from "@/components/shell/public-header";

/*
 * The account pages (sign-up, sign-in, the password reset, e-mail
 * verification) sit in the public frame: the header, the page, the footer.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
