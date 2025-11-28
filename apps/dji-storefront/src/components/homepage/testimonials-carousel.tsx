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
        quote: "The cockpit hardware quality is exceptional. Every interaction feels like the real aircraft, making our training sessions more effective.",
        author: "Captain Sarah Johnson",
        role: "Airbus Training Lead",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop",
        rating: 5,
    },
    {
        quote: "Setup was plug-and-play. We were airborne in minutes and the DJI styling brings a premium polish to every panel.",
        author: "Michael Chen",
        role: "Home Simulator Builder",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
        rating: 5,
    },
    {
        quote: "Our students love the tactile realism. The panels integrate perfectly with MSFS and X-Plane with zero scripting.",
        author: "Emily Watson",
        role: "Flight School Director",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
        rating: 5,
    },
    {
        quote: "I've tried many yokes, but this one provides the most precise feedback I've ever felt outside a real Cessna.",
        author: "David Miller",
        role: "Private Pilot",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
        rating: 5,
    },
    {
        quote: "The build quality is simply outstanding. Heavy metal construction that feels like it will last a lifetime.",
        author: "James Wilson",
        role: "Aviation Tech Reviewer",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
        rating: 4,
    },
    {
        quote: "Finally, a throttle quadrant that matches the resistance of the real thing. Essential for practicing engine-out procedures.",
        author: "Jessica Lee",
        role: "Commercial Pilot",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
        rating: 5,
    },
    {
        quote: "The integration with the glass cockpit software is seamless. It's changed how I practice my instrument approaches.",
        author: "Robert Taylor",
        role: "IFR Student",
        avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop",
        rating: 5,
    },
    {
        quote: "Customer support helped me configure my custom mapping in minutes. Truly professional service for professional gear.",
        author: "Lisa Anderson",
        role: "Sim Enthusiast",
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
