/**
 * Import Markdown blog posts to Strapi
 *
 * Usage:
 *   node scripts/import-md-posts.js <md-file-or-directory>
 *
 * Examples:
 *   node scripts/import-md-posts.js ../../../docs/seo/blog-03-building-737-home-cockpit.md
 *   node scripts/import-md-posts.js ../../../docs/seo
 *
 * Markdown Frontmatter Format:
 *   ---
 *   title: "Article Title"
 *   slug: "article-slug"
 *   excerpt: "Short description for listing pages"
 *   author: "Author Name"
 *   category: "guides"
 *   seo:
 *     meta_title: "SEO Title"
 *     meta_description: "SEO Description"
 *   ---
 *
 * If frontmatter is missing, the script will:
 *   - Extract title from first H1 heading
 *   - Generate slug from filename
 *   - Extract excerpt from first paragraph or italicized intro
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

  // Parse YAML-like frontmatter (simple key: value pairs)
  let currentKey = null
  let inNestedObject = false
  let nestedKey = null

  frontmatterStr.split('\n').forEach((line) => {
    // Nested object start (e.g., "seo:")
    const nestedMatch = line.match(/^(\w+):\s*$/)
    if (nestedMatch) {
      nestedKey = nestedMatch[1]
      data[nestedKey] = {}
      inNestedObject = true
      return
    }

    // Nested property (e.g., "  meta_title: value")
    const nestedPropMatch = line.match(/^\s{2,}(\w+):\s*(.*)$/)
    if (inNestedObject && nestedPropMatch && nestedKey) {
      let value = nestedPropMatch[2].trim()
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      data[nestedKey][nestedPropMatch[1]] = value
      return
    }

    // Top-level property (e.g., "title: value")
    const propMatch = line.match(/^(\w+):\s*(.*)$/)
    if (propMatch) {
      inNestedObject = false
      currentKey = propMatch[1]
      let value = propMatch[2].trim()
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      data[currentKey] = value
    }
  })

  return { data, content: bodyContent }
}

// Extract title from first H1 heading
function extractTitle(content) {
  const h1Match = content.match(/^#\s+(.+)$/m)
  return h1Match ? h1Match[1].trim() : null
}

// Extract excerpt from first paragraph or italicized intro
function extractExcerpt(content, maxLength = 500) {
  // Try italicized intro first (common pattern: *intro text*)
  const italicMatch = content.match(/^\*([^*]+)\*\s*$/m)
  if (italicMatch) {
    return italicMatch[1].trim().slice(0, maxLength)
  }

  // Find first regular paragraph (skip headings, lists, code blocks)
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

// Generate slug from filename
function generateSlug(filename) {
  return filename
    .replace(/\.md$/, '')
    .replace(/^blog-\d+-/, '') // Remove "blog-03-" prefix
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// Parse a single markdown file
function parseMarkdownFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const filename = path.basename(filePath)
  const { data: frontmatter, content: bodyContent } = parseFrontmatter(content)

  // Build post data with fallbacks
  const post = {
    title: frontmatter.title || extractTitle(bodyContent) || filename.replace(/\.md$/, ''),
    slug: frontmatter.slug || generateSlug(filename),
    excerpt: frontmatter.excerpt || extractExcerpt(bodyContent),
    content: bodyContent.trim(),
    author: frontmatter.author || 'Cockpit Simulator Team',
    category: frontmatter.category || 'guides',
  }

  // Add SEO component if present
  if (frontmatter.seo && Object.keys(frontmatter.seo).length > 0) {
    post.seo = {
      meta_title: frontmatter.seo.meta_title || post.title,
      meta_description: frontmatter.seo.meta_description || post.excerpt,
      canonical_url: frontmatter.seo.canonical_url || null,
    }
  }

  return post
}

// Find all markdown files in a directory
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

// Import posts to Strapi
async function importPosts(strapi, posts) {
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

      // Add SEO component if present
      if (post.seo) {
        payload.seo = post.seo
      }

      // Check if post already exists
      const [existing] = await strapi.entityService.findMany('api::post.post', {
        filters: { slug: post.slug },
        limit: 1,
        publicationState: 'preview',
      })

      if (existing) {
        await strapi.entityService.update('api::post.post', existing.id, { data: payload })
        console.log(`  Updated: ${post.slug}`)
        results.updated++
      } else {
        await strapi.entityService.create('api::post.post', {
          data: { ...payload, publishedAt: new Date().toISOString() },
        })
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

// Preview mode - just show what would be imported
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

async function bootstrap() {
  const args = process.argv.slice(2)
  const previewMode = args.includes('--preview') || args.includes('-p')
  const inputPath = args.find((arg) => !arg.startsWith('-'))

  if (!inputPath) {
    console.log(`
Usage: node scripts/import-md-posts.js [options] <path>

Arguments:
  path          Path to a markdown file or directory containing blog-*.md files

Options:
  -p, --preview   Preview mode - show what would be imported without making changes

Examples:
  node scripts/import-md-posts.js ../../../docs/seo/blog-03-building-737-home-cockpit.md
  node scripts/import-md-posts.js ../../../docs/seo --preview
  node scripts/import-md-posts.js ./content/blog
`)
    process.exit(1)
  }

  // Resolve path relative to script location
  const resolvedPath = path.resolve(__dirname, inputPath)
  console.log(`\nScanning: ${resolvedPath}`)

  // Find and parse markdown files
  const mdFiles = findMarkdownFiles(resolvedPath)
  if (mdFiles.length === 0) {
    console.error('No markdown files found (looking for blog-*.md files)')
    process.exit(1)
  }

  console.log(`Found ${mdFiles.length} markdown file(s):\n`)
  mdFiles.forEach((f) => console.log(`  - ${path.basename(f)}`))

  // Parse all files
  const posts = mdFiles.map((file) => {
    console.log(`\nParsing: ${path.basename(file)}`)
    return parseMarkdownFile(file)
  })

  // Preview mode
  if (previewMode) {
    previewPosts(posts)
    process.exit(0)
  }

  // Import to Strapi
  console.log('\n--- Importing to Strapi ---\n')

  process.env.NODE_ENV = process.env.NODE_ENV || 'development'
  const projectRoot = path.resolve(__dirname, '..')
  process.chdir(projectRoot)

  const distDir = path.join(projectRoot, 'dist')
  const hasDistBuild = fs.existsSync(distDir)
  console.log(`Initializing Strapi from ${projectRoot}${hasDistBuild ? ' (using dist build)' : ''}`)

  const { createStrapi } = require('@strapi/strapi')
  const strapi = await createStrapi({
    appDir: projectRoot,
    ...(hasDistBuild ? { distDir } : {}),
  })

  try {
    await strapi.start()
    const results = await importPosts(strapi, posts)

    console.log('\n--- Import Complete ---')
    console.log(`  Created: ${results.created}`)
    console.log(`  Updated: ${results.updated}`)
    console.log(`  Failed: ${results.failed}`)
  } catch (error) {
    console.error('Failed to import posts:', error)
    process.exitCode = 1
  } finally {
    try {
      await strapi.destroy()
    } catch (destroyError) {
      console.warn('Warning: Failed to cleanly shutdown Strapi', destroyError.message)
    } finally {
      if (!process.exitCode) {
        process.exit(0)
      }
    }
  }
}

bootstrap()
