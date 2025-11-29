import { Hero } from "@/components/products/cs737/Hero"
import { FeatureSection } from "@/components/products/cs737/FeatureSection"
import { TechSpecs } from "@/components/products/cs737/TechSpecs"
import { StickyNav } from "@/components/products/cs737/StickyNav"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "CS737 Throttle Console | Cockpit Simulator",
    description: "Real feel, born for flight. The ultimate 737 throttle console for home flight simulation.",
}

export default function CS737Page() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary-500/30">
            <StickyNav />

            <main>
                <Hero />

                <FeatureSection
                    title="Design & Material"
                    subtitle="Metal body. Breathing light."
                    description="The main structure is machined from all-metal, with weight, rigidity, and touch close to the real aircraft. The panel scale is equipped with backlighting, supporting synchronized brightness adjustment in the simulation software."
                    quote="Visible scales, tangible aircraft."
                    imageSrc="https://images.unsplash.com/photo-1535525153412-5a42439a210d?q=80&w=2670&auto=format&fit=crop" // Unsplash Metal Texture
                    imageAlt="CS737 Metal Body"
                    align="left"
                    theme="dark"
                />

                <FeatureSection
                    title="Motor System"
                    subtitle="4 Brushless + 5 Stepper. Fully motorized."
                    description="Equipped with 4 high-power efficient brushless motors and 5 stepper motors, driving the thrust levers, speed brake, trim wheel, and trim indicator respectively. All movements are synchronized with the simulation software in real-time."
                    quote="Not just seeing the change, but holding it in your hand."
                    imageSrc="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=2670&auto=format&fit=crop" // Unsplash Motor/Gears
                    imageAlt="CS737 Motor System"
                    align="right"
                    theme="dark"
                />

                <FeatureSection
                    title="Throttle Levers"
                    subtitle="Auto-move. Manual override."
                    description="Independent signal channels for left and right thrust levers. Real-time linkage with auto-throttle in simulation. Built-in mechanical clutch allows you to manually override the thrust at any time."
                    quote="Real logic, right habits from the start."
                    imageSrc="https://images.unsplash.com/photo-1520699697851-3dc68aa3a474?q=80&w=2574&auto=format&fit=crop" // Unsplash Cockpit Controls
                    imageAlt="CS737 Throttle Levers"
                    align="left"
                    theme="dark"
                />

                <FeatureSection
                    title="Speed Brake"
                    subtitle="Auto-deploy. Auto-stow."
                    description="Supports 'Auto-deploy on Arm'. When the simulation detects landing, the handle pops up from the armed position. Automatically stows when thrust is advanced. Includes FLIGHT detent lock."
                    quote="You fly, the throttle handles the rest."
                    imageSrc="https://images.unsplash.com/photo-1483304528321-0674f0040030?q=80&w=2670&auto=format&fit=crop" // Unsplash Wing/Spoiler
                    imageAlt="CS737 Speed Brake"
                    align="right"
                    theme="dark"
                />

                <FeatureSection
                    title="Trim & Flaps"
                    subtitle="Motorized Trim Wheel. Weighted feel."
                    description="Motor-driven trim wheel synchronized with simulation. Foldable handle for manual operation. Flap handle provides 9 clear detents with restrictions at 1 and 15 positions."
                    quote="Trim and flaps are no longer abstract numbers."
                    imageSrc="https://images.unsplash.com/photo-1525266383472-872f641a84f6?q=80&w=2670&auto=format&fit=crop" // Unsplash Cockpit Detail
                    imageAlt="CS737 Trim and Flaps"
                    align="center"
                    theme="light"
                />

                <FeatureSection
                    title="Start & Parking Brake"
                    subtitle="Real procedures. From ignition to parking."
                    description="Two styles of fuel levers (NG/MAX). Parking brake with mechanical locking mechanism. Engine start levers require pull-out-then-move action."
                    quote="Every step teaches you to think like a pilot."
                    imageSrc="https://images.unsplash.com/photo-1580674684081-7617fbf3d745?q=80&w=2574&auto=format&fit=crop" // Unsplash Switches
                    imageAlt="CS737 Start Levers"
                    align="center"
                    theme="dark"
                />

                <TechSpecs />
            </main>
        </div>
    )
}
