"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import Image from "next/image"
import { useRef } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export function Hero() {
    const ref = useRef(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    })

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
    const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1])
    const textY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"])

    return (
        <section ref={ref} className="relative h-screen w-full overflow-hidden bg-black">
            {/* Background Image with Parallax */}
            <motion.div
                style={{ y, scale }}
                className="absolute inset-0 h-[120%] w-full z-0"
            >
                <Image
                    src="https://img.aidenlux.com/Gemini_Generated_Image_ebemcqebemcqebem_2cf6bac547.png"
                    alt="CS737 Throttle Quadrant"
                    fill
                    className="object-cover"
                    priority
                    sizes="100vw"
                />
                {/* Sophisticated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
            </motion.div>

            {/* Airport neon glow effects - on top of image */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
                <motion.div
                    animate={{ opacity: [0.15, 0.25, 0.15] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-500/20 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{ opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-1/3 -right-1/4 w-1/3 h-1/3 bg-cyan-500/15 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{ opacity: [0.08, 0.15, 0.08] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute -bottom-1/4 left-1/3 w-1/2 h-1/2 bg-purple-500/10 rounded-full blur-[150px]"
                />
            </div>

            {/* Content */}
            <motion.div
                style={{ opacity, y: textY }}
                className="relative z-10 flex h-full flex-col items-center justify-center text-center px-6"
            >
                <div className="max-w-5xl mx-auto">
                    {/* Product Label */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-white/60 text-lg md:text-xl font-semibold mb-2"
                    >
                        CS737 Full-Function Throttle Quadrant
                    </motion.p>

                    {/* Main Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-white text-4xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight"
                    >
                        Real feel.
                        <br />
                        Born for flight.
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="text-white/80 text-xl md:text-3xl lg:text-4xl font-medium mb-6"
                    >
                        All-metal construction. Real panel scales.
                    </motion.p>

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="text-white/70 text-base md:text-lg lg:text-xl mb-8 max-w-3xl mx-auto"
                    >
                        Experience the familiar glow of the cockpit right at home with adjustable backlight.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.7 }}
                        className="flex flex-wrap gap-4 justify-center items-center"
                    >
                        <Link
                            href="#buy"
                            className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-full shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium text-base"
                        >
                            Buy
                        </Link>
                        <Link
                            href="#overview"
                            className="inline-flex items-center gap-1 text-blue-400 hover:underline transition-all duration-200 font-medium"
                        >
                            Learn more
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </motion.div>

                    {/* Key Stats */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 1 }}
                        className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
                    >
                        {[
                            { value: "9", label: "Motors" },
                            { value: "All-Metal", label: "Construction" },
                            { value: "10-Year", label: "Warranty" },
                        ].map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                                className="text-center"
                            >
                                <div className="text-white font-semibold text-lg mb-1">
                                    {stat.value}
                                </div>
                                <div className="text-white/60 text-sm">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.5 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
            >
                <div className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors cursor-pointer">
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-6 h-10 border-2 border-current rounded-full flex justify-center pt-2"
                    >
                        <div className="w-1 h-2 bg-current rounded-full" />
                    </motion.div>
                </div>
            </motion.div>
        </section>
    )
}
