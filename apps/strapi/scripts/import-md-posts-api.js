/**
 * Import Markdown blog posts to Strapi via REST API
 *
 * Usage:
 *   STRAPI_URL=https://content.aidenlux.com STRAPI_API_TOKEN=xxx node scripts/import-md-posts-api.js <path>
 *
 * Environment Variables:
 *   STRAPI_URL       - Strapi base URL (e.g., https://content.aidenlux.com)
 *   STRAPI_API_TOKEN - Strapi API token with posts write permission
 *
 * Examples:
 *   node scripts/import-md-posts-api.js ../../../docs/seo/blog-03-building-737-home-cockpit.md
 *   node scripts/import-md-posts-api.js ../../../docs/seo --preview
 */

/* eslint-disable no-console */
const fs = require('fs')
const path = require('path')

// Simple frontmatter parser (no external dependencies)
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
  const match = content.match(frontmatterRegex)

  if (!match) {
    return { data: {}, content }
  }

  const frontmatterStr = match[1]
  const bodyContent = match[2]
  const data = {}

  let nestedKey = null
  let inNestedObject = false

  frontmatterStr.split('\n').forEach((line) => {
    const nestedMatch = line.match(/^(\w+):\s*$/)
    if (nestedMatch) {
      nestedKey = nestedMatch[1]
      data[nestedKey] = {}
      inNestedObject = true
      return
    }

    const nestedPropMatch = line.match(/^\s{2,}(\w+):\s*(.*)$/)
    if (inNestedObject && nestedPropMatch && nestedKey) {
      let value = nestedPropMatch[2].trim()
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      data[nestedKey][nestedPropMatch[1]] = value
      return
    }

    const propMatch = line.match(/^(\w+):\s*(.*)$/)
    if (propMatch) {
      inNestedObject = false
      let value = propMatch[2].trim()
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      data[propMatch[1]] = value
    }
  })

  return { data, content: bodyContent }
}

function extractTitle(content) {
  const h1Match = content.match(/^#\s+(.+)$/m)
  return h1Match ? h1Match[1].trim() : null
}

function extractExcerpt(content, maxLength = 500) {
  const italicMatch = content.match(/^\*([^*]+)\*\s*$/m)
  if (italicMatch) {
    return italicMatch[1].trim().slice(0, maxLength)
  }

  const lines = content.split('\n')
  let inCodeBlock = false
  let paragraph = ''

  for (const line of lines) {
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock
      continue
    }
    if (inCodeBlock) continue
    if (line.startsWith('#')) continue
    if (line.startsWith('-') || line.startsWith('*') || line.match(/^\d+\./)) continue
    if (line.startsWith('|')) continue
    if (line.startsWith('>')) continue
    if (line.trim() === '') {
      if (paragraph) break
      continue
    }
    if (line.startsWith('---')) continue

    paragraph += (paragraph ? ' ' : '') + line.trim()
  }

  return paragraph.slice(0, maxLength)
}

function generateSlug(filename) {
  return filename
    .replace(/\.md$/, '')
    .replace(/^blog-\d+-/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function parseMarkdownFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const filename = path.basename(filePath)
  const { data: frontmatter, content: bodyContent } = parseFrontmatter(content)

  const post = {
    title: frontmatter.title || extractTitle(bodyContent) || filename.replace(/\.md$/, ''),
    slug: frontmatter.slug || generateSlug(filename),
    excerpt: frontmatter.excerpt || extractExcerpt(bodyContent),
    content: bodyContent.trim(),
    author: frontmatter.author || 'Cockpit Simulator Team',
    category: frontmatter.category || 'guides',
  }

  if (frontmatter.seo && Object.keys(frontmatter.seo).length > 0) {
    post.seo = {
      meta_title: frontmatter.seo.meta_title || post.title,
      meta_description: frontmatter.seo.meta_description || post.excerpt,
      canonical_url: frontmatter.seo.canonical_url || null,
    }
  }

  return post
}

function findMarkdownFiles(dirPath) {
  const files = []

  if (!fs.existsSync(dirPath)) {
    throw new Error(`Path does not exist: ${dirPath}`)
  }

  const stat = fs.statSync(dirPath)
  if (stat.isFile()) {
    if (dirPath.endsWith('.md')) {
      files.push(dirPath)
    }
    return files
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)
    if (entry.isDirectory()) {
      files.push(...findMarkdownFiles(fullPath))
    } else if (entry.name.endsWith('.md') && entry.name.startsWith('blog-')) {
      files.push(fullPath)
    }
  }

  return files
}

// Strapi API client
class StrapiClient {
  constructor(baseUrl, apiToken) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.apiToken = apiToken
  }

  async request(method, endpoint, data = null) {
    const url = `${this.baseUrl}/api${endpoint}`
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiToken}`,
      },
    }

    if (data) {
      options.body = JSON.stringify(data)
    }

    const response = await fetch(url, options)
    const responseData = await response.json()

    if (!response.ok) {
      const errorMsg = responseData.error?.message || JSON.stringify(responseData)
      throw new Error(`API Error (${response.status}): ${errorMsg}`)
    }

    return responseData
  }

  async findPostBySlug(slug) {
    const result = await this.request(
      'GET',
      `/posts?filters[slug][$eq]=${encodeURIComponent(slug)}&publicationState=preview`
    )
    return result.data?.[0] || null
  }

  async createPost(postData) {
    return this.request('POST', '/posts', {
      data: {
        ...postData,
        publishedAt: new Date().toISOString(),
      },
    })
  }

  async updatePost(id, postData) {
    return this.request('PUT', `/posts/${id}`, { data: postData })
  }
}

async function importPosts(client, posts) {
  const results = { created: 0, updated: 0, failed: 0 }

  for (const post of posts) {
    try {
      const payload = {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        author: post.author,
        category: post.category,
      }

      if (post.seo) {
        payload.seo = post.seo
      }

      const existing = await client.findPostBySlug(post.slug)

      if (existing) {
        await client.updatePost(existing.id, payload)
        console.log(`  Updated: ${post.slug}`)
        results.updated++
      } else {
        await client.createPost(payload)
        console.log(`  Created: ${post.slug}`)
        results.created++
      }
    } catch (error) {
      console.error(`  Failed: ${post.slug} - ${error.message}`)
      results.failed++
    }
  }

  return results
}

function previewPosts(posts) {
  console.log('\n--- Preview Mode (no changes will be made) ---\n')

  posts.forEach((post, index) => {
    console.log(`[${index + 1}] ${post.title}`)
    console.log(`    Slug: ${post.slug}`)
    console.log(`    Category: ${post.category}`)
    console.log(`    Author: ${post.author}`)
    console.log(`    Excerpt: ${post.excerpt?.slice(0, 100)}...`)
    console.log(`    Content length: ${post.content.length} chars`)
    if (post.seo) {
      console.log(`    SEO: meta_title="${post.seo.meta_title}"`)
    }
    console.log('')
  })
}

async function main() {
  const args = process.argv.slice(2)
  const previewMode = args.includes('--preview') || args.includes('-p')
  const inputPath = args.find((arg) => !arg.startsWith('-'))

  if (!inputPath) {
    console.log(`
Usage: node scripts/import-md-posts-api.js [options] <path>

Arguments:
  path          Path to a markdown file or directory containing blog-*.md files

Options:
  -p, --preview   Preview mode - show what would be imported without making changes

Environment Variables:
  STRAPI_URL        Strapi base URL (default: https://content.aidenlux.com)
  STRAPI_API_TOKEN  Strapi API token with posts write permission (required for import)

Examples:
  # Preview only (no API token needed)
  node scripts/import-md-posts-api.js ../../../docs/seo --preview

  # Import to Strapi
  STRAPI_API_TOKEN=xxx node scripts/import-md-posts-api.js ../../../docs/seo/blog-03-building-737-home-cockpit.md
`)
    process.exit(1)
  }

  const resolvedPath = path.resolve(__dirname, inputPath)
  console.log(`\nScanning: ${resolvedPath}`)

  const mdFiles = findMarkdownFiles(resolvedPath)
  if (mdFiles.length === 0) {
    console.error('No markdown files found (looking for blog-*.md files)')
    process.exit(1)
  }

  console.log(`Found ${mdFiles.length} markdown file(s):\n`)
  mdFiles.forEach((f) => console.log(`  - ${path.basename(f)}`))

  const posts = mdFiles.map((file) => {
    console.log(`\nParsing: ${path.basename(file)}`)
    return parseMarkdownFile(file)
  })

  if (previewMode) {
    previewPosts(posts)
    process.exit(0)
  }

  // Check for required env vars
  const strapiUrl = process.env.STRAPI_URL || 'https://content.aidenlux.com'
  const apiToken = process.env.STRAPI_API_TOKEN

  if (!apiToken) {
    console.error('\nError: STRAPI_API_TOKEN environment variable is required')
    console.error('Create an API token in Strapi admin: Settings > API Tokens')
    console.error('Token needs "posts" collection: find, create, update permissions')
    process.exit(1)
  }

  console.log(`\n--- Importing to Strapi ---`)
  console.log(`URL: ${strapiUrl}\n`)

  const client = new StrapiClient(strapiUrl, apiToken)
  const results = await importPosts(client, posts)

  console.log('\n--- Import Complete ---')
  console.log(`  Created: ${results.created}`)
  console.log(`  Updated: ${results.updated}`)
  console.log(`  Failed: ${results.failed}`)

  if (results.failed > 0) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('Fatal error:', error.message)
  process.exit(1)
})
