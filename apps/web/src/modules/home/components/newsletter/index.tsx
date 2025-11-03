"use client"

import { useState } from "react"
import { Mail } from "lucide-react"

export default function Newsletter() {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter subscription
    setSubscribed(true)
    setEmail("")
    setTimeout(() => setSubscribed(false), 3000)
  }

  return (
    <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-br from-primary to-secondary">
      <div className="mobile-container">
        <div className="max-w-2xl mx-auto text-center text-white">
          <Mail className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Stay Updated with Latest Products
          </h2>
          <p className="text-white/90 mb-6 sm:mb-8 text-sm sm:text-base px-4">
            Subscribe to our newsletter for exclusive deals, new product
            launches, and simulation tips.
          </p>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto px-4"
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-4 py-3 sm:py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-sm sm:text-base"
            />
            <button
              type="submit"
              className="px-6 py-3 sm:py-2.5 bg-white text-blue-600 hover:bg-white/90 rounded-lg font-semibold transition-colors whitespace-nowrap touch-target text-sm sm:text-base"
            >
              {subscribed ? "Subscribed!" : "Subscribe"}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
