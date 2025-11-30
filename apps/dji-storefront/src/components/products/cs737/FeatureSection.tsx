"use client"

import { motion, useInView, useScroll, useTransform } from "framer-motion"
import Image from "next/image"
import { useRef } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface FeatureSectionProps {
    title: string
    subtitle: string
    description: string
    quote?: string
    imageSrc: string
    imageAlt: string
    align?: "left" | "right" | "center"
    theme?: "dark" | "light"
}

export function FeatureSection({
    title,
    subtitle,
    description,
    quote,
    imageSrc,
    imageAlt,
    align = "left",
    theme = "dark",
}: FeatureSectionProps) {
    const sectionRef = useRef(null)
    const isInView = useInView(sectionRef, { once: true, margin: "-10% 0px" })

    // Parallax effect for image
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"],
    })
    const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"])

    const isCenter = align === "center"
    const isRight = align === "right"

    // Apple design system colors
    const isDark = theme === "dark"
    const bgColor = isDark ? "bg-black" : "bg-[#f5f5f7]"
    const textColor = isDark ? "text-[#f5f5f7]" : "text-[#1d1d1f]"
    const textSecondary = isDark ? "text-[#86868b]" : "text-[#86868b]"
    const accentColor = "text-[#2997ff]"

    return (
        <section
            ref={sectionRef}
            className={cn(
                "relative py-20 md:py-32 lg:py-40 overflow-hidden",
                bgColor,
                textColor
            )}
        >
            {/* Apple-style max-width container */}
            <div className="mx-auto max-w-[980px] px-6 lg:px-0">
                {isCenter ? (
                    // Center aligned layout - Apple style full-width feature
                    <div className="flex flex-col items-center text-center">
                        {/* Text Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                            className="max-w-3xl mb-12 md:mb-16"
                        >
                            <p className={cn("text-sm md:text-base font-medium mb-3", accentColor)}>
                                {title}
                            </p>
                            <h2 className="text-4xl md:text-5xl lg:text-[56px] font-semibold tracking-[-0.015em] leading-[1.08] mb-6">
                                {subtitle}
                            </h2>
                            <p className={cn("text-lg md:text-xl leading-[1.5] font-normal", textSecondary)}>
                                {description}
                            </p>
                            {quote && (
                                <p className={cn("mt-8 text-xl md:text-2xl font-medium leading-[1.4]", textColor)}>
                                    {quote}
                                </p>
                            )}
                        </motion.div>

                        {/* Image - Full width with subtle reveal */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                            transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                            className="w-full max-w-4xl"
                        >
                            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl md:rounded-3xl">
                                <motion.div style={{ y: imageY }} className="absolute inset-0 h-[110%]">
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
                    // Left/Right aligned layout - Apple style split feature
                    <div
                        className={cn(
                            "flex flex-col gap-12 md:gap-16 lg:gap-24 items-center",
                            "md:flex-row",
                            isRight && "md:flex-row-reverse"
                        )}
                    >
                        {/* Text Content */}
                        <motion.div
                            initial={{ opacity: 0, x: isRight ? 30 : -30 }}
                            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isRight ? 30 : -30 }}
                            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                            className="flex-1 max-w-lg"
                        >
                            <p className={cn("text-sm md:text-base font-medium mb-3", accentColor)}>
                                {title}
                            </p>
                            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-semibold tracking-[-0.015em] leading-[1.1] mb-5">
                                {subtitle}
                            </h2>
                            <p className={cn("text-base md:text-lg leading-[1.5] font-normal mb-6", textSecondary)}>
                                {description}
                            </p>
                            {quote && (
                                <p className={cn("text-lg md:text-xl font-medium leading-[1.4] pt-4 border-t",
                                    isDark ? "border-white/10" : "border-black/10",
                                    textColor
                                )}>
                                    {quote}
                                </p>
                            )}
                            {/* Apple-style learn more link */}
                            <Link
                                href="#"
                                className={cn(
                                    "inline-flex items-center mt-6 text-lg font-normal transition-colors duration-300 group",
                                    accentColor,
                                    "hover:text-[#2997ff]/80"
                                )}
                            >
                                Learn more
                                <span className="ml-1 group-hover:translate-x-0.5 transition-transform duration-300">
                                    &rsaquo;
                                </span>
                            </Link>
                        </motion.div>

                        {/* Image Content */}
                        <motion.div
                            initial={{ opacity: 0, x: isRight ? -30 : 30 }}
                            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isRight ? -30 : 30 }}
                            transition={{ duration: 1, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                            className="flex-1 w-full"
                        >
                            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl md:rounded-3xl">
                                <motion.div style={{ y: imageY }} className="absolute inset-0 h-[110%]">
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
