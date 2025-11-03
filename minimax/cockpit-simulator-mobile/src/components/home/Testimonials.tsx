import { Star } from 'lucide-react'
import { Card } from '../ui/card'

const testimonials = [
  {
    id: 1,
    author: 'Captain James Anderson',
    role: 'Real A320 Pilot',
    content: 'As a commercial pilot, I use these panels for home practice. The accuracy and build quality are exceptional. Highly recommended for serious sim pilots.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
  },
  {
    id: 2,
    author: 'Michael Chen',
    role: 'Flight Sim Enthusiast',
    content: 'The 737 MCP transformed my simulator setup. The precision and feel of the controls are amazing. Worth every penny!',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
  },
  {
    id: 3,
    author: 'Sarah Thompson',
    role: 'Virtual Airline Pilot',
    content: 'Best investment for my home cockpit. The customer support is excellent, and the products are professional grade.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
  },
]

export function Testimonials() {
  return (
    <section className="py-16 md:py-24 bg-background-primary">
      <div className="container mx-auto px-4 lg:px-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground-primary transition-colors duration-300">What Our Customers Say</h2>
          <p className="text-foreground-secondary max-w-2xl mx-auto transition-colors duration-300">
            Trusted by pilots and sim enthusiasts worldwide
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="p-6 bg-background-secondary border-0 shadow-card">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-semantic-warning text-semantic-warning" />
                ))}
              </div>
              <p className="text-foreground-secondary mb-4 transition-colors duration-300">{testimonial.content}</p>
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.image}
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-foreground-primary transition-colors duration-300">{testimonial.author}</p>
                  <p className="text-sm text-foreground-muted transition-colors duration-300">{testimonial.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
