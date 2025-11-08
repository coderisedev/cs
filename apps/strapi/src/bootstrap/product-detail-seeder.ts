import type { Core } from '@strapi/strapi'

type SpecSeed = {
  label: string
  value: string
}

type FeatureSeed = {
  heading: string
  body: string
}

type FaqSeed = {
  question: string
  answer: string
}

type DownloadSeed = {
  label: string
  external_url?: string
}

type ProductDetailSeed = {
  title: string
  handle: string
  hero_excerpt: string
  overview: string
  specs: SpecSeed[]
  features: FeatureSeed[]
  faq: FaqSeed[]
  downloads: DownloadSeed[]
  shipping_note: string
  seo: {
    meta_title: string
    meta_description: string
    canonical_url: string
  }
}

const PRODUCT_DETAIL_SEEDS: ProductDetailSeed[] = [
  {
    title: 'Medusa T-Shirt',
    handle: 't-shirt',
    hero_excerpt:
      'Ultra-soft long-staple cotton with a microvent weave keeps this everyday tee breathable on long shifts and late flights.',
    overview:
      '<p>The Medusa T-Shirt is the foundation piece for every cockpit simulator fan. We knit the fabric with long-staple cotton that has been mercerized for strength, then brushed the interior for a broken-in feel on day one. A dash of stretch keeps the silhouette sharp even after countless washes.</p><p>Each seam is taped and reinforced so the tee sits flat under harnesses or hoodies. The shoulder line is slightly forward, preventing headset straps from rubbing. Wear it solo or pair it with the Medusa Sweatshirt for an effortless studio-to-hangar uniform.</p>',
    specs: [
      { label: 'Fabric', value: '98% long-staple cotton, 2% elastane' },
      { label: 'Fabric Weight', value: '180 GSM' },
      { label: 'Fit', value: 'Relaxed unisex silhouette' },
      { label: 'Finishing', value: 'Pre-washed, anti-pill enzyme finish' },
      { label: 'Care', value: 'Machine wash cold, tumble dry low' },
    ],
    features: [
      {
        heading: 'Cloud-weight knit',
        body: '<p>The custom jersey balances drape and structure so the tee never clings to hardware or straps. Side vents release heat while taped shoulders keep the neckline crisp.</p>',
      },
      {
        heading: 'Colorfast dye bath',
        body: '<p>We double-dye every panel and finish with UV blocking to keep black inks inky and whites bright, even after runway-level sunlight exposure.</p>',
      },
      {
        heading: 'No-fuss layering',
        body: '<p>Flatlock seams disappear under jackets and simulator harnesses. The slightly longer back hem stays tucked through long missions.</p>',
      },
    ],
    faq: [
      {
        question: 'How does the tee fit?',
        answer: '<p>The Medusa T-Shirt has a relaxed drape that runs true to size. Size down if you prefer a trim silhouette, or stay with your usual size for easy layering.</p>',
      },
      {
        question: 'Will it shrink after washing?',
        answer: '<p>No noticeable shrink. Each tee is pre-washed and finished to lock in the pattern. Follow the care guide to maintain the handfeel.</p>',
      },
      {
        question: 'Is the fabric see-through?',
        answer: '<p>The 180 GSM jersey is opaque in both colorways. White retains a clean finish thanks to the dense knit structure.</p>',
      },
    ],
    downloads: [
      {
        label: 'Size Guide (PDF)',
        external_url: 'https://www.medusajs.com/downloads/medusa-tee-size-guide.pdf',
      },
      {
        label: 'Care Checklist',
        external_url: 'https://www.medusajs.com/downloads/medusa-tee-care.pdf',
      },
    ],
    shipping_note:
      '<p>Ships within 48 hours from our EU and US hubs. Complimentary returns within 30 days. Items are lightly folded to reduce creasing and ship in recycled mailers.</p>',
    seo: {
      meta_title: 'Medusa T-Shirt | Everyday Flight Tee',
      meta_description:
        'Breathable, long-staple cotton tee tuned for simulator sessions. Discover specs, care details, and downloads for the Medusa T-Shirt.',
      canonical_url: 'https://www.medusajs.com/products/t-shirt',
    },
  },
  {
    title: 'Medusa Sweatshirt',
    handle: 'sweatshirt',
    hero_excerpt:
      'Thermal brushed interior, structured shoulders, and a modern cropped rib give this sweatshirt studio-ready polish.',
    overview:
      '<p>The Medusa Sweatshirt pairs a dense French terry face with a brushed fleece backer that traps warmth without bulk. We shaped the sleeves with a subtle curve so the cuffs sit cleanly above controls, while the rib side panels allow natural movement.</p><p>Inside, the looped terry is carbon-brushed for softness. The result: a premium layer that looks intentional in video calls yet feels like a favorite crewneck.</p>',
    specs: [
      { label: 'Fabric', value: '83% organic cotton, 17% recycled poly' },
      { label: 'Fabric Weight', value: '320 GSM' },
      { label: 'Structure', value: 'Double-needle shoulder and cuff reinforcement' },
      { label: 'Neckline', value: 'Wide crew with stay-tape' },
      { label: 'Care', value: 'Turn inside out, cold wash, lay flat to dry' },
    ],
    features: [
      {
        heading: 'Temperature control',
        body: '<p>Recycled poly fibers wick interior moisture so you stay comfortable through long simulator sessions and content shoots.</p>',
      },
      {
        heading: 'Studio silhouette',
        body: '<p>The cropped rib hem sits at the hip for a sharp profile on camera while still covering hardware belts.</p>',
      },
      {
        heading: 'Reinforced stress zones',
        body: '<p>Hidden bar-tacks at the underarm and pockets keep the sweatshirt from bagging out after heavy wear.</p>',
      },
    ],
    faq: [
      {
        question: 'Is the sweatshirt unisex?',
        answer: '<p>Yes. The pattern blocks were built for all body types with enough ease for layering a tee underneath.</p>',
      },
      {
        question: 'Does it have pockets?',
        answer: '<p>Discrete side-entry pockets are integrated into the rib panels for carrying cards or cables.</p>',
      },
      {
        question: 'Will the fleece shed?',
        answer: '<p>No. The interior fibers are pre-washed and sheared, eliminating fuzz transfer on first wear.</p>',
      },
    ],
    downloads: [
      {
        label: 'Layering Guide',
        external_url: 'https://www.medusajs.com/downloads/medusa-sweatshirt-style-guide.pdf',
      },
      {
        label: 'Fabric Certificate',
        external_url: 'https://www.medusajs.com/downloads/medusa-french-terry-cert.pdf',
      },
    ],
    shipping_note:
      '<p>Shipped flat in recycled boxes to preserve the sweatshirt&apos;s shoulder structure. Free express shipping on two or more units.</p>',
    seo: {
      meta_title: 'Medusa Sweatshirt | Carbon-Brushed French Terry',
      meta_description:
        'Structured French terry sweatshirt with thermal brushed interior and hidden pockets. Explore specs, FAQs, and downloads.',
      canonical_url: 'https://www.medusajs.com/products/sweatshirt',
    },
  },
  {
    title: 'Medusa Sweatpants',
    handle: 'sweatpants',
    hero_excerpt:
      'Tapered flight-ready joggers with articulated knees, zip stash pockets, and a waistband that never digs in.',
    overview:
      '<p>Built from the same mid-weight terry as the Medusa Sweatshirt, these sweatpants balance polish and comfort. The waistband uses a dual channel elastic plus internal drawcord so you can cinch without bulk. Articulated knee darts mimic cockpit seating angles for zero bunching.</p><p>Every pocket is lined with breathable mesh and finished with reverse coil zips to protect controllers, cables, and passports.</p>',
    specs: [
      { label: 'Fabric', value: '83% organic cotton, 17% recycled poly' },
      { label: 'Fabric Weight', value: '300 GSM' },
      { label: 'Leg Opening', value: 'Tapered cuff with 4-way rib' },
      { label: 'Storage', value: '2 hand pockets + 1 concealed zip pocket' },
      { label: 'Inseam', value: '30" standard, graded by size' },
    ],
    features: [
      {
        heading: 'Stay-put waistband',
        body: '<p>Dual internal drawcord and silicone gripper print prevent the pants from riding up during intense sim sessions.</p>',
      },
      {
        heading: 'Cargo-smart storage',
        body: '<p>A hidden zip pocket along the right thigh fits a phone, flight log, or controller dongle without bulging.</p>',
      },
      {
        heading: 'Abrasion ready',
        body: '<p>Panels along the knees and seat use a denser weave to resist wear from pedals and chair edges.</p>',
      },
    ],
    faq: [
      {
        question: 'Are the cuffs tight?',
        answer: '<p>The cuffs are snug enough to stay above sneakers but use stretch ribbing so they never feel restrictive.</p>',
      },
      {
        question: 'Do they have a fly?',
        answer: '<p>No traditional fly—the streamlined front keeps the silhouette clean, and the interior drawcord delivers plenty of adjustability.</p>',
      },
      {
        question: 'Can I tailor the length?',
        answer: '<p>Yes, the hem can be altered by any tailor. We left an extra inch inside the cuff for adjustments.</p>',
      },
    ],
    downloads: [
      {
        label: 'Fit Blueprint',
        external_url: 'https://www.medusajs.com/downloads/medusa-sweatpants-fit.pdf',
      },
      {
        label: 'Care & Repair Card',
        external_url: 'https://www.medusajs.com/downloads/medusa-knit-care.pdf',
      },
    ],
    shipping_note:
      '<p>Rolled and packed in moisture-wicking sleeves. Includes a reusable garment bag for travel or locker storage.</p>',
    seo: {
      meta_title: 'Medusa Sweatpants | Flight-Ready Joggers',
      meta_description:
        'Premium tapered sweatpants with articulated knees and secure storage for simulator pilots. Review specs and care instructions.',
      canonical_url: 'https://www.medusajs.com/products/sweatpants',
    },
  },
  {
    title: 'Medusa Shorts',
    handle: 'shorts',
    hero_excerpt:
      'Vintage terry shorts rebuilt with laser-cut ventilation and bonded hems for friction-free training days.',
    overview:
      '<p>Inspired by retro athletic shorts, the Medusa Shorts deliver a modern update with bonded hems, matte snaps, and stretch terry that moves without wrinkling. Mesh gussets increase airflow while the 7-inch inseam delivers coverage without weighing you down.</p><p>The shorts pack down to the size of a water bottle, making them a go-to warm-up layer for simulator conventions and travel days.</p>',
    specs: [
      { label: 'Fabric', value: '65% recycled poly, 35% organic cotton terry' },
      { label: 'Inseam', value: '7 inches' },
      { label: 'Waistband', value: 'Soft elastic with internal drawcord' },
      { label: 'Pockets', value: '2 hand pockets + 1 back welt pocket' },
      { label: 'Care', value: 'Machine wash cold, hang dry' },
    ],
    features: [
      {
        heading: 'Laser-cut ventilation',
        body: '<p>Perforated side panels dump heat fast without compromising coverage, ideal for VR or mixed-reality sessions.</p>',
      },
      {
        heading: 'Bonded hems',
        body: '<p>Edges are heat-sealed instead of stitched, so nothing rubs against controllers strapped to your legs.</p>',
      },
      {
        heading: 'Pack-light construction',
        body: '<p>The shorts fold flat and resist wrinkles, making them easy to stash in your carry-on.</p>',
      },
    ],
    faq: [
      {
        question: 'Do the shorts have stretch?',
        answer: '<p>Yes, four-way stretch terry and mesh gussets keep the shorts flexible during training.</p>',
      },
      {
        question: 'Are they lined?',
        answer: '<p>No liner—the shorts are designed to pair with your preferred base layer.</p>',
      },
      {
        question: 'Can I swim in them?',
        answer: '<p>The fabric dries quickly but is not chlorine-rated. Rinse after exposure to salt or pool water.</p>',
      },
    ],
    downloads: [
      {
        label: 'Training Day Checklist',
        external_url: 'https://www.medusajs.com/downloads/medusa-training-checklist.pdf',
      },
      {
        label: 'Material Safety Sheet',
        external_url: 'https://www.medusajs.com/downloads/medusa-shorts-material.pdf',
      },
    ],
    shipping_note:
      '<p>Ships in compostable sleeves with minimal folding to reduce crease lines. Free standard shipping on bundles with T-Shirts or Sweatshirts.</p>',
    seo: {
      meta_title: 'Medusa Shorts | Ventilated Performance Layer',
      meta_description:
        'Lightweight terry shorts with bonded hems and laser-cut ventilation. See specs, FAQs, and downloadable resources.',
      canonical_url: 'https://www.medusajs.com/products/shorts',
    },
  },
]

export const seedProductDetails = async (strapi: Core.Strapi) => {
  const productHandles = PRODUCT_DETAIL_SEEDS.map((seed) => seed.handle)

  const existingDetails = await strapi.entityService.findMany('api::product-detail.product-detail', {
    filters: {
      handle: {
        $in: productHandles,
      },
    },
    fields: ['id', 'handle'],
    publicationState: 'preview',
  })

  const existingHandles = new Set((existingDetails as { handle?: string }[]).map((detail) => detail.handle).filter(Boolean))

  for (const seed of PRODUCT_DETAIL_SEEDS) {
    if (existingHandles.has(seed.handle)) {
      continue
    }

    await strapi.entityService.create('api::product-detail.product-detail', {
      data: {
        ...seed,
        publishedAt: new Date().toISOString(),
      },
    })

    strapi.log.info(`Seeded product detail for "${seed.handle}"`)
  }
}
