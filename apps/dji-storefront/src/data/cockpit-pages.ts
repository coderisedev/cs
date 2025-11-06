export type CockpitPage = {
  route: string
  title: string
  description: string
  sections: string[]
}

export const cockpitPages: CockpitPage[] = [
  {
    route: "/",
    title: "Home",
    description: "Full-screen hero, feature grid, testimonials, newsletter, support statistics",
    sections: ["Hero", "Feature grid", "Featured products", "Testimonials", "Newsletter"],
  },
  {
    route: "/products",
    title: "Product Catalogue",
    description: "Filters, sort, responsive grid, quick add actions",
    sections: ["Filter toolbar", "Product grid", "Quick add", "Pagination"],
  },
  {
    route: "/products/[handle]",
    title: "Product Detail",
    description: "Media gallery, specs, compatibility, sticky purchase card, reviews",
    sections: ["Gallery", "Purchase card", "Specifications", "Compatibility", "Reviews"],
  },
  {
    route: "/collections",
    title: "Collections",
    description: "Collection tiles with marketing copy and CTA banner",
    sections: ["Collection cards", "Marketing band"],
  },
  {
    route: "/collections/[handle]",
    title: "Collection Detail",
    description: "Hero, filtered product grid, related collections",
    sections: ["Hero", "Filters", "Product grid", "Related collections"],
  },
  {
    route: "/cart",
    title: "Cart",
    description: "Line items, upsell modules, summary widget, support banner",
    sections: ["Items", "Upsells", "Summary", "Support"],
  },
  {
    route: "/checkout",
    title: "Checkout",
    description: "Multi-step form for customer, shipping, payment with trust badges",
    sections: ["Customer", "Shipping", "Payment", "Trust"],
  },
  {
    route: "/account",
    title: "Account",
    description: "Tabs for overview, orders, profile, devices, support",
    sections: ["Overview", "Orders", "Profile", "Support"],
  },
  {
    route: "/blog",
    title: "Blog",
    description: "Featured hero, article grid, category pills",
    sections: ["Featured story", "Article cards", "Categories"],
  },
  {
    route: "/blog/[slug]",
    title: "Blog Post",
    description: "Rich text body, metadata, sticky TOC, related posts",
    sections: ["Hero", "Content", "Table of contents", "Related posts"],
  },
  {
    route: "/software",
    title: "Software",
    description: "Feature tabs, compatibility tables, FAQ accordion, version timeline",
    sections: ["Feature tabs", "Compatibility", "FAQs", "Version history"],
  },
]
