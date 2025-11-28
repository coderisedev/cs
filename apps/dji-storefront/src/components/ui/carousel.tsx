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
        let intervalId: NodeJS.Timeout;

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
        const itemWidth = container.clientWidth; // Assuming one item per view for now, or we can calculate based on child

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
            {/* Scroll Container */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 pb-8"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {React.Children.map(children, (child) => (
                    <div className="snap-center shrink-0 w-[85vw] sm:w-[60vw] md:w-[40vw] lg:w-[30vw] xl:w-[22vw] first:pl-4 last:pr-4">
                        {child}
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-4">
                <button
                    onClick={togglePlay}
                    className="p-2 rounded-full bg-gray-200/50 hover:bg-gray-300/50 transition-colors backdrop-blur-sm"
                    aria-label={isPlaying ? "Pause" : "Play"}
                >
                    {isPlaying ? (
                        <Pause className="w-4 h-4 text-gray-800" />
                    ) : (
                        <Play className="w-4 h-4 text-gray-800 ml-0.5" />
                    )}
                </button>

                <div className="flex gap-2">
                    {Array.from({ length: itemCount }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => scrollToIndex(i)}
                            className={cn(
                                "w-2 h-2 rounded-full transition-all duration-300",
                                i === activeIndex
                                    ? "bg-gray-800 w-2"
                                    : "bg-gray-400 hover:bg-gray-600"
                            )}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
