import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Shipping & Fulfillment · Cockpit Simulator",
  description: "Learn about processing times, carriers, and international delivery for Cockpit Simulator hardware orders.",
}

const policies = [
  {
    title: "Processing & Lead Times",
    details: [
      "Standard cockpit modules ship within 10–15 business days.",
      "Orders placed after 5:39 PM China Standard Time (CST, UTC+8) or on weekends will be shipped on the second business day.",
      "Tracking information will be provided to you as soon as our carrier supplies the tracking number.",
    ],
  },
  {
    title: "Carriers & Methods",
    details: [
      "Domestic U.S. shipments: Use UPS Air to protect sensitive avionics.",
      "International orders: Route through DHL Express or FedEx International Priority with insurance.",
    ],
  },
  {
    title: "International Duties & Compliance",
    details: [
      "Customers are responsible for import duties, VAT/GST, and brokerage fees. The specific amount payable shall be subject to the notification (email/SMS) from the courier company.",
    ],
  },
  {
    title: "Delivery Issues & Insurance",
    details: [
      "Inspect packaging upon delivery and document any external damage.",
      "Report lost or damaged shipments to info@cockpit-simulator.com within 5 days so we can open a carrier investigation.",
    ],
  },
  {
    title: "Returns & Exchanges",
    details: [
      "For after-sales support (including returns/exchanges), please contact us directly via email at info@cockpit-simulator.com. Unauthorized returns may be refused.",
      "Customers are responsible for return shipping costs, except for DOA (Dead On Arrival) hardware—return shipping is free in such cases.",
      "Refunds are issued once the hardware passes inspection (typically within 5 business days of receipt).",
    ],
  },
]

export default function ShippingPage() {
  return (
    <main className="container mx-auto px-4 lg:px-12 py-16 space-y-10">
      <header className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">Shipping & Fulfillment</h1>
        <p className="text-foreground-secondary max-w-3xl mx-auto">
          We treat every shipment like sensitive aircraft instrumentation. Review the policies below to understand timelines, carriers, and
          support options for cockpit hardware deliveries.
        </p>
      </header>

      <div className="space-y-8">
        {policies.map((policy) => (
          <section key={policy.title} className="rounded-3xl border border-border-primary bg-background-secondary/60 p-6 md:p-8 shadow-card">
            <h2 className="text-2xl font-semibold mb-4">{policy.title}</h2>
            <ul className="list-disc pl-6 space-y-2 text-foreground-secondary">
              {policy.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="rounded-3xl border border-border-primary bg-background-secondary/60 p-6 md:p-8 shadow-card">
        <h2 className="text-2xl font-semibold mb-4">Need Assistance?</h2>
        <p className="text-foreground-secondary">
          Email{" "}
          <a href="mailto:info@cockpit-simulator.com" className="text-primary-500 hover:underline">
            info@cockpit-simulator.com
          </a>{" "}
          for help with expedited shipping or customs paperwork.
        </p>
      </section>
    </main>
  )
}
