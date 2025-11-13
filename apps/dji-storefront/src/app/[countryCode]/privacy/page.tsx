import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy · Cockpit Simulator",
  description: "Learn how Cockpit Simulator collects, uses, and protects your personal data.",
}

const sections = [
  {
    title: "1. Information We Collect",
    items: [
      "Account details such as your name, email, billing/shipping addresses, and phone number when you purchase cockpit hardware or create an account.",
      "Payment information processed securely by our payment gateways (we never store full card numbers).",
      "Device and usage data including IP address, browser type, and interactions with our storefront to improve performance and detect fraud.",
      "Support communications like emails, chat logs, or phone call summaries when you contact our flight hardware specialists.",
    ],
  },
  {
    title: "2. How We Use Your Data",
    items: [
      "Fulfill orders for simulator hardware, process payments, and provide shipping updates.",
      "Configure regional availability, taxes, and regulatory paperwork for international deliveries.",
      "Send product releases, firmware updates, and simulator compatibility alerts when you opt into marketing communications.",
      "Diagnose issues, prevent fraudulent transactions, and comply with aviation-electronics export regulations.",
    ],
  },
  {
    title: "3. Sharing & Disclosure",
    items: [
      "Trusted logistics partners (e.g., FedEx, DHL) receive shipment details to deliver your panels and avionics kits.",
      "Payment processors and tax authorities receive the minimum information required to complete your transaction.",
      "We never sell your personal data. We disclose information only if required by law or to defend our legal rights.",
    ],
  },
  {
    title: "4. Cookies & Tracking",
    items: [
      "Essential cookies keep you signed in, persist shopping carts, and secure the checkout flow.",
      "Analytics cookies help us understand how pilots browse the catalog so we can improve the site.",
      "You can manage cookie preferences through your browser settings or by contacting support for assistance.",
    ],
  },
  {
    title: "5. Data Retention & Rights",
    items: [
      "We keep order records for as long as required by finance and warranty regulations.",
      "You can request access, correction, deletion, or export of your personal data by emailing privacy@dji-storefront.com.",
      "EU/UK residents have GDPR rights, including the right to lodge a complaint with a supervisory authority.",
    ],
  },
]

export default function PrivacyPage() {
  return (
    <main className="container mx-auto px-4 lg:px-12 py-16 space-y-10">
      <header className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">Privacy Policy</h1>
        <p className="text-foreground-secondary max-w-3xl mx-auto">
          Cockpit Simulator builds flight simulation hardware for professionals and enthusiasts. Protecting your personal data is essential
          to earning your trust. This policy explains what we collect, how we use it, and the choices you have.
        </p>
        <p className="text-sm text-foreground-muted">Effective date: November 13, 2025</p>
      </header>

      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.title} className="rounded-3xl border border-border-primary bg-background-secondary/60 p-6 md:p-8 shadow-card">
            <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
            <ul className="list-disc pl-6 space-y-2 text-foreground-secondary">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="rounded-3xl border border-border-primary bg-background-secondary/60 p-6 md:p-8 shadow-card">
        <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
        <p className="text-foreground-secondary">
          Questions about privacy? Email{" "}
          <a href="mailto:privacy@dji-storefront.com" className="text-primary-500 hover:underline">
            privacy@dji-storefront.com
          </a>{" "}
          or write to Cockpit Simulator Privacy Team, 123 Flight Deck Blvd, San Jose, CA 95134.
        </p>
      </section>
    </main>
  )
}
