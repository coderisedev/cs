"use client";

import { Carousel } from "@/components/ui/carousel";
import { cn } from "@/components/ui/cn";
import { Play } from "lucide-react";

interface ServiceCardProps {
    title: string;
    subtitle?: string;
    service: "Arcade" | "Fitness+" | "Music";
    bgClass: string;
    textColor?: string;
    image?: string;
}

const ServiceCard = ({ title, subtitle, service, bgClass, textColor = "text-white", image }: ServiceCardProps) => {
    return (
        <div className={cn("relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg group cursor-pointer transition-transform hover:scale-[1.01]", bgClass)}>
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

            {/* Play Button Overlay (Optional, for video feel) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/20 backdrop-blur-md p-4 rounded-full">
                    <Play className="w-8 h-8 text-white fill-white" />
                </div>
            </div>
        </div>
    );
};

export function ServicesCarousel() {
    const slides: ServiceCardProps[] = [
        {
            title: "A TOUR Pro Golf",
            service: "Arcade",
            bgClass: "bg-blue-600",
            image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=2070&auto=format&fit=crop", // Golf image
        },
        {
            title: "Strength with Gregg",
            service: "Fitness+",
            bgClass: "bg-stone-800",
            image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop", // Gym image
        },
        {
            title: "A-List Pop",
            subtitle: "Ed Sheeran",
            service: "Music",
            bgClass: "bg-pink-500",
            image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070&auto=format&fit=crop", // Music/Abstract
        },
        {
            title: "Balatro+",
            service: "Arcade",
            bgClass: "bg-red-600",
            image: "https://images.unsplash.com/photo-1605218427368-35b0f996d916?q=80&w=2070&auto=format&fit=crop", // Cards/Abstract
        },
    ];

    return (
        <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
                <Carousel autoPlayInterval={5000}>
                    {slides.map((slide, index) => (
                        <ServiceCard key={index} {...slide} />
                    ))}
                </Carousel>
            </div>
        </section>
    );
}
