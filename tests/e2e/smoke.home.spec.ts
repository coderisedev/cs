import { test, expect } from '@playwright/test'

test('smoke: storefront home loads', async ({ page }) => {
  const res = await page.goto('/')
  expect(res?.ok(), 'GET / should return 2xx').toBeTruthy()
  // Basic sanity: page has a title or rendered content
  const title = await page.title()
  expect(title).toBeDefined()
})

