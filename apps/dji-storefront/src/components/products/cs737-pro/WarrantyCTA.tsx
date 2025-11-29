"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import Link from "next/link"
import Image from "next/image"

const highlights = [
    { value: "10-Year", label: "Warranty" },
    { value: "9", label: "Motors" },
    { value: "All-Metal", label: "Construction" },
    { value: "1:1", label: "Aircraft Scale" },
]

export function WarrantyCTA() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-10% 0px" })

    return (
        <section ref={ref} id="warranty" className="relative bg-black py-20 md:py-32 lg:py-40 overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-black" />

            {/* Airport neon glow effects with breathing animation */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ opacity: [0.12, 0.2, 0.12] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/18 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{ opacity: [0.1, 0.16, 0.1] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-1/3 right-0 w-80 h-80 bg-purple-500/15 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{ opacity: [0.08, 0.14, 0.08] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/12 rounded-full blur-[130px]"
                />
                <motion.div
                    animate={{ opacity: [0.06, 0.1, 0.06] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                    className="absolute bottom-1/4 left-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-[90px]"
                />
            </div>

            <div className="relative container mx-auto px-4">
                {/* Warranty Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                    className="text-center mb-20 md:mb-28"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full mb-6">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span className="text-white text-sm font-medium">Quality & Warranty</span>
                    </div>

                    <h2 className="text-white text-4xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight">
                        10-year warranty.
                        <br />
                        Countless landings together.
                    </h2>

                    <p className="text-white/60 text-base md:text-lg lg:text-xl max-w-3xl mx-auto mb-8">
                        Cockpit Simulator is built with aircraft-grade hardware quality and rigorous production standards.
                        Every critical component is designed for long-term training. We want this throttle to become
                        a real part of your flight journey.
                    </p>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="text-white text-xl md:text-3xl lg:text-4xl font-medium italic"
                    >
                        "A throttle that flies with you for ten years — that's what full-function truly means."
                    </motion.p>
                </motion.div>

                {/* Product Image */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="relative mb-16 md:mb-20"
                >
                    <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="relative w-full max-w-3xl mx-auto"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-blue-400/10 to-blue-600/20 rounded-3xl blur-3xl" />
                        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl md:rounded-3xl border border-white/10">
                            <Image
                                src="https://images.unsplash.com/photo-1474302770737-173ee21bab63?q=80&w=2574&auto=format&fit=crop"
                                alt="CS737 Throttle Quadrant"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 768px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        </div>
                    </motion.div>
                </motion.div>

                {/* Price and CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="text-center mb-16"
                >
                    <p className="text-white/60 text-xl md:text-2xl mb-2">
                        Starting at
                    </p>
                    <p className="text-white text-5xl md:text-7xl font-bold mb-8">
                        <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">$799</span>
                    </p>

                    <div className="flex flex-wrap gap-4 justify-center items-center">
                        <Link
                            href="#"
                            className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-full shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium text-base"
                        >
                            Buy
                        </Link>
                        <Link
                            href="#"
                            className="inline-flex items-center gap-1 bg-transparent hover:bg-blue-50/10 text-blue-400 px-8 py-2.5 rounded-full border-2 border-blue-400 hover:scale-105 transition-all duration-200 font-medium text-base"
                        >
                            Compare models
                        </Link>
                    </div>
                </motion.div>

                {/* Highlights Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="pt-12 border-t border-gray-700 max-w-4xl mx-auto"
                >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {highlights.map((item, index) => (
                            <motion.div
                                key={item.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                            >
                                <div className="text-white font-semibold text-lg mb-1">
                                    {item.value}
                                </div>
                                <p className="text-white/60 text-sm">
                                    {item.label}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
