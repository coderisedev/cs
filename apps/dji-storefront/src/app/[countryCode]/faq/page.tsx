"use client";

import { useState, useMemo } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Mail } from "lucide-react";

export default function FAQPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const faqCategories = [
        {
            title: "Orders & Shipping",
            questions: [
                {
                    q: "How long does shipping take?",
                    a: "We offer free standard shipping (10-15 business days) on all orders over $150. Expedited shipping options are available at checkout."
                },
                {
                    q: "Can I track my order?",
                    a: "Yes, once your order ships, you will receive a confirmation email with a tracking number. You can also track your order status in your account dashboard."
                },
                {
                    q: "Do you ship internationally?",
                    a: "Yes, we ship to over 50 countries worldwide. International shipping rates and delivery times vary by location."
                }
            ]
        },
        {
            title: "Product & Support",
            questions: [
                {
                    q: "Is the hardware compatible with MSFS 2024?",
                    a: "Yes, all our current generation hardware is fully compatible with Microsoft Flight Simulator 2020 and the upcoming 2024 release via our latest driver update."
                },
                {
                    q: "What is the warranty period?",
                    a: "We offer a comprehensive 2-year warranty on all hardware products. This covers manufacturing defects and hardware failures under normal use."
                },
                {
                    q: "Do you offer technical support?",
                    a: "Absolutely. Our dedicated support team is available via email to assist with setup, configuration, and troubleshooting."
                }
            ]
        },
        {
            title: "Returns & Refunds",
            questions: [
                {
                    q: "What is your return policy?",
                    a: "If any quality issue is identified with the product within 30 days after delivery and signing, we will offer a replacement or full refund upon verification. Returns due to non-quality-related issues are not accepted."
                },
                {
                    q: "How do I initiate a return?",
                    a: "To start a return, please email info@cockpit-simulator.com with your order number and issue description."
                }
            ]
        }
    ];

    // Filter FAQ based on search query
    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) {
            return faqCategories;
        }

        const query = searchQuery.toLowerCase();
        return faqCategories
            .map(category => ({
                ...category,
                questions: category.questions.filter(
                    item =>
                        item.q.toLowerCase().includes(query) ||
                        item.a.toLowerCase().includes(query)
                )
            }))
            .filter(category => category.questions.length > 0);
    }, [searchQuery]);

    const hasResults = filteredCategories.length > 0;
    const totalResults = filteredCategories.reduce((acc, cat) => acc + cat.questions.length, 0);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Section */}
            <section className="bg-neutral-900 text-white py-20 md:py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://img.aidenlux.com/medusa-uploads/faq.jpg')] bg-cover bg-center opacity-20" />
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">How can we help?</h1>
                    <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                        Find answers to common questions about our products, shipping, and support.
                    </p>

                    <div className="max-w-xl mx-auto relative">
                        <Input
                            type="text"
                            placeholder="Search for answers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-14 pl-12 pr-4 rounded-full bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20 backdrop-blur-sm transition-all"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>
                    {searchQuery && (
                        <p className="text-gray-400 mt-4">
                            {hasResults ? `Found ${totalResults} result${totalResults !== 1 ? 's' : ''}` : 'No results found'}
                        </p>
                    )}
                </div>
            </section>

            {/* FAQ Content */}
            <div className="container mx-auto px-4 -mt-10 relative z-20">
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-4xl mx-auto">
                    {hasResults ? (
                        filteredCategories.map((category, idx) => (
                            <div key={idx} className="mb-12 last:mb-0">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">{category.title}</h2>
                                <Accordion type="single" collapsible className="w-full">
                                    {category.questions.map((item, qIdx) => (
                                        <AccordionItem key={qIdx} value={`${idx}-${qIdx}`}>
                                            <AccordionTrigger className="text-left text-lg font-medium text-gray-800 hover:text-blue-600">
                                                {item.q}
                                            </AccordionTrigger>
                                            <AccordionContent className="text-gray-600 leading-relaxed text-base">
                                                {item.a}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                            <p className="text-gray-500">
                                Try different keywords or{" "}
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="text-blue-600 hover:underline"
                                >
                                    clear your search
                                </button>
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Contact Section */}
            <section className="container mx-auto px-4 py-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Still have questions?</h2>
                    <p className="text-gray-600">We&apos;re here to help. Contact our support team.</p>
                </div>

                <div className="flex justify-center max-w-4xl mx-auto">
                    <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all text-center group w-full max-w-sm">
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Mail className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Email Support</h3>
                        <p className="text-sm text-gray-500 mb-4">Response within 24h</p>
                        <Button variant="outline" className="rounded-full w-full" asChild>
                            <a href="mailto:info@cockpit-simulator.com">Send Email</a>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
