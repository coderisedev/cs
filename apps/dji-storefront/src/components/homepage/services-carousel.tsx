"use client";

import { useState, useEffect } from "react";
import { Carousel } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { Play, X } from "lucide-react";

interface ServiceCardProps {
    title: string;
    subtitle?: string;
    service: "Arcade" | "Fitness+" | "Music";
    bgClass: string;
    textColor?: string;
    image?: string;
    videoId?: string;
    onPlay?: (videoId: string) => void;
}

const ServiceCard = ({ title, subtitle, service, bgClass, textColor = "text-white", image, videoId, onPlay }: ServiceCardProps) => {
    return (
        <div
            className={cn("relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg group cursor-pointer transition-transform hover:scale-[1.01]", bgClass)}
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
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex items-end justify-between">
                <div className="max-w-[70%]">
                    {subtitle && (
                        <div className="text-xs md:text-sm font-semibold uppercase tracking-wider mb-1 opacity-90 text-white">
                            {subtitle}
                        </div>
                    )}
                    <h3 className={cn("text-xl md:text-3xl font-bold leading-tight", textColor)}>
                        {title}
                    </h3>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-sm md:text-base">
                         {service}
                    </span>
                </div>
            </div>

            {/* Play Button Overlay */}
            {videoId && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/20 backdrop-blur-md p-4 rounded-full hover:bg-white/30 transition-colors">
                        <Play className="w-8 h-8 text-white fill-white" />
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

    const slides: ServiceCardProps[] = [
        {
            title: "A TOUR Pro Golf",
            service: "Arcade",
            bgClass: "bg-blue-600",
            image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=2070&auto=format&fit=crop",
            videoId: "dQw4w9WgXcQ", // Rick Roll for demo (replace with real IDs)
        },
        {
            title: "Strength with Gregg",
            service: "Fitness+",
            bgClass: "bg-stone-800",
            image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop",
            videoId: "g_tea8ZNk5A", // Fitness video
        },
        {
            title: "A-List Pop",
            subtitle: "Ed Sheeran",
            service: "Music",
            bgClass: "bg-pink-500",
            image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070&auto=format&fit=crop",
            videoId: "2Vv-BfVoq4g", // Ed Sheeran
        },
        {
            title: "Balatro+",
            service: "Arcade",
            bgClass: "bg-red-600",
            image: "https://images.unsplash.com/photo-1605218427368-35b0f996d916?q=80&w=2070&auto=format&fit=crop",
            videoId: "u9N9G2F5E-U", // Balatro trailer
        },
        {
            title: "Meditation for Sleep",
            service: "Fitness+",
            bgClass: "bg-indigo-900",
            image: "https://images.unsplash.com/photo-1515023115689-589c33041697?q=80&w=2070&auto=format&fit=crop",
            videoId: "inpok4MKVLM", // Meditation
        },
        {
            title: "NBA 2K24",
            service: "Arcade",
            bgClass: "bg-orange-600",
            image: "https://images.unsplash.com/photo-1546519638-68e109498ad0?q=80&w=2070&auto=format&fit=crop",
            videoId: "4i86Cq8g30c", // NBA 2K24
        },
        {
            title: "Today's Hits",
            subtitle: "Apple Music",
            service: "Music",
            bgClass: "bg-purple-600",
            image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop",
            videoId: "fHI8X4OXluQ", // Blinding Lights
        },
        {
            title: "Hello Kitty Island",
            service: "Arcade",
            bgClass: "bg-pink-400",
            image: "https://images.unsplash.com/photo-1566576912902-1d61f1262d0c?q=80&w=2070&auto=format&fit=crop",
            videoId: "0p1896Qe4t0", // Hello Kitty
        },
    ];

    return (
        <section className="py-12 bg-white w-full overflow-hidden">
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
