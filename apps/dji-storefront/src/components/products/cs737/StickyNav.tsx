"use client"

import { motion, useScroll } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function StickyNav() {
    const { scrollY } = useScroll()
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        return scrollY.onChange((latest) => {
            setIsVisible(latest > 600)
        })
    }, [scrollY])

    return (
        <motion.div
            initial={{ y: -100 }}
            animate={{ y: isVisible ? 0 : -100 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md"
        >
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                <div className="text-sm font-semibold text-white">
                    CS737 Throttle Console
                </div>
                <div className="flex items-center gap-4">
                    <span className="hidden text-sm text-white/70 sm:inline-block">
                        From $799
                    </span>
                    <Button size="sm" className="rounded-full bg-primary-600 hover:bg-primary-700 text-white px-6">
                        Buy
                    </Button>
                </div>
            </div>
        </motion.div>
    )
}
