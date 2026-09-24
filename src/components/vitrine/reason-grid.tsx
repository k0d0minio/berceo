import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/*
 * The reassurance arguments as white cards (the DA puts white cards on sage
 * or pearl). Each title is an H3 under the section's H2.
 */
function ReasonGrid({
  items,
  className,
}: {
  items: readonly { title: string; text: string }[]
  className?: string
}) {
  return (
    <ul className={cn("grid gap-6 md:grid-cols-2 lg:grid-cols-3", className)}>
      {items.map((item) => (
        <li key={item.title} className="flex">
          <Card className="w-full">
            <CardHeader>
              <h3 className="font-sans text-h3 font-bold">{item.title}</h3>
            </CardHeader>
            <CardContent>
              <p>{item.text}</p>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  )
}

export { ReasonGrid }
