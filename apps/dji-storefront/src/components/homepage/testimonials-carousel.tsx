"use client";

import { Carousel } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Testimonial {
    quote: string;
    author: string;
    role: string;
    avatar: string;
    rating: number;
}

const testimonials: Testimonial[] = [
    {
        quote: "The CS 737X MCP & EFIS finally made our procedures training feel 'real'. The click, travel and resistance of every knob matches the aircraft closely enough that our cadets build muscle memory before they ever see the cockpit.",
        author: "Emily Watson",
        role: "Flight School Director",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
        rating: 5,
    },
    {
        quote: "I've flown the real 737 for years and was shocked how familiar the CS panel felt. Fonts, layout and backlighting are spot-on, and the heavy metal construction gives the same confidence as reaching for the real overhead.",
        author: "David Miller",
        role: "Airline Captain",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
        rating: 5,
    },
    {
        quote: "Setup was true plug-and-play. I plugged in the USB, fired up MSFS and was flying within minutes. No scripts, no config files, just pure immersion and the nicest hardware I've ever had on my sim desk.",
        author: "Michael Chen",
        role: "Home Cockpit Builder",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
        rating: 5,
    },
    {
        quote: "The A320 MCDU from CS is the first desktop unit where I completely forget it's a 'sim'. Key travel, screen clarity and color all mirror the real box, so my flows and data entry speed are exactly the same.",
        author: "Laura Schmidt",
        role: "A320 First Officer",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop",
        rating: 5,
    },
    {
        quote: "We run a busy university lab with dozens of students each day. The CS hardware has taken the abuse without a single failure. Solid metal, precise switches and a long warranty make it an easy choice for institutional use.",
        author: "Prof. Mark Johnson",
        role: "Aviation Program Coordinator",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
        rating: 5,
    },
    {
        quote: "As a content creator I've tried many panels, but the CS units instantly became the stars of my channel. Viewers constantly comment on how 'real' everything looks and sounds, and I don't have to fight the hardware on stream.",
        author: "Ryota Tanaka",
        role: "Flight Sim YouTuber",
        avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop",
        rating: 5,
    },
    {
        quote: "The throttle and panels from CS turned my simulator from a game into a training tool. The fine control in climb, descent and engine-out practice is something I've only felt before in certified trainers.",
        author: "Jason Lee",
        role: "Commercial Pilot & Instructor",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
        rating: 5,
    },
    {
        quote: "From the packaging to the first circuit in the pattern, everything screams high-end. The hardware feels like it was machined for a real aircraft, not a toy, and I'm confident I'll be using it for many years.",
        author: "Sofia Alvarez",
        role: "Flight Simulation Enthusiast",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
        rating: 5,
    },
];

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
    return (
        <div className="h-full p-1">
            <Card className="h-full bg-white border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="flex flex-col justify-between h-full p-8 space-y-6">
                    <div>
                        <div className="flex gap-1 mb-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={cn(
                                        "w-4 h-4",
                                        i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                    )}
                                />
                            ))}
                        </div>
                        <div className="relative">
                            <Quote className="absolute -top-2 -left-2 w-8 h-8 text-gray-100 rotate-180" />
                            <p className="text-lg text-gray-700 leading-relaxed relative z-10 pl-4">
                                &quot;{testimonial.quote}&quot;
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-gray-100">
                            <Image
                                src={testimonial.avatar}
                                alt={testimonial.author}
                                fill
                                className="object-cover"
                                sizes="48px"
                            />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">{testimonial.author}</p>

                            <p className="text-sm text-gray-500">{testimonial.role}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export function TestimonialsCarousel() {
    return (
        <section className="py-20 bg-gray-50 w-full overflow-hidden">
            <div className="container mx-auto px-4 mb-12 text-center">
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                    What Pilots Say
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Trusted by professional pilots and flight simulation enthusiasts worldwide.
                </p>
            </div>

            <Carousel autoPlayInterval={6000} className="w-full">
                {testimonials.map((testimonial, index) => (
                    <div key={index} className="h-full">
                        <TestimonialCard testimonial={testimonial} />
                    </div>
                ))}
            </Carousel>
        </section>
    );
}
