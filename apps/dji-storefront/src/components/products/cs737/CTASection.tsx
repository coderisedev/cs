"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import Link from "next/link"
import Image from "next/image"

export function CTASection() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-10% 0px" })

    return (
        <section ref={ref} className="relative bg-black py-20 md:py-32 lg:py-40 overflow-hidden">
            {/* Background subtle gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0a0a] to-black" />

            <div className="relative mx-auto max-w-[980px] px-6 lg:px-0">
                {/* Apple-style centered CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                    className="text-center"
                >
                    {/* Product Image */}
                    <div className="relative w-full max-w-2xl mx-auto mb-12 md:mb-16">
                        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl md:rounded-3xl">
                            <Image
                                src="https://images.unsplash.com/photo-1559067515-bf7d799b6d42?q=80&w=2574&auto=format&fit=crop"
                                alt="CS737 Throttle Console"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 672px"
                            />
                            {/* Subtle overlay for text readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        </div>
                    </div>

                    {/* Headline */}
                    <h2 className="text-[#f5f5f7] text-4xl md:text-5xl lg:text-[56px] font-semibold tracking-[-0.015em] leading-[1.08] mb-4">
                        Ready for takeoff.
                    </h2>

                    {/* Price */}
                    <p className="text-[#86868b] text-xl md:text-2xl font-normal mb-8">
                        From <span className="text-[#f5f5f7]">$799</span>
                    </p>

                    {/* CTA Buttons - Apple style */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                        <Link
                            href="#"
                            className="inline-flex items-center justify-center px-8 py-3 bg-[#0071e3] hover:bg-[#0077ED] text-white text-lg font-normal rounded-full transition-colors duration-300 min-w-[160px]"
                        >
                            Buy
                        </Link>
                        <Link
                            href="#"
                            className="inline-flex items-center justify-center text-[#2997ff] hover:text-[#2997ff]/80 text-lg font-normal transition-colors duration-300 group"
                        >
                            Compare models
                            <span className="ml-1 group-hover:translate-x-0.5 transition-transform duration-300">
                                &rsaquo;
                            </span>
                        </Link>
                    </div>
                </motion.div>

                {/* Apple-style footer links */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-20 md:mt-24 pt-8 border-t border-[#424245]"
                >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left">
                        <div>
                            <div className="text-[#f5f5f7] text-2xl md:text-3xl font-semibold mb-2">
                                9
                            </div>
                            <p className="text-[#86868b] text-sm font-normal">
                                Motors in total
                            </p>
                        </div>
                        <div>
                            <div className="text-[#f5f5f7] text-2xl md:text-3xl font-semibold mb-2">
                                8.5 kg
                            </div>
                            <p className="text-[#86868b] text-sm font-normal">
                                All-metal weight
                            </p>
                        </div>
                        <div>
                            <div className="text-[#f5f5f7] text-2xl md:text-3xl font-semibold mb-2">
                                USB-C
                            </div>
                            <p className="text-[#86868b] text-sm font-normal">
                                Single cable connection
                            </p>
                        </div>
                        <div>
                            <div className="text-[#f5f5f7] text-2xl md:text-3xl font-semibold mb-2">
                                1:1
                            </div>
                            <p className="text-[#86868b] text-sm font-normal">
                                Real aircraft scale
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
