import { mockMedusaClient } from "@cs/medusa-client"
import { cockpitPages } from "@/data/cockpit-pages"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

export default async function Home() {
  const [region, cart, products] = await Promise.all([
    mockMedusaClient.getDefaultRegion(),
    mockMedusaClient.retrieveCart(),
    mockMedusaClient.listProductSummaries(3),
  ])

  const summaryCards = [
    {
      label: "Default region",
      title: region.name,
      description: `Currency: ${region.currency_code.toUpperCase()}`,
      items: [
        `Countries mocked locally: ${region.countries.join(", ")}`,
        "Single-region architecture mirrors Shopify-style deployments",
      ],
    },
    {
      label: "Cart snapshot",
      title: `${cart.items.length} items`,
      description: `Subtotal: ${currency.format(cart.subtotal)}`,
      items: [
        `Region bound to ${region.id}`,
        "Data served via mock Medusa client",
      ],
    },
    {
      label: "Product samples",
      title: `${products.length} mocks`,
      description: "Previewing cockpit simulator catalogue data",
      items: products.map((product) => `${product.title} · ${currency.format(product.price)}`),
    },
  ]

  return (
    <div className="bg-background-primary text-foreground-primary min-h-screen">
      <div className="container py-16 space-y-12">
        <section className="space-y-4">
          <p className="text-sm uppercase tracking-widest text-foreground-muted">Environment</p>
          <div className="grid gap-6 md:grid-cols-3">
            {summaryCards.map((card) => (
              <Card key={card.label} className="border-border-primary bg-background-secondary">
                <CardHeader>
                  <p className="text-sm text-foreground-muted">{card.label}</p>
                  <CardTitle className="text-2xl font-semibold">{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-foreground-secondary">
                    {card.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex flex-wrap gap-4">
            <Button variant="default">Mock checkout flow</Button>
            <Button variant="outline" asChild>
              <a href="http://localhost:6006" target="_blank" rel="noreferrer">
                Open Storybook
              </a>
            </Button>
          </div>
        </section>

        <section className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-widest text-foreground-muted">Cockpit coverage</p>
            <h2 className="text-3xl font-semibold">Pages to rebuild</h2>
            <p className="text-foreground-secondary text-base">
              These are the MVP targets carried over from the cockpit simulator mobile experience. Every route will be
              restyled with DJI tokens and powered by the mock Medusa client until a real backend is available.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {cockpitPages.map((page) => (
              <div
                key={page.route}
                className="rounded-2xl border border-border-primary bg-background-secondary/70 p-5 shadow-sm card-hover"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-widest text-foreground-muted">{page.route}</p>
                    <h3 className="text-xl font-semibold text-foreground-primary">{page.title}</h3>
                  </div>
                  <span className="rounded-full bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary-600">
                    {page.sections.length} sections
                  </span>
                </div>
                <p className="mt-3 text-sm text-foreground-secondary">{page.description}</p>
                <ul className="mt-4 flex flex-wrap gap-2 text-xs text-foreground-muted">
                  {page.sections.map((section) => (
                    <li key={section} className="rounded-full border border-border-secondary px-3 py-1">
                      {section}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
