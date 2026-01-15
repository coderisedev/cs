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
    description: "Real feel. Born for flight. All-metal construction, 9-motor system, 2-year warranty. Experience the most authentic 737 throttle control.",
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
                    title="Aircraft aluminum. Cockpit glow."
                    description="Machined from aircraft aluminum. Pick it up — feel the weight of a real 737. Backlight dims automatically for night flights."
                    quote="Scales you can see. Aircraft you can feel."
                    imageSrc="https://img.aidenlux.com/cs737-pro/part2.png"
                    imageAlt="CS737 All-Metal Body"
                    align="left"
                    theme="darker"
                    features={[
                        "Machined from aircraft aluminum",
                        "Backlight that dims with the night sky",
                        "Software-synced brightness",
                        "1:1 panel scales",
                    ]}
                />

                {/* Motor System - dark with grid */}
                <MotorShowcase />

                {/* Throttle Levers - darkest */}
                <FeatureSection
                    id="throttle"
                    eyebrow="Throttle Levers"
                    title="Autothrottle moves it. You take over when you want."
                    description="Independent left and right engines. Real-time sync with your sim. Mechanical clutch for instant manual override."
                    quote="Train like you fly. Fly like you trained."
                    imageSrc="https://img.aidenlux.com/cs737-pro/part4.png"
                    imageAlt="CS737 Throttle Levers"
                    align="right"
                    theme="dark"
                    features={[
                        "Independent L/R engines",
                        "Real-time autothrottle sync",
                        "Mechanical clutch override",
                        "Reverse thrust interlock",
                        "A/T DISENGAGE buttons",
                        "TO/GA buttons",
                    ]}
                />

                {/* Speed Brake System - slightly lighter */}
                <FeatureSection
                    id="speedbrake"
                    eyebrow="Speed Brake System"
                    title="Touchdown. Speed brake deploys."
                    description="Auto-deploy on arm. Auto-stow when you advance thrust. Just like the real 737."
                    quote="You fly. The throttle handles the rest."
                    imageSrc="https://img.aidenlux.com/cs737-pro/part5.png"
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
                    title="Feel every click. From 0 to 40."
                    description="Motor-driven trim wheel. 9-position flaps with restriction gates. Every detent you feel is one more step closer to the real thing."
                    quote="40 degrees. You felt every one."
                    imageSrc="https://img.aidenlux.com/cs737-pro/part6.png"
                    imageAlt="CS737 Trim and Flaps"
                    align="center"
                    theme="light"
                    features={[
                        "Motor-driven trim wheel",
                        "Foldable manual handle",
                        "Backlit trim indicators",
                        "9-position flap lever",
                        "1/15 restriction gates",
                    ]}
                />

                {/* Start & Parking Brake - darkest */}
                <FeatureSection
                    id="start"
                    eyebrow="Start & Parking Brake"
                    title="From ignition to parking. Real procedures."
                    description="NG or MAX configurations. Mechanical parking brake with real locking logic. Every step builds the right habits."
                    quote="Think like a pilot. Because you're training like one."
                    imageSrc="https://img.aidenlux.com/cs737-pro/part7.png"
                    imageAlt="CS737 Start and Parking Brake"
                    align="right"
                    theme="dark"
                    features={[
                        "737NG / 737MAX configs",
                        "Mechanical parking brake lock",
                        "Engine start levers",
                        "Pull-then-move operation",
                    ]}
                />

                {/* Sim Pedestal (Optional) - slightly lighter */}
                <FeatureSection
                    id="base"
                    eyebrow="Sim Pedestal (Optional)"
                    title="The complete center console. Home."
                    description="Storage. Cup holders. Full overheat and fire panel. From a throttle to a cockpit."
                    quote="The entire 737 center console. Now yours."
                    imageSrc="https://img.aidenlux.com/cs737-pro/part8.png"
                    imageAlt="CS737 Sim Pedestal"
                    align="center"
                    theme="darker"
                    features={[
                        "Storage compartments",
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
