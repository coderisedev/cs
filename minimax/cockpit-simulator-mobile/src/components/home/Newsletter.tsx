import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Mail } from 'lucide-react'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter subscription
    setSubscribed(true)
    setEmail('')
    setTimeout(() => setSubscribed(false), 3000)
  }

  return (
    <section className="py-16 md:py-24 bg-background-secondary">
      <div className="container mx-auto px-4 lg:px-12">
        <div className="max-w-2xl mx-auto text-center">
          <Mail className="h-12 w-12 mx-auto mb-4 text-primary-400" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground-primary transition-colors duration-300">
            Stay Updated with Latest Products
          </h2>
          <p className="text-foreground-secondary mb-8 transition-colors duration-300">
            Subscribe to our newsletter for exclusive deals, new product launches, and simulation tips.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background-elevated border-border-primary text-foreground-primary placeholder:text-foreground-muted focus:border-primary-500 focus:ring-primary-500 transition-colors duration-300"
            />
            <Button
              type="submit"
              variant="default"
              className="whitespace-nowrap"
              disabled={subscribed}
            >
              {subscribed ? 'Subscribed!' : 'Subscribe'}
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
