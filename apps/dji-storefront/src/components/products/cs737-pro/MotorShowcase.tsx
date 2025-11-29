"use client"

import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { useRef, useState } from "react"
import Image from "next/image"

const motorData = [
    {
        id: "brushless",
        count: 4,
        type: "Brushless",
        description: "High-power efficient brushless motors",
        targets: ["Thrust levers", "Speed brake"],
    },
    {
        id: "stepper",
        count: 5,
        type: "Stepper",
        description: "Precision stepper motors",
        targets: ["Trim wheel", "Trim indicator", "Other components"],
    },
]

export function MotorShowcase() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-10% 0px" })
    const [activeMotor, setActiveMotor] = useState("brushless")

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    })

    const rotateX = useTransform(scrollYProgress, [0, 1], [10, -10])
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

    return (
        <section
            ref={ref}
            id="motor"
            className="relative bg-black py-20 md:py-32 lg:py-40 overflow-hidden"
        >
            {/* Airport neon glow effects with breathing animation */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ opacity: [0.12, 0.22, 0.12] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-1/4 left-1/4 w-1/2 h-1/2 bg-blue-500/20 rounded-full blur-[150px]"
                />
                <motion.div
                    animate={{ opacity: [0.1, 0.18, 0.1] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                    className="absolute top-1/2 -right-1/4 w-1/3 h-1/2 bg-purple-500/15 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{ opacity: [0.08, 0.15, 0.08] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                    className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-cyan-500/12 rounded-full blur-[130px]"
                />
            </div>
            {/* Background Grid Effect */}
            <div className="absolute inset-0 opacity-10">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(96, 165, 250, 0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(96, 165, 250, 0.3) 1px, transparent 1px)
                        `,
                        backgroundSize: "50px 50px",
                    }}
                />
            </div>

            <div className="relative container mx-auto px-4">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                    className="text-center mb-16 md:mb-24"
                >
                    <p className="text-blue-400 text-lg md:text-xl font-semibold mb-2">
                        Motor System
                    </p>
                    <h2 className="text-white text-4xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight">
                        4 Brushless + 5 Stepper.
                        <br />
                        Fully motorized control.
                    </h2>
                </motion.div>

                {/* 3D Product View */}
                <motion.div
                    style={{ rotateX, opacity }}
                    className="relative mb-16 md:mb-24 perspective-1000"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="relative aspect-[16/9] max-w-4xl mx-auto"
                    >
                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-blue-400/20 to-blue-600/30 rounded-3xl blur-3xl animate-pulse-slow" />

                        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl md:rounded-3xl border border-blue-400/30">
                            <Image
                                src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=2670&auto=format&fit=crop"
                                alt="CS737 Motor System"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 896px"
                            />
                            {/* Overlay with animated lines */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                            {/* Animated highlight points */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.5, 1, 0.5],
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-400 rounded-full"
                            />
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.5, 1, 0.5],
                                }}
                                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                                className="absolute top-1/3 right-1/3 w-4 h-4 bg-blue-400 rounded-full"
                            />
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.5, 1, 0.5],
                                }}
                                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                                className="absolute bottom-1/3 left-1/2 w-4 h-4 bg-blue-400 rounded-full"
                            />
                        </div>
                    </motion.div>
                </motion.div>

                {/* Motor Stats */}
                <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                    {motorData.map((motor, index) => (
                        <motion.div
                            key={motor.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                            transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                            onMouseEnter={() => setActiveMotor(motor.id)}
                            className={`
                                relative p-6 md:p-8 rounded-2xl border transition-all duration-300 cursor-pointer
                                ${activeMotor === motor.id
                                    ? "bg-gray-800 border-blue-400/50"
                                    : "bg-gray-900 border-white/10 hover:border-white/20"
                                }
                            `}
                        >
                            {/* Count Badge */}
                            <div className="flex items-start justify-between mb-4">
                                <motion.div
                                    animate={activeMotor === motor.id ? { scale: [1, 1.1, 1] } : {}}
                                    transition={{ duration: 0.3 }}
                                    className="text-blue-400 text-5xl md:text-6xl font-bold"
                                >
                                    {motor.count}
                                </motion.div>
                                <div className="px-3 py-1 bg-blue-400/10 rounded-full">
                                    <span className="text-blue-400 text-xs font-medium">
                                        {motor.type}
                                    </span>
                                </div>
                            </div>

                            <h3 className="text-white text-lg font-semibold mb-2">
                                {motor.description}
                            </h3>

                            <div className="flex flex-wrap gap-2">
                                {motor.targets.map((target) => (
                                    <span
                                        key={target}
                                        className="text-white/60 text-sm px-2 py-1 bg-white/5 rounded"
                                    >
                                        {target}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Description */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="mt-16 text-center max-w-3xl mx-auto"
                >
                    <p className="text-white/60 text-base md:text-lg lg:text-xl mb-8">
                        All movements sync in real-time with your simulation software: autothrottle engagement,
                        speed brake deployment and retraction, trim adjustments — everything you see on screen
                        is physically reflected in the throttle quadrant.
                    </p>
                    <p className="text-white text-xl md:text-3xl lg:text-4xl font-medium italic">
                        "Not just seeing the change — holding it in your hands."
                    </p>
                </motion.div>
            </div>
        </section>
    )
}
