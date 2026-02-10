import type { Metadata } from "next"
import Image from "next/image"
import ReactMarkdown from "react-markdown"
import type { Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"
import { notFound } from "next/navigation"
import { Calendar, Clock, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { getPost, listPosts, type BlogPost } from "@/lib/data/blog"

const BASE_URL = process.env.STOREFRONT_BASE_URL || "https://dev.aidenlux.com"
const DEFAULT_COUNTRY = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us"

export const dynamic = "force-dynamic"

export async function generateStaticParams() {
  const firstPage = await listPosts({ page: 1, pageSize: 50, category: "Guides" })
  if (!firstPage.posts.length) {
    return []
  }

  const allPosts = [...firstPage.posts]
  for (let page = 2; page <= firstPage.pagination.pageCount; page += 1) {
    const pageResult = await listPosts({ page, pageSize: 50, category: "Guides" })
    allPosts.push(...pageResult.posts)
  }

  return allPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; countryCode: string }> }): Promise<Metadata> {
  const { slug, countryCode } = await params
  const post = await getPost(slug)
  if (!post) {
    return { title: "Guides", description: "Guides and tutorials from Cockpit Simulator" }
  }

  const canonicalUrl = `${BASE_URL}/${countryCode || DEFAULT_COUNTRY}/guides/${slug}`
  const title = post.seo.metaTitle ?? `${post.title} · Cockpit Simulator`
  const description = post.seo.metaDescription ?? post.excerpt

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "article",
      title: post.seo.metaTitle ?? post.title,
      description,
      url: canonicalUrl,
      siteName: "Cockpit Simulator",
      images: post.seo.ogImageUrl ? [{ url: post.seo.ogImageUrl, alt: post.title, width: 1200, height: 630 }] : undefined,
      publishedTime: post.publishedAt ?? undefined,
      authors: post.authorName ? [post.authorName] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.seo.metaTitle ?? post.title,
      description,
      images: post.seo.ogImageUrl ? [post.seo.ogImageUrl] : undefined,
    },
  }
}

function generateGuidePostJsonLd(post: BlogPost, countryCode: string) {
  const url = `${BASE_URL}/${countryCode || DEFAULT_COUNTRY}/guides/${post.slug}`

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seo.metaDescription ?? post.excerpt,
    image: post.seo.ogImageUrl ?? post.coverImageUrl,
    url,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: post.authorName
      ? {
          "@type": "Person",
          name: post.authorName,
          jobTitle: post.authorTitle,
        }
      : {
          "@type": "Organization",
          name: "Cockpit Simulator",
        },
    publisher: {
      "@type": "Organization",
      name: "Cockpit Simulator",
      url: BASE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    wordCount: post.content.split(/\s+/).length,
    timeRequired: `PT${post.estimatedReadingMinutes ?? 5}M`,
  }
}

function generateBreadcrumbJsonLd(post: BlogPost, countryCode: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${BASE_URL}/${countryCode || DEFAULT_COUNTRY}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Guides",
        item: `${BASE_URL}/${countryCode || DEFAULT_COUNTRY}/guides`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `${BASE_URL}/${countryCode || DEFAULT_COUNTRY}/guides/${post.slug}`,
      },
    ],
  }
}

const markdownComponents: Components = {
  h2: ({ className, children, ...props }) => (
    <h2 {...props} className={cn("text-2xl font-semibold text-foreground-primary mt-8 mb-4", className)}>
      {children}
    </h2>
  ),
  h3: ({ className, children, ...props }) => (
    <h3 {...props} className={cn("text-xl font-semibold text-foreground-primary mt-6 mb-3", className)}>
      {children}
    </h3>
  ),
  p: ({ className, children, ...props }) => (
    <p {...props} className={cn("text-lg leading-relaxed text-foreground-secondary", className)}>
      {children}
    </p>
  ),
  ul: ({ className, children, ...props }) => (
    <ul {...props} className={cn("list-disc pl-6 space-y-2 text-foreground-secondary", className)}>
      {children}
    </ul>
  ),
  ol: ({ className, children, ...props }) => (
    <ol {...props} className={cn("list-decimal pl-6 space-y-2 text-foreground-secondary", className)}>
      {children}
    </ol>
  ),
  a: ({ className, children, href, ...props }) => (
    <a
      {...props}
      href={href ?? "#"}
      className={cn("text-primary-500 underline", className)}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  ),
}

type GuidePostPageProps = {
  params: Promise<{ slug: string; countryCode: string }>
}

export default async function GuidePostPage({ params }: GuidePostPageProps) {
  const { slug, countryCode } = await params
  const post = await getPost(slug)

  if (!post || post.category !== "Guides") {
    notFound()
  }

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null

  const guidePostJsonLd = generateGuidePostJsonLd(post, countryCode)
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(post, countryCode)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(guidePostJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <article className="container py-16 space-y-8 max-w-3xl">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-primary-500">Guides</p>
          <h1 className="text-4xl font-semibold text-foreground-primary">{post.title}</h1>
          <div className="flex flex-wrap gap-4 text-xs text-foreground-muted">
            {formattedDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> {formattedDate}
              </span>
            )}
            {post.estimatedReadingMinutes && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> {post.estimatedReadingMinutes} min read
              </span>
            )}
            {post.authorName && (
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" /> {post.authorName}
                {post.authorTitle && <span className="text-foreground-secondary"> · {post.authorTitle}</span>}
              </span>
            )}
          </div>
        </div>

        {post.coverImageUrl && (
          <div className="relative h-80 w-full rounded-3xl overflow-hidden">
            <Image src={post.coverImageUrl} alt={post.coverImageAlt ?? post.title} fill className="object-cover" />
          </div>
        )}

        <div className="space-y-4 text-lg text-foreground-primary leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={markdownComponents}>
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    </>
  )
}
