import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service · Cockpit Simulator",
  description: "Review the terms and conditions for purchasing simulator hardware from Cockpit Simulator.",
}

export default function TermsPage() {
  return (
    <main className="container mx-auto px-4 lg:px-12 py-16 space-y-10">
      <header className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">Terms of Service</h1>
        <p className="text-foreground-secondary max-w-3xl mx-auto">
          These terms describe the conditions under which Cockpit Simulator supplies flight simulation products, software licenses, and
          support services. By placing an order or using our site you agree to the clauses below.
        </p>
        <p className="text-sm text-foreground-muted">Last updated: November 13, 2025</p>
      </header>

      <section className="rounded-3xl border border-border-primary bg-background-secondary/60 p-6 md:p-8 shadow-card space-y-4">
        <h2 className="text-2xl font-semibold">1. Orders & Pricing</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground-secondary">
          <li>All prices are shown in USD unless otherwise noted. Taxes, import duties, and carrier fees are calculated at checkout.</li>
          <li>We reserve the right to refuse or cancel any order suspected of fraud or unauthorized resale.</li>
          <li>Orders are accepted once you receive an email confirmation. Production lead times may vary based on cockpit module availability.</li>
        </ul>
      </section>

      <section className="rounded-3xl border border-border-primary bg-background-secondary/60 p-6 md:p-8 shadow-card space-y-4">
        <h2 className="text-2xl font-semibold">2. License & Usage</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground-secondary">
          <li>All simulator avionics, firmware, and companion software are licensed—not sold—for personal or training use.</li>
          <li>Reverse engineering, redistribution, or using the hardware to create competing products is prohibited.</li>
          <li>Commercial training centers must maintain an active support agreement for certified use.</li>
        </ul>
      </section>

      <section className="rounded-3xl border border-border-primary bg-background-secondary/60 p-6 md:p-8 shadow-card space-y-4">
        <h2 className="text-2xl font-semibold">3. Warranty & Returns</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground-secondary">
          <li>Hardware is covered by a limited 18‑month warranty against manufacturing defects.</li>
          <li>Returns are accepted within 30 days of delivery for undamaged items; custom panels or laser-etched parts are non-refundable.</li>
          <li>Contact support@dji-storefront.com to initiate an RMA and receive a prepaid label where applicable.</li>
        </ul>
      </section>

      <section className="rounded-3xl border border-border-primary bg-background-secondary/60 p-6 md:p-8 shadow-card space-y-4">
        <h2 className="text-2xl font-semibold">4. Limitation of Liability</h2>
        <p className="text-foreground-secondary">
          Cockpit Simulator is not liable for indirect, incidental, or consequential damages arising from simulator downtime, lost missions,
          or third-party software incompatibilities. Our total liability is limited to the amount you paid for the affected product.
        </p>
      </section>

      <section className="rounded-3xl border border-border-primary bg-background-secondary/60 p-6 md:p-8 shadow-card space-y-4">
        <h2 className="text-2xl font-semibold">5. Governing Law</h2>
        <p className="text-foreground-secondary">
          These terms are governed by the laws of the State of California, USA. Disputes will be resolved in the courts located in Santa
          Clara County, California.
        </p>
      </section>

      <section className="rounded-3xl border border-border-primary bg-background-secondary/60 p-6 md:p-8 shadow-card space-y-4">
        <h2 className="text-2xl font-semibold">Contact</h2>
        <p className="text-foreground-secondary">
          For questions about these terms, email{" "}
          <a href="mailto:legal@dji-storefront.com" className="text-primary-500 hover:underline">
            legal@dji-storefront.com
          </a>{" "}
          or mail Cockpit Simulator Legal, 123 Flight Deck Blvd, San Jose, CA 95134.
        </p>
      </section>
    </main>
  )
}
