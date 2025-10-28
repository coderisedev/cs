import { test, expect } from '@playwright/test'

test('smoke: shop page returns 200 and lists products', async ({ page, request }) => {
  const res = await request.get('/shop')
  expect(res.status()).toBe(200)
  await page.goto('/shop')
  const items = page.locator('a[href^="/product/"]')
  await expect(items.first()).toBeVisible()
})

test('smoke: two PDP pages return 200 from links on /shop', async ({ page, request }) => {
  await page.goto('/shop')
  const links = await page.$$eval('a[href^="/product/"]', els => els.slice(0,2).map(e => (e as HTMLAnchorElement).getAttribute('href')))
  for (const href of links) {
    if (!href) continue
    const res = await request.get(href)
    expect(res.status(), `GET ${href}`).toBe(200)
  }
})
