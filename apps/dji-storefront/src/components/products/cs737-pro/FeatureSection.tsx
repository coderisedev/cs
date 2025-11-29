"use client"

import { motion, useInView, useScroll, useTransform } from "framer-motion"
import Image from "next/image"
import { useRef } from "react"
import { cn } from "@/lib/utils"

interface FeatureSectionProps {
    id?: string
    eyebrow: string
    title: string
    description: string
    quote?: string
    imageSrc: string
    imageAlt: string
    align?: "left" | "right" | "center"
    theme?: "dark" | "darker" | "light"
    features?: string[]
}

export function FeatureSection({
    id,
    eyebrow,
    title,
    description,
    quote,
    imageSrc,
    imageAlt,
    align = "left",
    theme = "dark",
    features,
}: FeatureSectionProps) {
    const sectionRef = useRef(null)
    const isInView = useInView(sectionRef, { once: true, margin: "-10% 0px" })

    // Parallax effect for image
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"],
    })
    const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"])
    const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 1.02])

    const isCenter = align === "center"
    const isRight = align === "right"

    // Theme colors - using Tailwind classes matching homepage
    // dark = pure black, darker = slightly lighter gray, light = light gray
    const isDarkTheme = theme === "dark" || theme === "darker"
    const bgColor = theme === "dark" ? "bg-black" : theme === "darker" ? "bg-gray-950" : "bg-gray-100"
    const textColor = isDarkTheme ? "text-white" : "text-gray-900"
    const textSecondary = isDarkTheme ? "text-white/60" : "text-gray-600"
    const accentColor = isDarkTheme ? "text-blue-400" : "text-blue-600"

    // Neon glow colors based on section position (for variety)
    const glowVariants = [
        { pos1: "top-0 left-0", color1: "bg-blue-500/10", pos2: "bottom-0 right-0", color2: "bg-cyan-500/8" },
        { pos1: "top-0 right-0", color1: "bg-purple-500/10", pos2: "bottom-0 left-1/4", color2: "bg-blue-500/8" },
        { pos1: "top-1/4 left-0", color1: "bg-cyan-500/10", pos2: "bottom-0 right-1/4", color2: "bg-indigo-500/8" },
    ]
    const glowIndex = id ? id.charCodeAt(0) % 3 : 0
    const glow = glowVariants[glowIndex]

    return (
        <section
            ref={sectionRef}
            id={id}
            className={cn(
                "relative py-20 md:py-32 lg:py-40 overflow-hidden",
                bgColor,
                textColor
            )}
        >
            {/* Airport neon glow effects - only for dark themes */}
            {isDarkTheme && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{ opacity: [0.1, 0.18, 0.1] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className={cn("absolute w-1/3 h-1/2 rounded-full blur-[120px]", glow.pos1, glow.color1)}
                    />
                    <motion.div
                        animate={{ opacity: [0.08, 0.15, 0.08] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className={cn("absolute w-1/4 h-1/3 rounded-full blur-[100px]", glow.pos2, glow.color2)}
                    />
                </div>
            )}
            <div className="relative container mx-auto px-4">
                {isCenter ? (
                    // Center aligned layout
                    <div className="flex flex-col items-center text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                            className="max-w-3xl mb-12 md:mb-16"
                        >
                            <p className={cn("text-lg md:text-xl font-semibold mb-2", accentColor)}>
                                {eyebrow}
                            </p>
                            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight">
                                {title}
                            </h2>
                            <p className={cn("text-base md:text-lg lg:text-xl", textSecondary)}>
                                {description}
                            </p>
                            {features && features.length > 0 && (
                                <div className="mt-8 flex flex-wrap justify-center gap-3">
                                    {features.map((feature, index) => (
                                        <motion.span
                                            key={feature}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                                            className={cn(
                                                "px-4 py-2 rounded-full text-sm font-medium",
                                                isDarkTheme ? "bg-gray-800 text-white" : "bg-white text-gray-900"
                                            )}
                                        >
                                            {feature}
                                        </motion.span>
                                    ))}
                                </div>
                            )}
                            {quote && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                    className={cn("mt-8 text-xl md:text-3xl lg:text-4xl font-medium leading-relaxed italic", textColor)}
                                >
                                    "{quote}"
                                </motion.p>
                            )}
                        </motion.div>

                        {/* Image */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                            transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                            className="w-full max-w-4xl"
                        >
                            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl md:rounded-3xl">
                                <motion.div style={{ y: imageY, scale: imageScale }} className="absolute inset-0 h-[110%]">
                                    <Image
                                        src={imageSrc}
                                        alt={imageAlt}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 980px"
                                    />
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                ) : (
                    // Left/Right aligned layout
                    <div
                        className={cn(
                            "flex flex-col gap-10 md:gap-12 lg:gap-16 items-center max-w-6xl mx-auto",
                            "md:flex-row",
                            isRight && "md:flex-row-reverse"
                        )}
                    >
                        {/* Text Content */}
                        <motion.div
                            initial={{ opacity: 0, x: isRight ? 30 : -30 }}
                            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isRight ? 30 : -30 }}
                            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                            className="flex-1 max-w-xl"
                        >
                            <p className={cn("text-lg md:text-xl font-semibold mb-2", accentColor)}>
                                {eyebrow}
                            </p>
                            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                                {title}
                            </h2>
                            <p className={cn("text-base md:text-lg mb-6", textSecondary)}>
                                {description}
                            </p>
                            {features && features.length > 0 && (
                                <ul className="space-y-3 mb-6">
                                    {features.map((feature, index) => (
                                        <motion.li
                                            key={feature}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                                            transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                                            className="flex items-start gap-3"
                                        >
                                            <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className={cn("text-sm md:text-base", textColor)}>{feature}</span>
                                        </motion.li>
                                    ))}
                                </ul>
                            )}
                            {quote && (
                                <p className={cn(
                                    "text-lg md:text-xl font-medium leading-relaxed pt-4 border-t italic",
                                    isDarkTheme ? "border-white/10" : "border-gray-200",
                                    textColor
                                )}>
                                    "{quote}"
                                </p>
                            )}
                        </motion.div>

                        {/* Image Content */}
                        <motion.div
                            initial={{ opacity: 0, x: isRight ? -30 : 30 }}
                            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isRight ? -30 : 30 }}
                            transition={{ duration: 1, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                            className="flex-[1.2] w-full"
                        >
                            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl md:rounded-3xl">
                                <motion.div style={{ y: imageY, scale: imageScale }} className="absolute inset-0 h-[110%]">
                                    <Image
                                        src={imageSrc}
                                        alt={imageAlt}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </section>
    )
}
