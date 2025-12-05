"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import Link from "next/link"

const specs = [
    {
        category: "Dimensions & Weight",
        items: [
            { label: "Dimensions (Standard)", value: "240 x 240 x 400 mm" },
            { label: "Dimensions (With Base)", value: "300 x 400 x 500 mm" },
            { label: "Weight", value: "8.5 kg" },
        ],
    },
    {
        category: "Connectivity",
        items: [
            { label: "Interface", value: "USB-C" },
            { label: "Compatibility", value: "Windows 10/11, macOS" },
            { label: "Simulators", value: "MSFS 2020/2024, X-Plane 11/12, P3D" },
        ],
    },
    {
        category: "Materials",
        items: [
            { label: "Body", value: "Aviation Grade Aluminum Alloy" },
            { label: "Levers", value: "Reinforced Polymer" },
            { label: "Backlight", value: "Adjustable LED" },
        ],
    },
    {
        category: "Motor System",
        items: [
            { label: "Brushless Motors", value: "4x High-efficiency" },
            { label: "Stepper Motors", value: "5x Precision" },
            { label: "Force Feedback", value: "Real-time sync" },
        ],
    },
]

export function TechSpecs() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-10% 0px" })

    return (
        <section ref={ref} className="bg-[#f5f5f7] py-20 md:py-32 lg:py-40">
            <div className="mx-auto max-w-[980px] px-6 lg:px-0">
                {/* Apple-style section header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                    className="mb-16 md:mb-20 text-center"
                >
                    <p className="text-[#2997ff] text-sm md:text-base font-medium mb-3">
                        Tech Specs
                    </p>
                    <h2 className="text-[#1d1d1f] text-4xl md:text-5xl lg:text-[56px] font-semibold tracking-[-0.015em] leading-[1.08]">
                        Precision engineered.
                        <br />
                        Down to every detail.
                    </h2>
                </motion.div>

                {/* Specs Grid - Apple style clean layout */}
                <div className="grid gap-0 md:grid-cols-2 border-t border-[#d2d2d7]">
                    {specs.map((category, categoryIndex) => (
                        <motion.div
                            key={category.category}
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{
                                duration: 0.6,
                                delay: categoryIndex * 0.1,
                                ease: [0.25, 0.1, 0.25, 1]
                            }}
                            className="py-8 md:py-10 border-b border-[#d2d2d7] md:odd:pr-10 md:even:pl-10 md:odd:border-r"
                        >
                            <h3 className="text-[#1d1d1f] text-xl md:text-2xl font-semibold mb-6">
                                {category.category}
                            </h3>
                            <dl className="space-y-4">
                                {category.items.map((item) => (
                                    <div
                                        key={item.label}
                                        className="flex justify-between items-baseline gap-4"
                                    >
                                        <dt className="text-[#86868b] text-sm md:text-base font-normal">
                                            {item.label}
                                        </dt>
                                        <dd className="text-[#1d1d1f] text-sm md:text-base font-normal text-right">
                                            {item.value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </motion.div>
                    ))}
                </div>

                {/* Apple-style full specs link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="mt-12 text-center"
                >
                    <Link
                        href="#"
                        className="inline-flex items-center text-[#2997ff] text-lg font-normal transition-colors duration-300 group hover:text-[#2997ff]/80"
                    >
                        View full specifications
                        <span className="ml-1 group-hover:translate-x-0.5 transition-transform duration-300">
                            &rsaquo;
                        </span>
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}
