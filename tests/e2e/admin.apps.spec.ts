import { test, expect, request } from '@playwright/test'

const MEDUSA_BASE_URL = process.env.MEDUSA_BASE_URL
const STRAPI_BASE_URL = process.env.STRAPI_BASE_URL

test('smoke: strapi admin login page responds', async () => {
  test.skip(!STRAPI_BASE_URL, 'STRAPI_BASE_URL not set')
  const api = await request.newContext()
  const res = await api.get(`${STRAPI_BASE_URL.replace(/\/$/, '')}/admin`)
  // Strapi usually serves login HTML with 200 when unauthenticated
  expect([200, 302, 401]).toContain(res.status())
})

test('smoke: medusa admin app entry is reachable', async ({ page }) => {
  test.skip(!MEDUSA_BASE_URL, 'MEDUSA_BASE_URL not set')
  // Medusa admin app is served at /app/admin
  const url = `${MEDUSA_BASE_URL!.replace(/\/$/, '')}/app/admin`
  const res = await page.goto(url)
  expect(res?.ok(), 'GET /app/admin should return 2xx').toBeTruthy()
})

