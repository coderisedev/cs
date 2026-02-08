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

export default async function CS737ProPage({
    params,
}: {
    params: Promise<{ countryCode: string }>
}) {
    const { countryCode } = await params

    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            <StickyNav />

            <main>
                {/* Hero Section */}
                <Hero countryCode={countryCode} />

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

                {/* Throttle Control Levers - darkest */}
                <FeatureSection
                    id="throttle"
                    eyebrow="Throttle Control Levers"
                    title="Throttle Control Levers"
                    description=""
                    imageSrc="https://img.aidenlux.com/cs737-pro/part4.png"
                    imageAlt="CS737 Throttle Control Levers"
                    align="right"
                    theme="dark"
                    features={[
                        {
                            title: "Forward Thrust Levers",
                            description: "Independent signals for left and right engines, allowing separate control of each engine. The levers move in real-time synchronization with the auto-throttle system in compatible flight simulation software. Equipped with a mechanical clutch, the levers support manual override even when auto-throttle is engaged."
                        },
                        {
                            title: "Reverse Thrust Levers",
                            description: "Independent signals for left and right engines. Built-in mechanical interlock prevents reverse thrust levers from being raised unless the forward levers are fully retarded. Likewise, forward thrust levers cannot be advanced if the reverse levers are not fully stowed."
                        },
                        {
                            title: "Auto-Throttle Buttons",
                            description: "Includes two independent A/T DISENGAGE buttons and two TO/GA (Takeoff/Go-Around) buttons, each with its own signal channel."
                        },
                    ]}
                />

                {/* Speed Brake Lever - slightly lighter */}
                <FeatureSection
                    id="speedbrake"
                    eyebrow="Speed Brake Lever"
                    title="Speed Brake Lever"
                    description=""
                    imageSrc="https://img.aidenlux.com/cs737-pro/part5.png"
                    imageAlt="CS737 Speed Brake Lever"
                    align="left"
                    theme="darker"
                    features={[
                        {
                            title: "Auto Deployment",
                            description: "When armed and the simulated aircraft is detected to have landed, the speed brake lever will automatically deploy. It also interacts with the reverse thrust levers—when the reversers are pulled up, the speed brake lever is automatically lifted out of the DOWN detent."
                        },
                        {
                            title: "Auto Retraction",
                            description: "After deployment, the speed brake lever automatically retracts when the forward thrust levers are advanced beyond a certain threshold."
                        },
                        {
                            title: "Flight Detent Lock",
                            description: "A locking mechanism is implemented at the FLIGHT detent to prevent movement to the UP position while airborne, based on simulated aircraft status. Comes with dual configuration panel markings."
                        },
                    ]}
                />

                {/* Trim and Flap System - light section for contrast */}
                <FeatureSection
                    id="trim"
                    eyebrow="Trim and Flap System"
                    title="Trim and Flap System"
                    description=""
                    imageSrc="https://img.aidenlux.com/cs737-pro/part6.png"
                    imageAlt="CS737 Trim and Flap System"
                    align="center"
                    theme="light"
                    features={[
                        {
                            title: "Trim Wheel",
                            description: "Electrically driven rotation synchronized with in-flight trim status. Rotation speed is adjustable and can be customized. Includes detent locking mechanism for defined stop positions."
                        },
                        {
                            title: "Foldable Handles",
                            description: "Equipped with foldable handles that allow for manual trim adjustment."
                        },
                        {
                            title: "Dual Trim Indicators",
                            description: "Dual trim position indicators on both sides move in real-time based on the simulated aircraft state."
                        },
                        {
                            title: "Trim Cutout Switches",
                            description: "Feature protective safety covers to prevent accidental activation."
                        },
                        {
                            title: "Flap Lever",
                            description: "Includes 9 detent slots, with mechanical resistance at positions 1 and 15, fully replicating real aircraft operation."
                        },
                    ]}
                />

                {/* Selectable Configuration - darkest */}
                <FeatureSection
                    id="start"
                    eyebrow="Selectable Configuration"
                    title="Selectable Configuration"
                    description="Two different styles of fuel control levers and parking brake mechanisms are available. The differences are purely cosmetic, with identical functionality across both variants."
                    imageSrc="https://img.aidenlux.com/cs737-pro/part7.png"
                    imageAlt="CS737 Selectable Configuration"
                    align="right"
                    theme="dark"
                    features={[
                        {
                            title: "Parking Brake",
                            description: "Features an internal locking mechanism — the lever can only be lifted after brake input is detected. Once locked, the brake input will automatically release the lever for disengagement."
                        },
                        {
                            title: "Engine Start Levers",
                            description: "Regardless of style, all variants require the lever to be pulled outward before moving it up or down."
                        },
                    ]}
                />

                {/* Simulated Pedestal Base - slightly lighter */}
                <FeatureSection
                    id="base"
                    eyebrow="Simulated Pedestal Base"
                    title="Simulated Pedestal Base"
                    description="An optional simulated pedestal base is available to help users build a more complete and immersive cockpit setup. It includes additional components such as: Document holder, Cup holder, Overheat and fire panel."
                    imageSrc="https://img.aidenlux.com/cs737-pro/part8.png"
                    imageAlt="CS737 Simulated Pedestal Base"
                    align="left"
                    theme="darker"
                    features={[
                        {
                            title: "Overheat and Fire Warning Panel",
                            description: "Fully replicates aircraft operations, including: Overheat detector switch (with guard), Fire warning bell cutout switch (pushbutton), Fire extinguisher bottle test switch (momentary, spring-loaded), Fault/Inop and Overheat/Fire warning test switch (momentary, spring-loaded), 3 fire extinguisher handles (with solenoid lock and manual lock; must be unlocked before pulling and rotating), 8 rectangular indicator lights (with push-to-test function), 3 fire extinguisher bottle test lights, and Panel with controllable backlight."
                        },
                    ]}
                />

                {/* Tech Specs */}
                <TechSpecs />

                {/* Warranty & CTA */}
                <div id="buy">
                    <WarrantyCTA countryCode={countryCode} />
                </div>
            </main>
        </div>
    )
}
