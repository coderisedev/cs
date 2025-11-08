import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
import ProductTemplate from "@modules/products/templates"
import { HttpTypes } from "@medusajs/types"
import { getProductDetail } from "@lib/data/product-details"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
  searchParams: Promise<{ v_id?: string }>
}

export async function generateStaticParams() {
  try {
    const countryCodes = await listRegions().then((regions) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
    )

    if (!countryCodes) {
      return []
    }

    const promises = countryCodes.map(async (country) => {
      const { response } = await listProducts({
        countryCode: country,
        queryParams: { limit: 100 },
      })

      return {
        country,
        products: response.products,
      }
    })

    const countryProducts = await Promise.all(promises)

    return countryProducts
      .flatMap((countryData) =>
        countryData.products.map((product) => ({
          countryCode: countryData.country,
          handle: product.handle,
        }))
      )
      .filter((param) => param.handle)
  } catch (error) {
    console.error(
      `Failed to generate static paths for product pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }.`
    )
    return []
  }
}

function getImagesForVariant(
  product: HttpTypes.StoreProduct,
  selectedVariantId?: string
) {
  if (!selectedVariantId || !product.variants) {
    return product.images
  }

  const variant = product.variants!.find((v) => v.id === selectedVariantId)
  if (!variant) {
    return product.images
  }

  // Note: Medusa v2 doesn't include images in variants by default
  // For now, return all product images
  return product.images
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle } = params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const product = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle },
  }).then(({ response }) => response.products[0])

  if (!product) {
    notFound()
  }

  const productDetail = await getProductDetail(handle)

  const title = productDetail?.seo?.metaTitle ?? `${product.title} | Medusa Store`
  const description =
    productDetail?.seo?.metaDescription ?? product.description ?? `${product.title}`
  const ogImage = productDetail?.seo?.ogImageUrl ?? product.thumbnail ?? null

  return {
    title,
    description,
    ...(productDetail?.seo?.canonicalUrl
      ? { alternates: { canonical: productDetail.seo.canonicalUrl } }
      : {}),
    openGraph: {
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const region = await getRegion(params.countryCode)
  const searchParams = await props.searchParams

  const selectedVariantId = searchParams.v_id

  if (!region) {
    notFound()
  }

  const pricedProduct = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle: params.handle },
  }).then(({ response }) => response.products[0])

  if (!pricedProduct) {
    notFound()
  }

  const productDetail = await getProductDetail(params.handle)
  const cmsImages = buildCmsImages(productDetail)
  const medusaImages = getImagesForVariant(pricedProduct, selectedVariantId) || []
  const images = mergeImages(cmsImages, medusaImages)

  return (
    <ProductTemplate
      product={pricedProduct}
      region={region}
      countryCode={params.countryCode}
      images={images}
      productDetail={productDetail}
    />
  )
}

const buildCmsImages = (
  productDetail: Awaited<ReturnType<typeof getProductDetail>>
): HttpTypes.StoreProductImage[] => {
  if (!productDetail) {
    return []
  }

  const images: HttpTypes.StoreProductImage[] = []

  if (productDetail.heroMedia?.url) {
    images.push({
      id: productDetail.heroMedia.id?.toString() ?? `cms-hero-${productDetail.handle}`,
      url: productDetail.heroMedia.url,
    })
  }

  productDetail.gallery.forEach((media, index) => {
    if (media.url) {
      images.push({
        id: media.id?.toString() ?? `cms-gallery-${productDetail.handle}-${index}`,
        url: media.url,
      })
    }
  })

  return images
}

const mergeImages = (
  cmsImages: HttpTypes.StoreProductImage[],
  medusaImages: HttpTypes.StoreProductImage[]
) => {
  const seen = new Set<string>()
  const merged: HttpTypes.StoreProductImage[] = []

  const pushIfNew = (image?: HttpTypes.StoreProductImage | null) => {
    if (!image || !image.url) {
      return
    }
    if (seen.has(image.url)) {
      return
    }
    seen.add(image.url)
    merged.push(image)
  }

  cmsImages.forEach(pushIfNew)
  medusaImages.forEach(pushIfNew)

  return merged
}
