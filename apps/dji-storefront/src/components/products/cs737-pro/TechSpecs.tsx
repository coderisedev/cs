"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

const specs = [
    {
        category: "Dimensions & Weight",
        items: [
            { label: "Standard Size", value: "240 x 240 x 400 mm" },
            { label: "With Pedestal", value: "300 x 400 x 500 mm" },
            { label: "Weight", value: "8.5 kg (18.7 lbs)" },
        ],
    },
    {
        category: "Connectivity",
        items: [
            { label: "Interface", value: "USB-C" },
            { label: "OS Support", value: "Windows 10/11, macOS" },
            { label: "Simulators", value: "MSFS 2020/2024, X-Plane 11/12, P3D" },
        ],
    },
    {
        category: "Motor System",
        items: [
            { label: "Brushless Motors", value: "4x High-power" },
            { label: "Stepper Motors", value: "5x Precision" },
            { label: "Force Feedback", value: "Real-time sync" },
        ],
    },
    {
        category: "Materials",
        items: [
            { label: "Body", value: "Aviation-grade aluminum" },
            { label: "Levers", value: "Reinforced polymer" },
            { label: "Backlight", value: "Adjustable LED" },
        ],
    },
]

const variants = [
    {
        id: "ng",
        name: "737NG Configuration",
        description: "Classic 737NG-style fuel cutoff levers and control layout",
        price: "$2999",
    },
    {
        id: "max",
        name: "737MAX Configuration",
        description: "Next-generation 737MAX-style design",
        price: "$2999",
    },
    {
        id: "full",
        name: "With Sim Pedestal",
        description: "Complete center console with storage, fire panel included",
        price: "$1,299",
    },
]

export function TechSpecs() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-10% 0px" })
    const [activeVariant, setActiveVariant] = useState("ng")

    return (
        <section ref={ref} id="specs" className="bg-gray-100 py-20 md:py-32 lg:py-40">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                    className="mb-16 md:mb-20 text-center"
                >
                    <p className="text-blue-600 text-lg md:text-xl font-semibold mb-2">
                        Tech Specs
                    </p>
                    <h2 className="text-gray-900 text-4xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight">
                        Precision engineered.
                        <br />
                        Down to every detail.
                    </h2>
                </motion.div>

                {/* Variant Selector */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-12 md:mb-16 max-w-4xl mx-auto"
                >
                    <h3 className="text-gray-900 text-xl font-semibold mb-6 text-center">
                        Choose your configuration
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        {variants.map((variant) => (
                            <button
                                key={variant.id}
                                onClick={() => setActiveVariant(variant.id)}
                                className={`
                                    p-6 rounded-2xl border-2 text-left transition-all duration-300
                                    ${activeVariant === variant.id
                                        ? "border-blue-600 bg-white shadow-lg"
                                        : "border-gray-300 bg-white/50 hover:border-gray-400"
                                    }
                                `}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="text-gray-900 text-lg font-semibold">
                                        {variant.name}
                                    </h4>
                                    <div className={`
                                        w-5 h-5 rounded-full border-2 flex items-center justify-center
                                        ${activeVariant === variant.id
                                            ? "border-blue-600 bg-blue-600"
                                            : "border-gray-300"
                                        }
                                    `}>
                                        {activeVariant === variant.id && (
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <p className="text-gray-500 text-sm mb-3">
                                    {variant.description}
                                </p>
                                <p className="text-gray-900 text-xl font-semibold">
                                    {variant.price}
                                </p>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Specs Grid */}
                <div className="grid gap-0 md:grid-cols-2 border-t border-gray-300 max-w-4xl mx-auto">
                    {specs.map((category, categoryIndex) => (
                        <motion.div
                            key={category.category}
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{
                                duration: 0.6,
                                delay: 0.3 + categoryIndex * 0.1,
                                ease: [0.25, 0.1, 0.25, 1]
                            }}
                            className="py-8 md:py-10 border-b border-gray-300 md:odd:pr-10 md:even:pl-10 md:odd:border-r"
                        >
                            <h3 className="text-gray-900 text-xl md:text-2xl font-semibold mb-6">
                                {category.category}
                            </h3>
                            <dl className="space-y-4">
                                {category.items.map((item) => (
                                    <div
                                        key={item.label}
                                        className="flex justify-between items-baseline gap-4"
                                    >
                                        <dt className="text-gray-500 text-sm md:text-base">
                                            {item.label}
                                        </dt>
                                        <dd className="text-gray-900 text-sm md:text-base text-right">
                                            {item.value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </motion.div>
                    ))}
                </div>

                {/* Full specs link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="mt-12 text-center"
                >
                    <Link
                        href="#"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline transition-all duration-200 font-medium"
                    >
                        View full specifications
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}
