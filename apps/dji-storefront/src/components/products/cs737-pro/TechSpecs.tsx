"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Gift } from "lucide-react"

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

const configurations = [
    {
        id: "ng",
        name: "737NG Configuration",
        description: "Classic 737NG-style fuel cutoff levers and control layout",
        price: "$2,999",
    },
    {
        id: "max",
        name: "737MAX Configuration",
        description: "Next-generation 737MAX-style design",
        price: "$2,999",
    },
]

export function TechSpecs() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-10% 0px" })

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
                        The specs.
                    </h2>
                </motion.div>

                {/* Configuration Display */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-12 md:mb-16 max-w-3xl mx-auto"
                >
                    <h3 className="text-gray-900 text-xl font-semibold mb-6 text-center">
                        Available configurations
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        {configurations.map((config) => (
                            <div
                                key={config.id}
                                className="p-6 rounded-2xl border-2 border-gray-300 bg-white text-left"
                            >
                                <h4 className="text-gray-900 text-lg font-semibold mb-2">
                                    {config.name}
                                </h4>
                                <p className="text-gray-500 text-sm mb-3">
                                    {config.description}
                                </p>
                                <p className="text-gray-900 text-xl font-semibold">
                                    {config.price}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Free Sim Pedestal Promotion Banner */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center"
                    >
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Gift className="w-5 h-5" />
                            <span className="text-lg font-bold">Limited Time Offer</span>
                        </div>
                        <p className="text-xl md:text-2xl font-bold mb-1">
                            Free Sim Pedestal included with every purchase!
                        </p>
                        <p className="text-blue-100 text-sm">
                            Complete center console with storage and fire panel — $1,299 value
                        </p>
                    </motion.div>
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

            </div>
        </section>
    )
}
