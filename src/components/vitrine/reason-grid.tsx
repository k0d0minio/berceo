import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/*
 * The reassurance arguments as white cards (the DA puts white cards on sage
 * or pearl). Each title is an H3 under the section's H2.
 *
 * From md, two columns (blocs-accueil D-17): a card is wide enough for its
 * title at the DA's H3 size, and an odd last card takes the whole row, so no
 * slot is left empty. Each card spans two rows of the grid (a subgrid), so
 * the titles of a row share a line and their texts start together, 12 px
 * under the title rather than the card's 32 px. The paragraph keeps to the
 * DA's 75 characters a line when the card runs the full row.
 */
function ReasonGrid({
  items,
  className,
}: {
  items: readonly { title: string; text: string }[]
  className?: string
}) {
  return (
    <ul className={cn("grid gap-6 md:grid-cols-2", className)}>
      {items.map((item) => (
        <li
          key={item.title}
          className="flex md:row-span-2 md:grid md:grid-rows-subgrid md:gap-y-3 md:last:odd:col-span-2"
        >
          <Card className="w-full gap-3 md:row-span-2 md:grid md:grid-rows-subgrid">
            <CardHeader>
              <h3 className="font-sans text-h3 font-bold text-balance">
                {item.title}
              </h3>
            </CardHeader>
            <CardContent>
              <p className="max-w-[60ch]">{item.text}</p>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  )
}

export { ReasonGrid }
