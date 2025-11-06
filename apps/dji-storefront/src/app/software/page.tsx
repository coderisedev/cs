export const metadata = {
  title: "Software · DJI Storefront",
  description: "Support tools and compatibility information for cockpit simulators",
}

const features = [
  {
    title: "Plug & Play Operation",
    description: "Connect your hardware and the software automatically detects and calibrates each panel.",
  },
  {
    title: "Automatic Connection",
    description: "Links MSFS 2024, X-Plane, and Prepar3D profiles without scripts.",
  },
  {
    title: "Hardware Testing",
    description: "Built-in diagnostics ensure every encoder, LED, and display works before flight.",
  },
  {
    title: "Wireless Firmware Updates",
    description: "Update devices over Wi-Fi with DJI’s secure signing.",
  },
]

const platforms = [
  { name: "MSFS 2024", status: "supported", description: "Full compatibility with the newest Microsoft Flight Simulator." },
  { name: "MSFS 2020", status: "supported", description: "Legacy profiles still maintained." },
  { name: "X-Plane 12", status: "supported", description: "Native support for both Intel and Apple Silicon builds." },
  { name: "Prepar3D v5", status: "supported", description: "Professional training setups validated." },
]

export default function SoftwarePage() {
  return (
    <div className="container py-16 space-y-12">
      <section className="text-center space-y-4">
        <p className="text-sm uppercase tracking-widest text-foreground-muted">Software Suite</p>
        <h1 className="text-4xl font-semibold">DJI Cockpit Companion</h1>
        <p className="max-w-3xl mx-auto text-foreground-secondary">
          Manage firmware, run diagnostics, and sync cockpit layouts across every simulator title without leaving DJI’s design system.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {features.map((feature) => (
          <div key={feature.title} className="rounded-2xl border border-border-primary bg-background-secondary p-6">
            <h3 className="text-xl font-semibold text-foreground-primary">{feature.title}</h3>
            <p className="text-sm text-foreground-secondary mt-2">{feature.description}</p>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-3xl font-semibold">Supported Platforms</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {platforms.map((platform) => (
            <div key={platform.name} className="rounded-2xl border border-border-secondary p-5">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-foreground-primary">{platform.name}</p>
                <span className="text-xs uppercase tracking-widest text-semantic-success">{platform.status}</span>
              </div>
              <p className="text-sm text-foreground-secondary mt-2">{platform.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
