import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Share2, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LatestAnnouncementPage() {
    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Hero Image */}
            <div className="relative h-[50vh] w-full">
                <Image
                    src="https://img.aidenlux.com/medusa-uploads/hero.jpg"
                    alt="Flight Deck"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                    <div className="container mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600 text-white text-sm font-medium mb-4">
                            Product Launch
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 max-w-4xl">
                            Introducing the Next Generation Flight Deck
                        </h1>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-8 relative z-10">
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-4xl mx-auto">
                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-8 border-b border-gray-100">
                        <div className="flex items-center gap-6 text-gray-500">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>November 28, 2025</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>Product Team</span>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Share2 className="w-4 h-4" /> Share
                        </Button>
                    </div>

                    {/* Content */}
                    <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
                        <p className="lead text-xl text-gray-900 font-medium">
                            We are thrilled to announce the launch of our most advanced flight simulation hardware yet. The new Force Feedback Yoke System represents a quantum leap in home cockpit realism.
                        </p>

                        <p>
                            After two years of intensive R&D and collaboration with real-world pilots, we've cracked the code on authentic control loading. No more springs, no more rubber bands—just pure, dynamic force feedback driven by high-torque brushless motors.
                        </p>

                        <h3 className="text-2xl font-bold text-gray-900 mt-8">Key Features</h3>
                        <ul className="space-y-2">
                            <li><strong>Dynamic Force Feedback:</strong> Feel the aerodynamic forces change with airspeed, trim, and turbulence.</li>
                            <li><strong>Direct Drive Motor:</strong> Zero cogging, infinite precision, and silent operation.</li>
                            <li><strong>Full Metal Construction:</strong> CNC-machined aluminum mechanism for commercial-grade durability.</li>
                            <li><strong>Cross-Platform Support:</strong> Native plugins for MSFS 2020/2024, X-Plane 11/12, and P3D.</li>
                        </ul>

                        <div className="my-8 relative h-64 md:h-96 rounded-xl overflow-hidden">
                            <Image
                                src="https://images.unsplash.com/photo-1559067515-bf7d799b6d42?q=80&w=2574&auto=format&fit=crop"
                                alt="Yoke Detail"
                                fill
                                className="object-cover"
                            />
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mt-8">Availability</h3>
                        <p>
                            Pre-orders open today with shipping expected to begin in mid-December. Early adopters will receive a limited edition flight bag and priority support status.
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
                        <Link href="/us/homepage">
                            <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent hover:text-blue-600">
                                <ArrowLeft className="w-4 h-4" /> Back to Home
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
