import { Button } from "@/components/ui/button"

const HERO_IMAGE = "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=80"

export function LandingHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-background-secondary">
      <div className="absolute inset-0">
        <div
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
      </div>
      <div className="relative z-10 px-6 py-16 sm:px-12 lg:px-20 text-white">
        <div className="max-w-2xl space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest">
            Professional Flight Simulator Hardware
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            Build your
            <span className="block text-gradient">Dream Cockpit</span>
          </h1>
          <p className="text-base sm:text-lg text-white/85">
            Authentic aviation control panels designed with DJI’s design system. Plug-and-play hardware compatible with MSFS 2024, X-Plane, and Prepar3D.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="btn-primary text-white">
              Browse Products
            </Button>
            <Button variant="outline" size="lg" className="text-white border-white hover:bg-white/10">
              Explore Collections
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
