"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import Image from "next/image"
import { useRef } from "react"
import Link from "next/link"

export function Hero() {
    const ref = useRef(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    })

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
    const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1])

    return (
        <section ref={ref} className="relative h-screen w-full overflow-hidden bg-black">
            {/* Background Image with Parallax */}
            <motion.div
                style={{ y, scale }}
                className="absolute inset-0 h-[120%] w-full"
            >
                <Image
                    src="https://images.unsplash.com/photo-1559067515-bf7d799b6d42?q=80&w=2574&auto=format&fit=crop"
                    alt="CS737 Throttle Console"
                    fill
                    className="object-cover"
                    priority
                    sizes="100vw"
                />
                {/* Apple-style gradient overlay - subtle and sophisticated */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black" />
            </motion.div>

            {/* Content */}
            <motion.div
                style={{ opacity }}
                className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4"
            >
                <div className="max-w-5xl mx-auto">
                    {/* Product Label - Apple style subtle eyebrow */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-[#f5f5f7]/60 text-sm md:text-base font-medium tracking-wide mb-4"
                    >
                        CS737 Full Function Throttle Console
                    </motion.p>

                    {/* Main Headline - Apple style large, bold, clean */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-[#f5f5f7] text-5xl md:text-7xl lg:text-[80px] font-semibold tracking-[-0.015em] leading-[1.05] mb-6"
                    >
                        Real feel.
                        <br />
                        Born for flight.
                    </motion.h1>

                    {/* Subheadline - Apple style concise description */}
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="text-[#f5f5f7]/80 text-xl md:text-2xl font-normal leading-relaxed max-w-2xl mx-auto mb-10"
                    >
                        All-metal structure. Real panel scale.
                        <br className="hidden md:block" />
                        The cockpit experience, right at home.
                    </motion.p>

                    {/* CTA Buttons - Apple style pill buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.7 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
                    >
                        <Link
                            href="#buy"
                            className="inline-flex items-center justify-center px-8 py-3 bg-[#0071e3] hover:bg-[#0077ED] text-white text-lg font-normal rounded-full transition-colors duration-300 min-w-[160px]"
                        >
                            Buy
                        </Link>
                        <Link
                            href="#learn-more"
                            className="inline-flex items-center justify-center text-[#2997ff] hover:text-[#2997ff]/80 text-lg font-normal transition-colors duration-300 group"
                        >
                            Learn more
                            <span className="ml-1 group-hover:translate-x-0.5 transition-transform duration-300">
                                &rsaquo;
                            </span>
                        </Link>
                    </motion.div>
                </div>
            </motion.div>

            {/* Scroll Indicator - Apple style subtle hint */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.2 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
            >
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2"
                >
                    <motion.div className="w-1 h-2 bg-white/50 rounded-full" />
                </motion.div>
            </motion.div>
        </section>
    )
}
