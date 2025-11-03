"use client"

import { Star } from "lucide-react"

const testimonials = [
  {
    id: 1,
    author: "Captain James Anderson",
    role: "Real A320 Pilot",
    content:
      "As a commercial pilot, I use these panels for home practice. The accuracy and build quality are exceptional. Highly recommended for serious sim pilots.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
  },
  {
    id: 2,
    author: "Michael Chen",
    role: "Flight Sim Enthusiast",
    content:
      "The 737 MCP transformed my simulator setup. The precision and feel of the controls are amazing. Worth every penny!",
    rating: 5,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
  },
  {
    id: 3,
    author: "Sarah Thompson",
    role: "Virtual Airline Pilot",
    content:
      "Best investment for my home cockpit. The customer support is excellent, and the products are professional grade.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
  },
]

export default function Testimonials() {
  return (
    <section className="py-12 sm:py-16 md:py-24">
      <div className="mobile-container">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base px-4">
            Trusted by customers worldwide
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex gap-1 mb-3 sm:mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-500 text-yellow-500"
                  />
                ))}
              </div>
              <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
                {testimonial.content}
              </p>
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.image}
                  alt={testimonial.author}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-sm sm:text-base">
                    {testimonial.author}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
