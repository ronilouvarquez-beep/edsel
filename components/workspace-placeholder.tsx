import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function WorkspacePlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <main className="flex flex-1 flex-col bg-muted/20 p-4 md:p-6 lg:p-8">
      <Card className="mx-auto w-full max-w-3xl bg-background">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </main>
  )
}
