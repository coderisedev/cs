"use client";

import * as React from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface CarouselProps {
    children: React.ReactNode;
    className?: string;
    autoPlayInterval?: number;
}

export function Carousel({
    children,
    className,
    autoPlayInterval = 4000,
}: CarouselProps) {
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = React.useState(true);
    const [activeIndex, setActiveIndex] = React.useState(0);
    const [itemCount, setItemCount] = React.useState(0);

    // Count children to know how many dots to render
    React.useEffect(() => {
        if (scrollContainerRef.current) {
            setItemCount(scrollContainerRef.current.children.length);
        }
    }, [children]);

    // Handle scroll events to update active index
    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        const scrollPosition = container.scrollLeft;
        const itemWidth = container.clientWidth;
        const newIndex = Math.round(scrollPosition / itemWidth);
        setActiveIndex(newIndex);
    };

    // Auto-play functionality
    React.useEffect(() => {
        let intervalId: ReturnType<typeof setTimeout>;

        if (isPlaying && itemCount > 0) {
            intervalId = setInterval(() => {
                if (!scrollContainerRef.current) return;

                const nextIndex = (activeIndex + 1) % itemCount;
                scrollToIndex(nextIndex);
            }, autoPlayInterval);
        }

        return () => clearInterval(intervalId);
    }, [isPlaying, activeIndex, itemCount, autoPlayInterval]);

    const scrollToIndex = (index: number) => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;


        // Better approach: find the child element and scroll to it
        const child = container.children[index] as HTMLElement;
        if (child) {
            container.scrollTo({
                left: child.offsetLeft,
                behavior: "smooth",
            });
        }
    };

    const togglePlay = () => setIsPlaying(!isPlaying);

    return (
        <div className={cn("relative group", className)}>
            {/* Scroll Container with touch optimizations */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 pb-8 touch-pan-x overscroll-x-contain [-webkit-overflow-scrolling:touch]"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {React.Children.map(children, (child) => (
                    <div className="snap-center shrink-0 w-[90vw] xs:w-[85vw] sm:w-[60vw] md:w-[40vw] lg:w-[30vw] xl:w-[22vw] first:pl-3 xs:first:pl-4 last:pr-3 xs:last:pr-4">
                        {child}
                    </div>
                ))}
            </div>

            {/* Controls with touch-friendly sizing */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-3 xs:gap-4 pb-safe">
                <button
                    onClick={togglePlay}
                    className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-gray-200/50 active:bg-gray-300/50 transition-colors backdrop-blur-sm touch-manipulation [-webkit-tap-highlight-color:transparent]"
                    aria-label={isPlaying ? "Pause" : "Play"}
                >
                    {isPlaying ? (
                        <Pause className="w-4 h-4 text-gray-800" />
                    ) : (
                        <Play className="w-4 h-4 text-gray-800 ml-0.5" />
                    )}
                </button>

                <div className="flex gap-2 xs:gap-3">
                    {Array.from({ length: itemCount }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => scrollToIndex(i)}
                            className={cn(
                                "min-w-[24px] min-h-[24px] flex items-center justify-center rounded-full transition-all duration-300 touch-manipulation [-webkit-tap-highlight-color:transparent]",
                                i === activeIndex
                                    ? "bg-gray-800"
                                    : "bg-gray-400 active:bg-gray-600"
                            )}
                            aria-label={`Go to slide ${i + 1}`}
                        >
                            <span className={cn(
                                "w-2 h-2 rounded-full",
                                i === activeIndex ? "bg-white" : "bg-transparent"
                            )} />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
