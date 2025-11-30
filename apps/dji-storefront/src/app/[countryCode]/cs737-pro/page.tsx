import { Hero } from "@/components/products/cs737-pro/Hero"
import { ProductOverview } from "@/components/products/cs737-pro/ProductOverview"
import { FeatureSection } from "@/components/products/cs737-pro/FeatureSection"
import { MotorShowcase } from "@/components/products/cs737-pro/MotorShowcase"
import { TechSpecs } from "@/components/products/cs737-pro/TechSpecs"
import { WarrantyCTA } from "@/components/products/cs737-pro/WarrantyCTA"
import { StickyNav } from "@/components/products/cs737-pro/StickyNav"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "CS737 Full-Function Throttle Quadrant | Cockpit Simulator",
    description: "Real feel. Born for flight. All-metal construction, 9-motor system, 10-year warranty. Experience the most authentic 737 throttle control.",
}

export default function CS737ProPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            <StickyNav />

            <main>
                {/* Hero Section */}
                <Hero />

                {/* Product Overview - darkest */}
                <ProductOverview />

                {/* Design & Materials - slightly lighter */}
                <FeatureSection
                    id="design"
                    eyebrow="Design & Materials"
                    title="All-metal body. Backlit panels that breathe."
                    description="The main structure is machined from all-metal, delivering weight, rigidity, and tactile feel close to the real aircraft. Panel scales feature backlighting that syncs with your simulation software — dim during night flights, bright for takeoff and landing. Every push and pull is clearly visible."
                    quote="Scales you can see. Aircraft you can feel."
                    imageSrc="https://images.unsplash.com/photo-1535525153412-5a42439a210d?q=80&w=2670&auto=format&fit=crop"
                    imageAlt="CS737 All-Metal Body"
                    align="left"
                    theme="darker"
                    features={[
                        "Aviation-grade aluminum body",
                        "Adjustable LED backlight",
                        "Software-synced brightness",
                        "Real panel scales",
                    ]}
                />

                {/* Motor System - dark with grid */}
                <MotorShowcase />

                {/* Throttle Levers - darkest */}
                <FeatureSection
                    id="throttle"
                    eyebrow="Throttle Levers"
                    title="Auto-follow. Manual override anytime."
                    description="Left and right thrust levers have fully independent signal channels for individual engine control — perfect for practicing single-engine takeoffs and approaches. The levers sync in real-time with autothrottle in your sim. When autothrottle engages, the physical levers follow automatically. Built-in mechanical clutch lets you override and take manual control at any moment."
                    quote="Real aircraft logic. Right habits from the start."
                    imageSrc="https://images.unsplash.com/photo-1520699697851-3dc68aa3a474?q=80&w=2574&auto=format&fit=crop"
                    imageAlt="CS737 Throttle Levers"
                    align="right"
                    theme="dark"
                    features={[
                        "Independent L/R signal channels",
                        "Real-time autothrottle sync",
                        "Mechanical clutch override",
                        "Reverse thrust interlock",
                        "Dual A/T DISENGAGE buttons",
                        "TO/GA buttons",
                    ]}
                />

                {/* Speed Brake System - slightly lighter */}
                <FeatureSection
                    id="speedbrake"
                    eyebrow="Speed Brake System"
                    title="Auto-deploy. Auto-stow. Just like landing for real."
                    description="The speed brake lever supports 'auto-deploy on arm' — when your simulator detects touchdown, the lever automatically pops up from the armed position, deploying the speed brakes in sync with reverse thrust. Push the thrust levers forward, and the speed brake auto-stows, replicating the real 'retract speed brake' procedure."
                    quote="You fly. The throttle handles the rest."
                    imageSrc="https://images.unsplash.com/photo-1483304528321-0674f0040030?q=80&w=2670&auto=format&fit=crop"
                    imageAlt="CS737 Speed Brake System"
                    align="left"
                    theme="darker"
                    features={[
                        "Auto-deploy on arm",
                        "Reverse thrust sync",
                        "Auto-stow function",
                        "FLIGHT detent lock",
                    ]}
                />

                {/* Trim & Flaps - light section for contrast */}
                <FeatureSection
                    id="trim"
                    eyebrow="Trim & Flaps"
                    title="Motorized trim wheel. Every notch has weight."
                    description="The trim wheel is motor-driven, fully synced with the trim state in your simulator. Customizable rotation speed and stop position lock let you fine-tune to your preferred rhythm. The foldable handle opens for manual trim — just like pulling out the real aircraft's trim wheel. The flap lever provides 9 clear detents with restriction gates at positions 1 and 15."
                    quote="Trim and flaps aren't abstract numbers — they're mechanical clicks you can feel."
                    imageSrc="https://img.aidenlux.com/1101_08385063cf.jpg"
                    imageAlt="CS737 Trim and Flaps"
                    align="center"
                    theme="light"
                    features={[
                        "Motor-driven trim wheel",
                        "Customizable rotation speed",
                        "Foldable manual handle",
                        "Backlit trim indicators",
                        "9-position flap lever",
                        "1/15 position restriction gates",
                    ]}
                />

                {/* Start & Parking Brake - darkest */}
                <FeatureSection
                    id="start"
                    eyebrow="Start & Parking Brake"
                    title="Real procedures. From ignition to parking."
                    description="CS737 offers two different fuel cutoff lever and parking brake configurations — NG and MAX styles — with identical functionality. Choose based on your preference. The parking brake features a mechanical locking mechanism: you can only lift the lever when brake input is detected, and it auto-unlocks when brake input is applied again. Complete replication of real aircraft parking logic."
                    quote="From throttle up to parking brake set — every step teaches you to think like a pilot."
                    imageSrc="https://images.unsplash.com/photo-1580674684081-7617fbf3d745?q=80&w=2574&auto=format&fit=crop"
                    imageAlt="CS737 Start and Parking Brake"
                    align="right"
                    theme="dark"
                    features={[
                        "737NG / 737MAX dual configs",
                        "Mechanical parking brake lock",
                        "Engine start levers",
                        "Pull-then-move operation",
                    ]}
                />

                {/* Sim Pedestal (Optional) - slightly lighter */}
                <FeatureSection
                    id="base"
                    eyebrow="Sim Pedestal (Optional)"
                    title="A complete center console. Your throttle's new home."
                    description="For those building a full simulator cockpit, the optional sim pedestal adds left/right storage compartments, cup holders, and a complete overheat and fire panel — upgrading from a single device to a full center console system. The fire panel features full operational replication: overheat detector switches with detents, fire bell cutout, extinguisher test switches, and more."
                    quote="Not just 'having a throttle' — bringing the entire 737 center console home."
                    imageSrc="https://img.aidenlux.com/1106_13f5c9737d.jpg"
                    imageAlt="CS737 Sim Pedestal"
                    align="center"
                    theme="darker"
                    features={[
                        "Left/right storage compartments",
                        "Cup holders",
                        "Overheat & fire panel",
                        "Fire handle system",
                        "8 self-test indicator lights",
                        "Full controllable backlight",
                    ]}
                />

                {/* Tech Specs */}
                <TechSpecs />

                {/* Warranty & CTA */}
                <div id="buy">
                    <WarrantyCTA />
                </div>
            </main>
        </div>
    )
}
