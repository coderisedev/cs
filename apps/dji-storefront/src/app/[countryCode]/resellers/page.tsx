import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Globe2, Handshake } from "lucide-react";
import Image from "next/image";

export default function ResellersPage() {
    return (
        <div className="min-h-screen bg-background-primary">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src="https://img.aidenlux.com/collections/others.jpg"
                        alt="Global Business Meeting"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/60" />
                </div>
                <div className="container relative z-10 text-center text-white">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                        Join Our Global Network
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto">
                        Partner with the world&apos;s leading flight simulation hardware manufacturer.
                    </p>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20">
                <div className="container">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Why Partner With Us?</h2>
                        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                            Find an authorized Cockpit Simulator retailer near you. Our partners are trained to help you choose the right equipment for your setup.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Globe2,
                                title: "Global Brand Recognition",
                                description: "Leverage our established reputation for quality and innovation in the aviation industry."
                            },
                            {
                                icon: Handshake,
                                title: "Dedicated Support",
                                description: "Get priority technical support, marketing materials, and dedicated account management."
                            },
                            {
                                icon: CheckCircle2,
                                title: "Protected Margins",
                                description: "Enjoy competitive wholesale pricing and strictly enforced MAP policies to protect your profits."
                            }
                        ].map((item, i) => (
                            <div key={i} className="bg-background-secondary p-8 rounded-2xl text-center hover:shadow-lg transition-shadow">
                                <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <item.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                <p className="text-gray-600">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 text-white relative overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src="https://img.aidenlux.com/collections/addon.jpg"
                        alt="Flight Simulation Hardware"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60" />
                </div>
                <div className="container text-center relative z-10">
                    <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
                    <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                        Apply now to become an authorized reseller. Our team will review your application and get back to you within 48 hours.
                    </p>
                    <Button size="lg" className="bg-white text-black hover:bg-gray-200 rounded-full px-8">
                        Apply Now <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </div>
            </section>
        </div>
    );
}
