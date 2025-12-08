"use client";

import { useState, useEffect } from "react";
import { Carousel } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { Play, X } from "lucide-react";

interface ServiceCardProps {
    title: string;
    subtitle?: string;
    bgClass: string;
    textColor?: string;
    image?: string;
    videoId?: string;
    onPlay?: (videoId: string) => void;
}

const ServiceCard = ({ title, subtitle, bgClass, textColor = "text-white", image, videoId, onPlay }: ServiceCardProps) => {
    return (
        <div
            className={cn("relative w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden shadow-lg group cursor-pointer transition-transform hover:scale-[1.01]", bgClass)}
            onClick={() => videoId && onPlay?.(videoId)}
        >
            {/* Background Image/Gradient */}
            {image && (
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url(${image})` }}
                />
            )}

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
                <div>
                    {subtitle && (
                        <div className="text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wider mb-0.5 sm:mb-1 opacity-90 text-white">
                            {subtitle}
                        </div>
                    )}
                    <h3 className={cn("text-base sm:text-xl md:text-3xl font-bold leading-tight", textColor)}>
                        {title}
                    </h3>
                </div>
            </div>

            {/* Play Button Overlay */}
            {videoId && (
                <div className="absolute inset-0 flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/20 backdrop-blur-md p-2 sm:p-4 rounded-full hover:bg-white/30 transition-colors">
                        <Play className="w-5 h-5 sm:w-8 sm:h-8 text-white fill-white" />
                    </div>
                </div>
            )}
        </div>
    );
};

const VideoModal = ({ videoId, onClose }: { videoId: string; onClose: () => void }) => {
    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                    title="YouTube video player"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                />
            </div>
        </div>
    );
};

export function ServicesCarousel() {
    const [activeVideo, setActiveVideo] = useState<string | null>(null);

    const slides: Omit<ServiceCardProps, 'onPlay'>[] = [
        {
            title: "CS 737X MCP & EFIS Review",
            subtitle: "Swiss001",
            bgClass: "bg-blue-600",
            image: "https://img.youtube.com/vi/GZJbGZRfnAM/hqdefault.jpg",
            videoId: "GZJbGZRfnAM",
        },
        {
            title: "CS 737X CDU & MCP Review",
            subtitle: "LuxPlanes",
            bgClass: "bg-stone-800",
            image: "https://img.youtube.com/vi/9JLx2kXy5H8/hqdefault.jpg",
            videoId: "9JLx2kXy5H8",
        },
        {
            title: "CS 737X CDU, MCP & EFIS Review",
            subtitle: "RyotaSim",
            bgClass: "bg-pink-500",
            image: "https://img.youtube.com/vi/TPNXKbAKKaA/hqdefault.jpg",
            videoId: "TPNXKbAKKaA",
        },
        {
            title: "CS A320 FCU & EFIS Review",
            subtitle: "MuiMui",
            bgClass: "bg-red-600",
            image: "https://img.youtube.com/vi/Wh0gU0xTvMw/hqdefault.jpg",
            videoId: "Wh0gU0xTvMw",
        },
        {
            title: "CS A320 MCDU Review & Comparison",
            subtitle: "MuiMui",
            bgClass: "bg-indigo-900",
            image: "https://img.youtube.com/vi/vGZGx_ueQaQ/hqdefault.jpg",
            videoId: "vGZGx_ueQaQ",
        },
        {
            title: "CS MCDU Unboxing & Review",
            subtitle: "iFlySimX",
            bgClass: "bg-orange-600",
            image: "https://img.youtube.com/vi/hS5eJ7vP3hM/hqdefault.jpg",
            videoId: "hS5eJ7vP3hM",
        },
        {
            title: "CS A320 MCDU Live Test Review",
            subtitle: "Flight Streamer",
            bgClass: "bg-purple-600",
            image: "https://img.youtube.com/vi/VIeyXEN1ask/hqdefault.jpg",
            videoId: "VIeyXEN1ask",
        },
    ];

    return (
        <section className="py-8 sm:py-10 md:py-12 bg-white w-full overflow-hidden">
            <Carousel autoPlayInterval={5000} className="w-full">
                {slides.map((slide, index) => (
                    <ServiceCard
                        key={index}
                        {...slide}
                        onPlay={setActiveVideo}
                    />
                ))}
            </Carousel>

            {activeVideo && (
                <VideoModal
                    videoId={activeVideo}
                    onClose={() => setActiveVideo(null)}
                />
            )}
        </section>
    );
}
