import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Warranty & Returns · Cockpit Simulator",
  description: "Learn about our warranty coverage, return policy, and after-sales service for Cockpit Simulator products.",
}

export default function TermsPage() {
  return (
    <main className="container mx-auto px-4 lg:px-12 py-16 space-y-10">
      <header className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">Warranty & Returns</h1>
        <p className="text-foreground-secondary max-w-3xl mx-auto">
          Learn about our warranty coverage, return policy, and after-sales service procedures for Cockpit Simulator products.
        </p>
        <p className="text-sm text-foreground-muted">Last updated: November 13, 2025</p>
      </header>

      <section className="rounded-3xl border border-border-primary bg-background-secondary/60 p-6 md:p-8 shadow-card space-y-4">
        <h2 className="text-2xl font-semibold">1. Warranty Period</h2>
        <div className="space-y-4 text-foreground-secondary">
          <p>
            This product is covered by a two-year warranty starting from the actual date of purchase by the customer.
          </p>
          <p>
            The warranty period shall be determined based on a valid proof of purchase provided by the customer (such as an invoice, order record), using the purchase date shown on the document.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-border-primary bg-background-secondary/60 p-6 md:p-8 shadow-card space-y-4">
        <h2 className="text-2xl font-semibold">2. Warranty Coverage</h2>
        <div className="space-y-4 text-foreground-secondary">
          <p>
            During the warranty period, after-sales service will be provided if the product experiences any of the following issues under normal use:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Performance failure or quality issues caused by non-human factors;</li>
            <li>Issues that are confirmed by our after-sales inspection to be inherent product quality defects.</li>
          </ul>
          <p>The following situations are not covered by the warranty:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Damage caused by human factors, including but not limited to dropping, water damage, unauthorized disassembly, modification, or alteration;</li>
            <li>Malfunctions caused by improper use or failure to follow the product user manual;</li>
            <li>Damage caused by force majeure events, such as fire, lightning, floods, or other natural disasters;</li>
            <li>Products that have exceeded the warranty period;</li>
            <li>Cases where valid proof of purchase cannot be provided or the purchase information cannot be verified.</li>
          </ul>
        </div>
      </section>

      <section className="rounded-3xl border border-border-primary bg-background-secondary/60 p-6 md:p-8 shadow-card space-y-4">
        <h2 className="text-2xl font-semibold">3. After-Sales Service Method</h2>
        <div className="space-y-4 text-foreground-secondary">
          <ul className="list-disc pl-6 space-y-1">
            <li>For products that meet the warranty conditions within the warranty period, replacement service will be provided in principle;</li>
            <li>The replacement product will be of the same model. If the original model is discontinued or out of stock, a replacement with equal or higher performance will be provided.</li>
          </ul>
        </div>
      </section>

      <section className="rounded-3xl border border-border-primary bg-background-secondary/60 p-6 md:p-8 shadow-card space-y-4">
        <h2 className="text-2xl font-semibold">4. After-Sales Service Procedure (Important)</h2>
        <div className="space-y-4 text-foreground-secondary">
          <p>
            To ensure fairness and standardization of after-sales service, the replacement process is as follows and is effective immediately:
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground-primary">4.1 After-Sales Request</h3>
              <p>Customers must contact our official after-sales email and provide the following information:</p>
              <ul className="list-disc pl-6 space-y-1 mt-1">
                <li>Description of the product issue;</li>
                <li>Valid proof of purchase (invoice, order record, etc.);</li>
                <li>Contact information and delivery address (including full name, phone number, and email address).</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground-primary">4.2 Return of the Defective Product</h3>
              <p>
                Customers must return the defective product to the address designated by our company according to the after-sales instructions;
              </p>
              <p>If the defective product is not returned, the company will no longer provide advance replacement service.</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground-primary">4.3 Product Inspection</h3>
              <p>Upon receipt of the returned product, our company will conduct inspection and verification.</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground-primary">4.4 Replacement Shipment</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>If the inspection confirms that the issue falls within the warranty coverage, a new replacement product will be shipped after the inspection is completed;</li>
                <li>If the product does not meet the warranty conditions, the customer will be contacted to discuss further solutions, such as paid repair or replacement.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-border-primary bg-background-secondary/60 p-6 md:p-8 shadow-card space-y-4">
        <h2 className="text-2xl font-semibold">5. Shipping Cost Policy</h2>
        <div className="space-y-4 text-foreground-secondary">
          <ul className="list-disc pl-6 space-y-1">
            <li>Return shipping of the defective product: In principle, the cost shall be borne by the customer;</li>
            <li>Shipping of the replacement product: The cost shall be borne by our company.</li>
          </ul>
        </div>
      </section>

      <section className="rounded-3xl border border-border-primary bg-background-secondary/60 p-6 md:p-8 shadow-card space-y-4">
        <h2 className="text-2xl font-semibold">6. Customs Duties and Taxes Policy</h2>
        <div className="space-y-4 text-foreground-secondary">
          <ul className="list-disc pl-6 space-y-1">
            <li>Customs duties and taxes for returning the defective product: Any customs duties, import taxes, or related charges incurred when returning the defective product shall be borne by our company.</li>
            <li>Customs duties and taxes for shipping the replacement product: Any customs duties, import taxes, or related charges incurred when shipping the replacement product shall be borne by the customer.</li>
          </ul>
        </div>
      </section>

      <section className="rounded-3xl border border-border-primary bg-background-secondary/60 p-6 md:p-8 shadow-card space-y-4">
        <h2 className="text-2xl font-semibold">7. Contact</h2>
        <div className="space-y-4 text-foreground-secondary">
          <p>
            To submit a Warranty claim, contact CS Technical Support (&quot;CS Support&quot;) via email at{" "}
            <a href="mailto:info@cockpit-simulator.com" className="text-primary-500 hover:underline">
              info@cockpit-simulator.com
            </a>.
          </p>
        </div>
      </section>
    </main>
  )
}
