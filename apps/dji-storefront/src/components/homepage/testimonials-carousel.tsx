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
        quote: "I brought the CS A320 MCDU onboard a real A320 and put it side by side with the aircraft's unit. You couldn't tell which one is which in a picture! The touch is great, very fluid with no lag, and the high-quality screen makes every flight feel authentic.",
        author: "Pilot Jeff",
        role: "A320 Type-Rated Pilot, France",
        avatar: "https://img.aidenlux.com/avatars/avatar1.png",
        rating: 5,
    },
    {
        quote: "HUGELY impressed by the quality of these units, WOW! This is indeed a set of premium products for serious simmers. The build quality is exceptional and perfect for cockpit building enthusiasts who demand authenticity.",
        author: "Captain StreamFly",
        role: "Flight Sim Content Creator, Canada",
        avatar: "https://img.aidenlux.com/avatars/avatar2.png",
        rating: 5,
    },
    {
        quote: "I discovered the CS 320A CDU online and was immediately amazed. When I received it, it didn't disappoint! It just looks like the real thing. CS takes care of its customers and listens to feedback to improve their products.",
        author: "Thomas Berger",
        role: "Home Cockpit Builder, Germany",
        avatar: "https://img.aidenlux.com/avatars/avatar3.png",
        rating: 5,
    },
    {
        quote: "I use the CS MCDU on every flight I do with the A320 family on Microsoft Flight Simulator. The key travel, screen clarity and color all mirror the real box. If I ever build a home cockpit, I would definitely go for CS products!",
        author: "Marc Dupont",
        role: "Virtual Airline Pilot",
        avatar: "https://img.aidenlux.com/avatars/avatar4.png",
        rating: 5,
    },
    {
        quote: "I filmed unboxing videos and did multiple streams featuring CS products. Even on challenging approaches, the hardware performed flawlessly. My audience across YouTube, Facebook and Twitch can't stop asking about these units.",
        author: "High & Streamer",
        role: "Multi-Platform Flight Streamer",
        avatar: "https://img.aidenlux.com/avatars/avatar5.png",
        rating: 5,
    },
    {
        quote: "The CS hardware actually looked better than the real MCDU when I compared them! Of course it's brand new, but still... The product is very high quality and you feel it immediately. Perfect for anyone serious about flight simulation.",
        author: "Jean-Pierre Martin",
        role: "Airline First Officer, Belgium",
        avatar: "https://img.aidenlux.com/avatars/avatar6.png",
        rating: 5,
    },
    {
        quote: "As an A320 type-rated pilot, I would be very happy to showcase what great products CS has created for flight simulation. The attention to detail matches what we see in the real cockpit every day.",
        author: "Alessandro Romano",
        role: "Commercial Pilot & Reviewer, Italy",
        avatar: "https://img.aidenlux.com/avatars/avatar7.png",
        rating: 5,
    },
    {
        quote: "These are premium products for serious simmers! I get messages from cockpit building folks all the time asking about CS hardware. The quality speaks for itself and the user segment is clearly those who demand the best.",
        author: "Ryan Mitchell",
        role: "Flight Sim Community Leader, UK",
        avatar: "https://img.aidenlux.com/avatars/avatar8.png",
        rating: 5,
    },
];

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
    return (
        <div className="h-full p-1">
            <Card className="h-full bg-white border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="flex flex-col justify-between h-full p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
                    <div>
                        <div className="flex gap-0.5 sm:gap-1 mb-2 sm:mb-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={cn(
                                        "w-3 h-3 sm:w-4 sm:h-4",
                                        i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                    )}
                                />
                            ))}
                        </div>
                        <div className="relative">
                            <Quote className="absolute -top-2 -left-2 w-6 h-6 sm:w-8 sm:h-8 text-gray-100 rotate-180" />
                            <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed relative z-10 pl-3 sm:pl-4 line-clamp-5 sm:line-clamp-none">
                                &quot;{testimonial.quote}&quot;
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-100">
                        <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden ring-2 ring-gray-100 flex-shrink-0">
                            <Image
                                src={testimonial.avatar}
                                alt={testimonial.author}
                                fill
                                className="object-cover"
                                sizes="48px"
                            />
                        </div>
                        <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{testimonial.author}</p>
                            <p className="text-xs sm:text-sm text-gray-500 truncate">{testimonial.role}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export function TestimonialsCarousel() {
    return (
        <section className="py-10 sm:py-16 md:py-20 bg-gray-50 w-full overflow-hidden">
            <div className="container mx-auto px-4 mb-6 sm:mb-10 md:mb-12 text-center">
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 mb-2 sm:mb-4 tracking-tight">
                    What Pilots Say
                </h2>
                <p className="text-sm sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
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
