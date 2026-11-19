import { notFound } from "next/navigation";

import { CoeursIcon, EnvoiIcon } from "@/components/berceo-icons";
import { ContactForm } from "@/components/contact/contact-form";
import { PageHeader } from "@/components/vitrine/page-header";
import { contact } from "@/content/contact";
import { words } from "@/content/locale";
import { CONTACT_PATH, contactEnabled } from "@/lib/contact/config";
import { sendContact } from "@/lib/contact/send";
import { pageMetadata } from "../page-metadata";

const t = words(contact);

export const metadata = pageMetadata(t.meta, CONTACT_PATH);

/* The environment's setting is read on each request, so the page follows it without a new build. */
export const dynamic = "force-dynamic";

/**
 * « Contact » (JAM-327, Jamie's answer to question 2): the DA's banner, then
 * the form in a white card of 32 px on pearl. The message goes to the address
 * of `CONTACT_EMAIL`, which the page never shows. Where the environment has
 * no address the page is not found, and no link leads to it.
 */
export default function ContactPage() {
  if (!contactEnabled()) notFound();

  return (
    <>
      <PageHeader title={t.title} intro={t.intro} ornaments={[EnvoiIcon, CoeursIcon]} />
      <div className="bg-perle px-4 py-12 md:py-20">
        <div className="mx-auto max-w-2xl rounded-carte bg-blanc px-6 py-8 md:px-10 md:py-10">
          <ContactForm action={sendContact} />
        </div>
      </div>
    </>
  );
}
