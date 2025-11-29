"use client"



const specs = [
    {
        category: "Dimensions & Weight",
        items: [
            { label: "Dimensions (Standard)", value: "240mm x 240mm x 400mm" },
            { label: "Dimensions (With Base)", value: "300mm x 400mm x 500mm" },
            { label: "Weight", value: "8.5 kg" },
        ],
    },
    {
        category: "Connectivity",
        items: [
            { label: "Interface", value: "USB-C" },
            { label: "Compatibility", value: "Windows 10/11, macOS" },
            { label: "Simulators", value: "MSFS 2020/2024, X-Plane 11/12, P3D" },
        ],
    },
    {
        category: "Materials",
        items: [
            { label: "Body", value: "Aviation Grade Aluminum Alloy" },
            { label: "Levers", value: "Reinforced Polymer" },
            { label: "Backlight", value: "Adjustable LED" },
        ],
    },
]

export function TechSpecs() {
    return (
        <section className="bg-black py-24 text-white">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mb-16 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold">Technical Specifications</h2>
                </div>
                <div className="grid gap-12 md:grid-cols-3 max-w-6xl mx-auto">
                    {specs.map((category) => (
                        <div key={category.category} className="space-y-6">
                            <h3 className="text-xl font-semibold text-primary-500 border-b border-white/10 pb-4">
                                {category.category}
                            </h3>
                            <ul className="space-y-4">
                                {category.items.map((item) => (
                                    <li key={item.label} className="flex justify-between text-sm md:text-base">
                                        <span className="text-white/60">{item.label}</span>
                                        <span className="font-medium">{item.value}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
