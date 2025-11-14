/* eslint-disable no-console */
const fs = require('fs')
const path = require('path')

const POSTS_SEED_PATH = path.join(__dirname, 'seeds', 'posts.json')

async function loadSeeds() {
  if (!fs.existsSync(POSTS_SEED_PATH)) {
    throw new Error(`Missing seeds file at ${POSTS_SEED_PATH}`)
  }

  const raw = await fs.promises.readFile(POSTS_SEED_PATH, 'utf8')
  const parsed = JSON.parse(raw)

  if (!Array.isArray(parsed)) {
    throw new Error('Post seeds file must export an array')
  }

  return parsed
}

async function importSeeds(strapi, seeds) {
  for (const seed of seeds) {
    const payload = {
      title: seed.title,
      slug: seed.slug,
      excerpt: seed.excerpt,
      content: seed.content,
      author: seed.author,
      category: seed.category,
    }

    const [existing] = await strapi.entityService.findMany('api::post.post', {
      filters: { slug: seed.slug },
      limit: 1,
      publicationState: 'preview',
    })

    if (existing) {
      await strapi.entityService.update('api::post.post', existing.id, { data: payload })
      console.log(`Updated post: ${seed.slug}`)
    } else {
      await strapi.entityService.create('api::post.post', {
        data: { ...payload, publishedAt: new Date().toISOString() },
      })
      console.log(`Created post: ${seed.slug}`)
    }
  }
}

async function bootstrap() {
  process.env.NODE_ENV = process.env.NODE_ENV || 'development'

  const projectRoot = path.resolve(__dirname, '..')
  process.chdir(projectRoot)

  const distDir = path.join(projectRoot, 'dist')
  const hasDistBuild = fs.existsSync(distDir)
  console.log(
    `[seeds] Initializing Strapi from ${projectRoot}${hasDistBuild ? ` (dist: ${distDir})` : ''}`
  )

  const { createStrapi } = require('@strapi/strapi')
  const strapi = await createStrapi({
    appDir: projectRoot,
    ...(hasDistBuild ? { distDir } : {}),
  })

  try {
    await strapi.start()
    const seeds = await loadSeeds()
    await importSeeds(strapi, seeds)
    console.log(`Finished importing ${seeds.length} posts.`)
  } catch (error) {
    console.error('Failed to import post seeds', error)
    process.exitCode = 1
  } finally {
    try {
      await strapi.destroy()
    } catch (destroyError) {
      console.warn('Failed to cleanly shutdown Strapi after seeding', destroyError)
    } finally {
      if (!process.exitCode) {
        process.exit(0)
      }
    }
  }
}

bootstrap()
