import { Metadata } from "next"
import { Mail, MapPin, Phone, Users, Target, Award } from "lucide-react"

export const metadata: Metadata = {
  title: "About Us - Learn About Our Company",
  description: "Learn about our mission, values, and commitment to delivering exceptional e-commerce solutions powered by Medusa and Next.js.",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-gray-50 py-20">
        <div className="container mx-auto px-4 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              About Us
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed">
              We&apos;re on a mission to revolutionize e-commerce with cutting-edge technology
              and exceptional user experiences.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 mb-16">
              <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
                <p className="text-gray-600 leading-relaxed">
                  To empower businesses with modern, scalable e-commerce solutions that combine
                  the power of Medusa&apos;s headless commerce engine with Next.js performance and
                  flexibility. We believe in creating shopping experiences that delight customers
                  and drive business growth.
                </p>
              </div>

              <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
                <p className="text-gray-600 leading-relaxed">
                  To become the leading provider of next-generation e-commerce platforms,
                  setting new standards for performance, scalability, and user experience.
                  We envision a future where every business, regardless of size, can compete
                  with enterprise-level shopping experiences.
                </p>
              </div>
            </div>

            {/* Our Story */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Founded in 2024, we started with a simple observation: traditional e-commerce
                  platforms were becoming increasingly complex and inflexible. Merchants needed
                  a solution that could grow with their business while providing the speed and
                  performance modern customers expect.
                </p>
                <p>
                  By combining Medusa&apos;s powerful headless commerce engine with Next.js&apos;s
                  cutting-edge frontend capabilities, we created a platform that delivers
                  lightning-fast performance, infinite customization, and seamless scalability.
                </p>
                <p>
                  Today, we serve businesses of all sizes, from startups to enterprise brands,
                  helping them build exceptional online shopping experiences that convert visitors
                  into loyal customers.
                </p>
              </div>
            </div>

            {/* Values */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Values</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Customer First</h3>
                  <p className="text-gray-600">
                    Every decision we make starts with understanding and serving our customers&apos; needs.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Innovation</h3>
                  <p className="text-gray-600">
                    We continuously push boundaries to deliver cutting-edge solutions.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Excellence</h3>
                  <p className="text-gray-600">
                    We&apos;re committed to delivering quality in everything we do.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-12 text-white mb-16">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">2024</div>
                  <div className="text-blue-100">Founded</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">100+</div>
                  <div className="text-blue-100">Active Stores</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">99.9%</div>
                  <div className="text-blue-100">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">24/7</div>
                  <div className="text-blue-100">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Get In Touch</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Email Us</h3>
                <a href="mailto:hello@example.com" className="text-blue-600 hover:text-blue-700">
                  hello@example.com
                </a>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Call Us</h3>
                <a href="tel:+15551234567" className="text-blue-600 hover:text-blue-700">
                  +1 (555) 123-4567
                </a>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Visit Us</h3>
                <p className="text-gray-600">
                  123 Commerce St<br />
                  San Francisco, CA 94105
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
