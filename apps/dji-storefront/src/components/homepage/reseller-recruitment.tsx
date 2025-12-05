"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function ResellerRecruitment() {
    return (
        <section className="relative w-full h-[600px] overflow-hidden group">
            {/* Background Image */}
            <div className="absolute inset-0">
                <Image
                    src="https://img.aidenlux.com/medusa-uploads/reseller.jpg"
                    alt="Global Network"
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative h-full container mx-auto px-4 flex flex-col justify-center">
                <div className="max-w-2xl space-y-8 animate-in slide-in-from-left duration-700 fade-in">
                    <div className="space-y-4">
                        <h2 className="text-sm md:text-base font-semibold text-blue-400 tracking-wider uppercase">
                            Global Partnership
                        </h2>
                        <h3 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                            Become a Global Reseller
                        </h3>
                        <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-xl">
                            Join our elite network of partners bringing professional flight simulation hardware to pilots worldwide. Unlock exclusive benefits and grow your business.
                        </p>
                    </div>

                    <Link href="/us/resellers">
                        <Button
                            size="lg"
                            className="bg-white text-black hover:bg-gray-200 rounded-full px-8 py-6 text-lg font-medium transition-all hover:scale-105"
                        >
                            Learn More <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
