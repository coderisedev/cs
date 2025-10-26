import { test, expect, request } from '@playwright/test'

const MEDUSA_BASE_URL = process.env.MEDUSA_BASE_URL
const STRAPI_BASE_URL = process.env.STRAPI_BASE_URL

test('postdeploy: medusa /health returns success', async () => {
  test.skip(!MEDUSA_BASE_URL, 'MEDUSA_BASE_URL not set')
  const api = await request.newContext()
  const res = await api.get(`${MEDUSA_BASE_URL.replace(/\/$/, '')}/health`)
  expect(res.status(), 'Medusa /health should be 200').toBe(200)
})

test('postdeploy: strapi /_health returns success', async () => {
  test.skip(!STRAPI_BASE_URL, 'STRAPI_BASE_URL not set')
  const api = await request.newContext()
  const res = await api.get(`${STRAPI_BASE_URL.replace(/\/$/, '')}/_health`)
  // Accept 200 or 204 depending on implementation
  expect([200, 204]).toContain(res.status())
})

