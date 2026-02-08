"use client"

import { motion, useScroll, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import Link from "next/link"

const navLinks = [
    { label: "Overview", href: "#overview" },
    { label: "Motors", href: "#motor" },
    { label: "Throttle", href: "#throttle" },
    { label: "Trim & Flaps", href: "#trim" },
    { label: "Tech Specs", href: "#specs" },
]

export function StickyNav() {
    const { scrollY } = useScroll()
    const [isVisible, setIsVisible] = useState(false)
    const [activeSection, setActiveSection] = useState("")

    useEffect(() => {
        return scrollY.on("change", (latest) => {
            setIsVisible(latest > 500)
        })
    }, [scrollY])

    // Track active section
    useEffect(() => {
        const handleScroll = () => {
            const sections = navLinks.map(link => link.href.replace("#", ""))
            const scrollPosition = window.scrollY + 100

            for (let i = sections.length - 1; i >= 0; i--) {
                const section = document.getElementById(sections[i])
                if (section && section.offsetTop <= scrollPosition) {
                    setActiveSection(sections[i])
                    break
                }
            }
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.nav
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                    className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-xl"
                >
                    <div className="container mx-auto flex h-14 items-center justify-between px-4">
                        {/* Product Name */}
                        <div className="flex items-center gap-8">
                            <span className="text-white text-base font-semibold">
                                CS737 Pro
                            </span>

                            {/* Navigation Links */}
                            <div className="hidden md:flex items-center gap-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`
                                            px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200
                                            ${activeSection === link.href.replace("#", "")
                                                ? "text-white bg-white/10"
                                                : "text-white/60 hover:text-white/80"
                                            }
                                        `}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Right Side */}
                        <div className="flex items-center gap-4">
                            <span className="hidden sm:block text-white/60 text-sm">
                                From $3,599
                            </span>
                            <Link
                                href="#buy"
                                className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 font-medium text-sm"
                            >
                                Order
                            </Link>
                        </div>
                    </div>
                </motion.nav>
            )}
        </AnimatePresence>
    )
}
