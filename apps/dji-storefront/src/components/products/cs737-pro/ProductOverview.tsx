"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import { Play } from "lucide-react"

const features = [
    {
        icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
        title: "All-Metal Build",
        description: "Aircraft-grade weight & rigidity",
    },
    {
        icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
        title: "9-Motor System",
        description: "4 brushless + 5 stepper motors",
    },
    {
        icon: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707",
        title: "Adjustable Backlight",
        description: "Syncs with simulation software",
    },
    {
        icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
        title: "10-Year Warranty",
        description: "Long-lasting quality promise",
    },
]

export function ProductOverview() {
    const ref = useRef(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const isInView = useInView(ref, { once: true, margin: "-10% 0px" })
    const [isPlaying, setIsPlaying] = useState(false)

    const handlePlayClick = () => {
        if (videoRef.current) {
            videoRef.current.play()
            setIsPlaying(true)
        }
    }

    return (
        <section
            ref={ref}
            id="overview"
            className="relative bg-black py-20 md:py-32 lg:py-40 overflow-hidden"
        >
            {/* Airport neon glow effects with breathing animation */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ opacity: [0.15, 0.28, 0.15] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-0 right-0 w-1/3 h-1/2 bg-cyan-500/18 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{ opacity: [0.15, 0.28, 0.15] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                    className="absolute bottom-0 left-0 w-1/2 h-1/3 bg-blue-600/18 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{ opacity: [0.12, 0.22, 0.12] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 h-1/4 bg-indigo-500/18 rounded-full blur-[80px]"
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
                        Overview
                    </p>
                    <h2 className="text-white text-4xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight">
                        One throttle.
                        <br />
                        Every 737 control.
                    </h2>
                    <p className="text-white/70 text-base md:text-lg lg:text-xl max-w-3xl mx-auto">
                        9 motors. Full synchronization.
                        <br />
                        Every movement matches your simulator in real-time.
                        <br />
                        NG or MAX — your choice.
                    </p>
                </motion.div>

                {/* Product Image with Floating Animation */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                    className="relative mb-20 md:mb-28"
                >
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="relative w-full max-w-[1200px] mx-auto"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-transparent to-blue-600/20 rounded-3xl blur-3xl" />
                        <div className="relative w-full overflow-hidden rounded-2xl md:rounded-3xl border border-white/10">
                            <video
                                ref={videoRef}
                                src="https://img.aidenlux.com/cs737-pro/pro.mp4"
                                loop
                                playsInline
                                controls={isPlaying}
                                className="w-full h-auto object-contain"
                            />
                            {/* Play Button Overlay */}
                            {!isPlaying && (
                                <button
                                    onClick={handlePlayClick}
                                    className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors duration-300 cursor-pointer group"
                                >
                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-2xl">
                                        <Play className="w-8 h-8 md:w-10 md:h-10 text-gray-900 ml-1" fill="currentColor" />
                                    </div>
                                </button>
                            )}
                        </div>
                    </motion.div>
                </motion.div>

                {/* Feature Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                            transition={{
                                duration: 0.6,
                                delay: 0.4 + index * 0.1,
                                ease: [0.25, 0.1, 0.25, 1]
                            }}
                            className="text-center group"
                        >
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-blue-600/20 transition-colors duration-300">
                                <svg
                                    className="w-6 h-6 text-blue-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                                </svg>
                            </div>
                            <h3 className="text-white font-semibold text-lg mb-1">
                                {feature.title}
                            </h3>
                            <p className="text-white/60 text-sm">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Quote */}
                <motion.blockquote
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="mt-20 text-center"
                >
                    <p className="text-white text-xl md:text-3xl lg:text-4xl font-medium leading-relaxed italic">
                        &quot;Close your eyes. You&apos;re in the cockpit.&quot;
                    </p>
                </motion.blockquote>
            </div>
        </section>
    )
}
