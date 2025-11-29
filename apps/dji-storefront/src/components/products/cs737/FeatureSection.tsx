"use client"

import { motion, useInView } from "framer-motion"
import Image from "next/image"
import { useRef } from "react"
import { cn } from "@/lib/utils"

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
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-20% 0px" })

    const isCenter = align === "center"
    const isRight = align === "right"

    return (
        <section
            ref={ref}
            className={cn(
                "relative py-24 md:py-32 overflow-hidden",
                theme === "dark" ? "bg-black text-white" : "bg-white text-black"
            )}
        >
            <div className="container mx-auto px-4 md:px-6">
                <div
                    className={cn(
                        "flex flex-col gap-12 md:gap-24 items-center",
                        isCenter ? "text-center" : "md:flex-row",
                        isRight && "md:flex-row-reverse"
                    )}
                >
                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={cn("flex-1 space-y-6", isCenter && "max-w-3xl mx-auto")}
                    >
                        <h3 className="text-lg font-medium tracking-wider text-primary-500 uppercase">
                            {title}
                        </h3>
                        <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
                            {subtitle}
                        </h2>
                        <p
                            className={cn(
                                "text-lg md:text-xl leading-relaxed",
                                theme === "dark" ? "text-white/70" : "text-black/70"
                            )}
                        >
                            {description}
                        </p>
                        {quote && (
                            <blockquote
                                className={cn(
                                    "mt-8 border-l-4 pl-6 italic text-lg",
                                    theme === "dark"
                                        ? "border-white/20 text-white/90"
                                        : "border-black/20 text-black/90"
                                )}
                            >
                                &ldquo;{quote}&rdquo;
                            </blockquote>
                        )}
                    </motion.div>

                    {/* Image Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                        className={cn("flex-1 w-full", isCenter && "mt-12")}
                    >
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-gray-900/50">
                            <Image
                                src={imageSrc}
                                alt={imageAlt}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
