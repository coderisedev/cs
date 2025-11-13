import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Shipping & Fulfillment · Cockpit Simulator",
  description: "Learn about processing times, carriers, and international delivery for Cockpit Simulator hardware orders.",
}

const policies = [
  {
    title: "Processing & Lead Times",
    details: [
      "Standard cockpit modules ship within 3–4 business days. Custom panels, laser etching, or bundled rigs may require 10–15 business days.",
      "Orders placed after 2:00 PM Pacific or on weekends begin processing the next business day.",
      "You will receive automated tracking once the parcel leaves our fulfillment center.",
    ],
  },
  {
    title: "Carriers & Methods",
    details: [
      "Domestic U.S. shipments primarily use UPS Air or FedEx Express to protect sensitive avionics. PO boxes ship via USPS Priority.",
      "International orders route through DHL Express or FedEx International Priority with insurance.",
      "Freight shipments (multi-rack simulators) ship on custom pallets with liftgate service when requested.",
    ],
  },
  {
    title: "International Duties & Compliance",
    details: [
      "Customers are responsible for import duties, VAT/GST, and brokerage fees. Estimates are displayed at checkout where available.",
      "Certain regions require dual-use export paperwork for electronics. Our compliance team may request additional documentation before releasing the order.",
      "If customs clearance fails due to incomplete documentation, shipping charges are non-refundable.",
    ],
  },
  {
    title: "Delivery Issues & Insurance",
    details: [
      "All shipments include insurance covering the invoice value. Inspect packaging upon delivery and document any external damage.",
      "Report lost or damaged shipments to support@dji-storefront.com within 5 days so we can open a carrier investigation.",
      "Signature is required for orders over $1,000 USD to protect against porch theft.",
    ],
  },
  {
    title: "Returns & Exchanges",
    details: [
      "Contact support to obtain an RMA before shipping hardware back. Unauthorized returns may be refused.",
      "Return shipping is free for DOA hardware or warranty replacements. Change-of-mind returns may incur a restocking fee to cover calibration.",
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
          <a href="mailto:support@dji-storefront.com" className="text-primary-500 hover:underline">
            support@dji-storefront.com
          </a>{" "}
          or call +1 (555) 123‑4567 for help with expedited shipping, freight quotes, or customs paperwork.
        </p>
      </section>
    </main>
  )
}
