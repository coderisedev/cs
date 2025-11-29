"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import Image from "next/image"
import { useRef } from "react"

export function Hero() {
    const ref = useRef(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    })

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

    return (
        <section ref={ref} className="relative h-[90vh] w-full overflow-hidden bg-black">
            <motion.div style={{ y, opacity }} className="absolute inset-0 h-full w-full">
                <Image
                    src="https://images.unsplash.com/photo-1559067515-bf7d799b6d42?q=80&w=2574&auto=format&fit=crop" // Unsplash Cockpit Image
                    alt="CS737 Throttle Console"
                    fill
                    className="object-cover opacity-60"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black" />
            </motion.div>

            <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-6"
                >
                    <h2 className="text-xl font-medium tracking-[0.2em] text-primary-500 uppercase">
                        CS737 Full Function Throttle Console
                    </h2>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
                        Real feel. <br />
                        Born for flight.
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/80 leading-relaxed">
                        All-metal structure, real panel scale, and adjustable backlight.
                        <br />
                        Experience the familiar glow of the cockpit right at home.
                    </p>
                </motion.div>
            </div>
        </section>
    )
}
