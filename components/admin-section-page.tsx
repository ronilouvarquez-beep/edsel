type AdminSectionPageProps = {
  title: string
  description: string
}

export function AdminSectionPage({ title, description }: AdminSectionPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <section className="w-full max-w-2xl rounded-xl border bg-card p-8 text-card-foreground shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">
          Edsel&apos;s Cake Shop &amp; Catering Services
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 text-muted-foreground">{description}</p>
      </section>
    </main>
  )
}
