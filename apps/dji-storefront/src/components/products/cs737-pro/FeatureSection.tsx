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
        { pos1: "top-0 left-0", color1: "bg-blue-500/18", pos2: "bottom-0 right-0", color2: "bg-cyan-500/15" },
        { pos1: "top-0 right-0", color1: "bg-purple-500/18", pos2: "bottom-0 left-1/4", color2: "bg-blue-500/15" },
        { pos1: "top-1/4 left-0", color1: "bg-cyan-500/18", pos2: "bottom-0 right-1/4", color2: "bg-indigo-500/15" },
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
                        animate={{ opacity: [0.18, 0.32, 0.18] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className={cn("absolute w-1/3 h-1/2 rounded-full blur-[120px]", glow.pos1, glow.color1)}
                    />
                    <motion.div
                        animate={{ opacity: [0.15, 0.28, 0.15] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className={cn("absolute w-1/4 h-1/3 rounded-full blur-[100px]", glow.pos2, glow.color2)}
                    />
                </div>
            )}
            <div className={cn("relative", isCenter ? "container mx-auto px-4" : "w-full")}>
                {isCenter ? (
                    // Center aligned layout with enhanced animations
                    <div className="flex flex-col items-center text-center">
                        <div className="max-w-4xl mb-12 md:mb-16">
                            {/* Animated eyebrow with expanding lines */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="flex items-center justify-center gap-4 mb-4"
                            >
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={isInView ? { width: 48 } : { width: 0 }}
                                    transition={{ duration: 0.6, delay: 0.3 }}
                                    className={cn("h-0.5", isDarkTheme ? "bg-blue-400/50" : "bg-blue-600/50")}
                                />
                                <p className={cn("text-lg md:text-xl font-semibold", accentColor)}>
                                    {eyebrow}
                                </p>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={isInView ? { width: 48 } : { width: 0 }}
                                    transition={{ duration: 0.6, delay: 0.3 }}
                                    className={cn("h-0.5", isDarkTheme ? "bg-blue-400/50" : "bg-blue-600/50")}
                                />
                            </motion.div>

                            {/* Title with scale and fade */}
                            <motion.h2
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.95 }}
                                transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                                className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                            >
                                {title}
                            </motion.h2>

                            {/* Description with delayed fade */}
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.7, delay: 0.4 }}
                                className={cn("text-base md:text-lg lg:text-xl max-w-2xl mx-auto", textSecondary)}
                            >
                                {description}
                            </motion.p>

                            {/* Feature pills with staggered pop-in */}
                            {features && features.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                                    transition={{ duration: 0.5, delay: 0.5 }}
                                    className="mt-10 flex flex-wrap justify-center gap-3"
                                >
                                    {features.map((feature, index) => (
                                        <motion.span
                                            key={feature}
                                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                            animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 10 }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 20,
                                                delay: 0.55 + index * 0.08
                                            }}
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            className={cn(
                                                "px-5 py-2.5 rounded-full text-sm font-medium cursor-default transition-shadow duration-300",
                                                isDarkTheme
                                                    ? "bg-gray-800 text-white hover:shadow-lg hover:shadow-blue-500/20"
                                                    : "bg-white text-gray-900 hover:shadow-lg hover:shadow-blue-500/30"
                                            )}
                                        >
                                            {feature}
                                        </motion.span>
                                    ))}
                                </motion.div>
                            )}

                            {/* Quote with decorative marks */}
                            {quote && (
                                <motion.div
                                    initial={{ opacity: 0, y: 25 }}
                                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
                                    transition={{ duration: 0.8, delay: 0.7 }}
                                    className="mt-10 relative"
                                >
                                    {/* Large decorative quote marks */}
                                    <motion.span
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={isInView ? { opacity: 0.1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                                        transition={{ duration: 0.5, delay: 0.8 }}
                                        className={cn(
                                            "absolute -top-6 left-1/2 -translate-x-1/2 text-8xl md:text-9xl font-serif pointer-events-none",
                                            isDarkTheme ? "text-blue-400" : "text-blue-600"
                                        )}
                                    >
                                        &quot;
                                    </motion.span>
                                    <p className={cn(
                                        "text-xl md:text-3xl lg:text-4xl font-medium leading-relaxed italic relative z-10 pt-4",
                                        textColor
                                    )}>
                                        {quote}
                                    </p>
                                </motion.div>
                            )}
                        </div>

                        {/* Image with hover effects */}
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.95 }}
                            transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                            className="w-full max-w-[1400px] group cursor-pointer"
                        >
                            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl md:rounded-3xl">
                                <motion.div
                                    style={{ y: imageY, scale: imageScale }}
                                    className="absolute inset-0 h-[110%] transition-transform duration-700 ease-out group-hover:scale-105"
                                >
                                    <Image
                                        src={imageSrc}
                                        alt={imageAlt}
                                        fill
                                        className="object-contain"
                                        sizes="(max-width: 768px) 100vw, 1100px"
                                    />
                                </motion.div>
                                                                {/* Corner glow on hover */}
                                <div className={cn(
                                    "absolute bottom-6 right-6 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-700",
                                    isDarkTheme ? "bg-blue-500/50" : "bg-blue-400/40"
                                )} />
                            </div>
                        </motion.div>
                    </div>
                ) : (
                    // Left/Right aligned layout - full width
                    <div
                        className={cn(
                            "flex flex-col md:items-stretch",
                            "md:flex-row md:min-h-[70vh]",
                            isRight && "md:flex-row-reverse"
                        )}
                    >
                        {/* Text Content */}
                        <motion.div
                            initial={{ opacity: 0, x: isRight ? 30 : -30 }}
                            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isRight ? 30 : -30 }}
                            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                            className="flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-20 py-12 md:py-0 max-w-2xl"
                        >
                            {/* Eyebrow with slide-in line */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="flex items-center gap-3 mb-3"
                            >
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={isInView ? { width: 32 } : { width: 0 }}
                                    transition={{ duration: 0.5, delay: 0.4 }}
                                    className={cn("h-0.5", isDarkTheme ? "bg-blue-400" : "bg-blue-600")}
                                />
                                <p className={cn("text-lg md:text-xl font-semibold", accentColor)}>
                                    {eyebrow}
                                </p>
                            </motion.div>

                            {/* Title with staggered word reveal */}
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.7, delay: 0.3 }}
                                className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight"
                            >
                                {title}
                            </motion.h2>

                            {/* Description with fade */}
                            <motion.p
                                initial={{ opacity: 0, y: 15 }}
                                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                                transition={{ duration: 0.6, delay: 0.45 }}
                                className={cn("text-base md:text-lg mb-6", textSecondary)}
                            >
                                {description}
                            </motion.p>
                            {features && features.length > 0 && (
                                <ul className="space-y-5 mb-8">
                                    {features.map((feature, index) => (
                                        <motion.li
                                            key={feature}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                                            transition={{
                                                duration: 0.5,
                                                delay: 0.5 + index * 0.1,
                                                ease: [0.25, 0.1, 0.25, 1]
                                            }}
                                            whileHover={{ x: 8 }}
                                            className="flex items-start gap-4 group/item cursor-default"
                                        >
                                            {/* Animated checkmark with pulse */}
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={isInView ? { scale: 1 } : { scale: 0 }}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 300,
                                                    damping: 15,
                                                    delay: 0.6 + index * 0.1
                                                }}
                                                className="relative flex-shrink-0 mt-1"
                                            >
                                                <div className={cn(
                                                    "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300",
                                                    isDarkTheme
                                                        ? "bg-blue-500/20 group-hover/item:bg-blue-500/40"
                                                        : "bg-blue-100 group-hover/item:bg-blue-200"
                                                )}>
                                                    <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </motion.div>
                                            <span className={cn(
                                                "text-xl md:text-2xl lg:text-3xl font-medium transition-colors duration-300",
                                                textColor,
                                                isDarkTheme ? "group-hover/item:text-blue-300" : "group-hover/item:text-blue-600"
                                            )}>
                                                {feature}
                                            </span>
                                        </motion.li>
                                    ))}
                                </ul>
                            )}
                            {quote && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                    transition={{ duration: 0.7, delay: 0.8 }}
                                    className={cn(
                                        "pt-6 border-t relative",
                                        isDarkTheme ? "border-white/10" : "border-gray-200"
                                    )}
                                >
                                    {/* Animated quote mark */}
                                    <motion.span
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={isInView ? { opacity: 0.15, scale: 1 } : { opacity: 0, scale: 0.5 }}
                                        transition={{ duration: 0.5, delay: 0.9 }}
                                        className={cn(
                                            "absolute -top-2 -left-2 text-6xl md:text-7xl font-serif",
                                            isDarkTheme ? "text-blue-400" : "text-blue-600"
                                        )}
                                    >
                                        &quot;
                                    </motion.span>
                                    <p className={cn(
                                        "text-xl md:text-3xl lg:text-4xl font-medium leading-relaxed italic pl-6",
                                        textColor
                                    )}>
                                        {quote}
                                    </p>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Image Content - full bleed with hover effects */}
                        <motion.div
                            initial={{ opacity: 0, x: isRight ? -30 : 30 }}
                            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isRight ? -30 : 30 }}
                            transition={{ duration: 1, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                            className="flex-1 relative min-h-[50vh] md:min-h-0 overflow-hidden group cursor-pointer"
                        >
                            {/* Parallax + Hover zoom container */}
                            <motion.div
                                style={{ y: imageY, scale: imageScale }}
                                className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110"
                            >
                                <Image
                                    src={imageSrc}
                                    alt={imageAlt}
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </motion.div>

                            {/* Subtle gradient overlay that fades on hover */}
                            <div className={cn(
                                "absolute inset-0 transition-opacity duration-500",
                                isRight
                                    ? "bg-gradient-to-l from-transparent via-transparent to-black/20 group-hover:opacity-0"
                                    : "bg-gradient-to-r from-transparent via-transparent to-black/20 group-hover:opacity-0"
                            )} />

                            {/* Corner accent glow on hover */}
                            <div className={cn(
                                "absolute w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-700",
                                isDarkTheme ? "bg-blue-500/40" : "bg-blue-400/30",
                                isRight ? "bottom-8 left-8" : "bottom-8 right-8"
                            )} />
                        </motion.div>
                    </div>
                )}
            </div>
        </section>
    )
}
