import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service - Our Terms and Conditions",
  description: "Read our terms of service to understand the rules and regulations governing the use of our website and services.",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-gray-50 py-20">
        <div className="container mx-auto px-4 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Terms of Service
            </h1>
            <p className="text-lg text-gray-600">
              Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-12">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-8 lg:p-12">
            <div className="prose prose-lg max-w-none">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using this website, you accept and agree to be bound by the terms and provisions
                of this agreement. If you do not agree to these terms, please do not use our services.
              </p>

              <h2>2. Use of Our Services</h2>
              <p>You agree to use our services only for lawful purposes. You must not:</p>
              <ul>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit harmful or malicious code</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt our services</li>
                <li>Engage in fraudulent activities</li>
              </ul>

              <h2>3. Account Registration</h2>
              <p>
                To access certain features, you may need to create an account. You are responsible for:
              </p>
              <ul>
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Providing accurate and current information</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>

              <h2>4. Products and Services</h2>
              <p>
                We strive to provide accurate product descriptions and pricing. However:
              </p>
              <ul>
                <li>Product images are for illustration purposes and may vary from actual products</li>
                <li>We reserve the right to correct errors in pricing or product information</li>
                <li>Product availability is subject to change without notice</li>
                <li>We may limit quantities available for purchase</li>
              </ul>

              <h2>5. Orders and Payments</h2>
              <p>
                When you place an order:
              </p>
              <ul>
                <li>You agree to pay the specified price and any applicable taxes</li>
                <li>We reserve the right to refuse or cancel orders</li>
                <li>Payment must be received before order processing</li>
                <li>All prices are subject to change without notice</li>
              </ul>

              <h2>6. Shipping and Delivery</h2>
              <p>
                We will make reasonable efforts to deliver products within the estimated timeframes.
                However, we are not responsible for delays caused by circumstances beyond our control.
              </p>

              <h2>7. Returns and Refunds</h2>
              <p>
                Our return policy allows returns within 30 days of purchase for most items. Items must be:
              </p>
              <ul>
                <li>In original condition and packaging</li>
                <li>Accompanied by proof of purchase</li>
                <li>Subject to our return policy terms</li>
              </ul>

              <h2>8. Intellectual Property</h2>
              <p>
                All content on this website, including text, graphics, logos, images, and software, is our
                property or that of our licensors and is protected by intellectual property laws.
              </p>

              <h2>9. User Content</h2>
              <p>
                If you submit content to our website (reviews, comments, etc.):
              </p>
              <ul>
                <li>You grant us a license to use, modify, and display that content</li>
                <li>You represent that you have the right to share such content</li>
                <li>We may remove content that violates these terms</li>
              </ul>

              <h2>10. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, we shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages resulting from your use of our services.
              </p>

              <h2>11. Indemnification</h2>
              <p>
                You agree to indemnify and hold us harmless from any claims, damages, or expenses arising from
                your use of our services or violation of these terms.
              </p>

              <h2>12. Modifications to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Changes will be effective immediately
                upon posting. Your continued use of our services constitutes acceptance of the modified terms.
              </p>

              <h2>13. Governing Law</h2>
              <p>
                These terms shall be governed by and construed in accordance with the laws of the State of
                California, without regard to its conflict of law provisions.
              </p>

              <h2>14. Dispute Resolution</h2>
              <p>
                Any disputes arising from these terms or our services shall be resolved through binding arbitration
                in accordance with the rules of the American Arbitration Association.
              </p>

              <h2>15. Severability</h2>
              <p>
                If any provision of these terms is found to be unenforceable, the remaining provisions shall
                continue in full force and effect.
              </p>

              <h2>16. Contact Information</h2>
              <p>
                For questions about these terms, please contact us:
              </p>
              <ul>
                <li>Email: legal@example.com</li>
                <li>Phone: +1 (555) 123-4567</li>
                <li>Address: 123 Commerce Street, Suite 100, San Francisco, CA 94105</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
