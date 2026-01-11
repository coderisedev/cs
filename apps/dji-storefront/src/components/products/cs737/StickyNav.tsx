"use client"

import { motion, useScroll, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import Link from "next/link"

const navLinks = [
    { label: "Overview", href: "#overview" },
    { label: "Features", href: "#features" },
    { label: "Tech Specs", href: "#specs" },
]

export function StickyNav() {
    const { scrollY } = useScroll()
    const [isVisible, setIsVisible] = useState(false)
    const [activeSection] = useState("overview")

    useEffect(() => {
        return scrollY.on("change", (latest) => {
            setIsVisible(latest > 500)
        })
    }, [scrollY])

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.nav
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                    className="fixed top-0 left-0 right-0 z-50"
                    style={{
                        // Apple-style glassmorphism
                        backgroundColor: "rgba(22, 22, 23, 0.8)",
                        backdropFilter: "saturate(180%) blur(20px)",
                        WebkitBackdropFilter: "saturate(180%) blur(20px)",
                    }}
                >
                    {/* Apple-style height: 44px for product nav */}
                    <div className="mx-auto max-w-[980px] flex h-[44px] items-center justify-between px-6 lg:px-0">
                        {/* Product Name */}
                        <div className="flex items-center gap-8">
                            <span className="text-[#f5f5f7] text-sm font-semibold">
                                CS737
                            </span>

                            {/* Navigation Links - Apple style */}
                            <div className="hidden md:flex items-center gap-6">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`text-xs font-normal transition-colors duration-200 ${
                                            activeSection === link.label.toLowerCase()
                                                ? "text-[#f5f5f7]"
                                                : "text-[#f5f5f7]/60 hover:text-[#f5f5f7]/80"
                                        }`}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Right Side - Price & CTA */}
                        <div className="flex items-center gap-4">
                            <span className="hidden sm:block text-[#86868b] text-xs font-normal">
                                From $799
                            </span>
                            <Link
                                href="#buy"
                                className="inline-flex items-center justify-center px-4 py-1.5 bg-[#0071e3] hover:bg-[#0077ED] text-white text-xs font-normal rounded-full transition-colors duration-200"
                            >
                                Buy
                            </Link>
                        </div>
                    </div>
                </motion.nav>
            )}
        </AnimatePresence>
    )
}
