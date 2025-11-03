import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubscribed(true)
    setEmail('')
    setTimeout(() => setSubscribed(false), 3000)
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary to-secondary">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center text-white">
          <Mail className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stay Updated with Latest Products
          </h2>
          <p className="text-white/90 mb-8">
            Subscribe to our newsletter for exclusive deals, new product launches, and simulation tips.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
            />
            <Button
              type="submit"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90 whitespace-nowrap"
            >
              {subscribed ? 'Subscribed!' : 'Subscribe'}
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
