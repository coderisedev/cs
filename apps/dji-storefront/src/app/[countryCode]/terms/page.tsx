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
        <div className="space-y-4 text-foreground-secondary">
          <div>
            <h3 className="font-semibold text-foreground-primary">3.1 Warranty Period</h3>
            <p>All products are covered by a 2-year warranty from the date of delivery.</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground-primary">3.2 Warranty Coverage</h3>
            <p>
              If any quality issue is identified with the product within 30 days after delivery and signing, we will offer
              a replacement or full refund upon verification. Returns due to non-quality-related issues are not accepted.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground-primary">3.3 After-Sales Service Methods</h3>
            <p>We provide remote technical support and repair/replacement services for products under warranty.</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground-primary">3.4 After-Sales Service Process</h3>
            <p>
              Submit a support request via email, describing the issue and attaching photos or videos if possible. Our
              technical team will respond within 24 hours and provide a solution.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground-primary">3.5 Shipping Policy</h3>
            <p>
              For warranty repairs or replacements, customers are responsible for shipping the product to us. We will
              cover the return shipping cost.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground-primary">3.6 Customs Duties Policy</h3>
            <p>
              Customs duties incurred during shipping are the responsibility of the customer. We are not liable for any
              customs fees.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground-primary">3.7 Warranty Methods</h3>
            <p>
              Depending on the issue, we will provide one of the following: repair, replacement parts, full product
              replacement, or refund.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-border-primary bg-background-secondary/60 p-6 md:p-8 shadow-card space-y-4">
        <h2 className="text-2xl font-semibold">4. Limitation of Liability</h2>
        <p className="text-foreground-secondary">
          Cockpit Simulator is not liable for indirect, incidental, or consequential damages arising from simulator downtime, lost missions,
          or third-party software incompatibilities. Our total liability is limited to the amount you paid for the affected product.
        </p>
      </section>

      <section className="rounded-3xl border border-border-primary bg-background-secondary/60 p-6 md:p-8 shadow-card space-y-4">
        <h2 className="text-2xl font-semibold">5. Contact</h2>
        <p className="text-foreground-secondary">
          For questions about these terms, email{" "}
          <a href="mailto:info@cockpit-simulator.com" className="text-primary-500 hover:underline">
            info@cockpit-simulator.com
          </a>
          .
        </p>
      </section>
    </main>
  )
}
