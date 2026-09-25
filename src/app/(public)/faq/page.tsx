import Link from "next/link";

import { PageHeader } from "@/components/vitrine/page-header";
import { VitrineSection } from "@/components/vitrine/section";
import { common } from "@/content/common";
import { faq } from "@/content/faq";
import { words } from "@/content/locale";
import { pageMetadata } from "../page-metadata";

const t = words(faq);
const c = words(common);

export const metadata = pageMetadata(t.meta, c.pages.faq.href);

/**
 * Four groups (H2), each question an H3 with its answer below it, all visible
 * (no accordion) so the page reads, and is indexed, as one text.
 */
export default function FaqPage() {
  return (
    <>
      <PageHeader title={t.title} intro={t.intro} />

      {t.groups.map((group, index) => (
        <VitrineSection
          key={group.title}
          title={group.title}
          tone={index % 2 === 0 ? "perle" : "blanc"}
        >
          <div className="grid gap-10 md:grid-cols-2">
            {group.items.map((item) => (
              <div key={item.question} className="flex flex-col gap-3">
                <h3 className="font-sans text-h3 font-bold">
                  {item.question}
                </h3>
                <div className="flex flex-col gap-3">
                  <p>{item.answer}</p>
                  {"link" in item ? (
                    <Link
                      href={
                        c.pages[item.link.page as keyof typeof c.pages].href
                      }
                      className="self-start font-semibold text-encre-sauge underline underline-offset-4"
                    >
                      {item.link.label}
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </VitrineSection>
      ))}
    </>
  );
}
