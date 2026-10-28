import { charte } from "@/content/charte"
import { words } from "@/content/locale"

type Heading = "h1" | "h2" | "h3" | "h4"

/** The id of the charter's title inside the declarations form, which names its card. */
const CHARTER_TITLE_ID = "charte-titre"

/*
 * « Charte des professionnelles Berceo » in full, from src/content/charte.ts:
 * « Notre engagement », the 17 numbered sections and « L'engagement Berceo ».
 * `level` is the rank of its title: 1 on `/charte-des-professionnelles`, 2
 * inside step 4 and the page of the new declarations, under the page's own
 * title. Every heading below follows from it.
 */
function Charte({ level, id }: { level: 1 | 2; id?: string }) {
  const t = words(charte)
  const Title = `h${level}` as Heading
  const Section = `h${level + 1}` as Heading
  const Value = `h${level + 2}` as Heading

  return (
    <div className="flex flex-col gap-8 text-corps text-encre-taupe">
      <Title id={id} className={`font-display ${level === 1 ? "text-h1" : "text-h2"} text-balance text-encre-sauge`}>
        {t.title}
      </Title>

      <section className="flex flex-col gap-3">
        <Section className="font-display text-h3 text-encre-sauge">{t.intro.title}</Section>
        {t.intro.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>

      {t.sections.map((section, i) => {
        // Some sections have no list, or nothing after it: the catalogue holds those as empty.
        const liste: readonly string[] = section.liste
        const apres: readonly string[] = section.apres
        return (
          <section key={section.title} className="flex flex-col gap-3">
            <Section className="font-display text-h3 text-encre-sauge">
              {i + 1}. {section.title}
            </Section>
            {section.avant.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {liste.length > 0 ? (
              <ul className="flex list-disc flex-col gap-1 pl-6">
                {liste.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
            {apres.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        )
      })}

      <section className="flex flex-col gap-3">
        <Section className="font-display text-h3 text-encre-sauge">{t.engagement.title}</Section>
        {t.engagement.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        {t.engagement.valeurs.map((value) => (
          <div key={value.name} className="flex flex-col gap-1">
            <Value className="font-display text-h3 text-encre-sauge">{value.name}</Value>
            <p>{value.text}</p>
          </div>
        ))}
        <p>{t.engagement.closing}</p>
      </section>
    </div>
  )
}

export { CHARTER_TITLE_ID, Charte }
