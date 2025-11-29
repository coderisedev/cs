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
                    animate={{ opacity: [0.25, 0.4, 0.25] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-500/30 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{ opacity: [0.18, 0.32, 0.18] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-1/3 -right-1/4 w-1/3 h-1/3 bg-cyan-500/25 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{ opacity: [0.15, 0.28, 0.15] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute -bottom-1/4 left-1/3 w-1/2 h-1/2 bg-purple-500/20 rounded-full blur-[150px]"
                />
            </div>

            {/* Content */}
            <motion.div
                style={{ opacity, y: textY }}
                className="relative z-10 flex h-full flex-col items-center justify-center text-center px-6"
            >
                <div className="max-w-5xl mx-auto">
                    {/* Product Label - animated with expanding lines */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex items-center justify-center gap-4 mb-4"
                    >
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: 60 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="h-px bg-white/40"
                        />
                        <p className="text-white/70 text-base md:text-lg lg:text-xl font-semibold tracking-wide">
                            CS737 Full-Function Throttle Quadrant
                        </p>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: 60 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="h-px bg-white/40"
                        />
                    </motion.div>

                    {/* Main Headline - 1.5x larger */}
                    <motion.h1
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                        className="text-white text-4xl md:text-6xl lg:text-[5rem] font-bold mb-6 tracking-tight"
                    >
                        <motion.span
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="block py-2"
                        >
                            Real feel.
                        </motion.span>
                        <motion.span
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.55 }}
                            className="block text-blue-100 py-2"
                        >
                            Born for flight.
                        </motion.span>
                    </motion.h1>

                    {/* Subheadline - 2x larger */}
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.7 }}
                        className="text-white/80 text-xl md:text-2xl lg:text-3xl font-medium mb-8"
                    >
                        All-metal construction. Real panel scales.
                    </motion.p>

                    {/* Description - larger */}
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="text-white/70 text-sm md:text-base lg:text-lg mb-10 max-w-4xl mx-auto"
                    >
                        Experience the familiar glow of the cockpit right at home with adjustable backlight.
                    </motion.p>

                    {/* CTA Buttons - larger with better animations */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.95 }}
                        className="flex flex-wrap gap-6 justify-center items-center"
                    >
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Link
                                href="#buy"
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 font-semibold text-base md:text-lg"
                            >
                                Buy Now
                            </Link>
                        </motion.div>
                        <motion.div
                            whileHover={{ x: 5 }}
                        >
                            <Link
                                href="#overview"
                                className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-all duration-300 font-medium text-base md:text-lg group"
                            >
                                Learn more
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Key Stats - larger with dividers */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 1.1 }}
                        className="mt-16 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-0 max-w-4xl mx-auto"
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
                                transition={{ duration: 0.6, delay: 1.2 + index * 0.15 }}
                                className="text-center flex items-center"
                            >
                                {/* Divider before (except first) */}
                                {index > 0 && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: 40 }}
                                        transition={{ duration: 0.5, delay: 1.3 + index * 0.15 }}
                                        className="hidden md:block w-px bg-white/20 mx-10"
                                    />
                                )}
                                <div>
                                    <div className="text-white font-bold text-xl md:text-2xl lg:text-3xl mb-1">
                                        {stat.value}
                                    </div>
                                    <div className="text-white/50 text-sm md:text-base font-medium uppercase tracking-wider">
                                        {stat.label}
                                    </div>
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
