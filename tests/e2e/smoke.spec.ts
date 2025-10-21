import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('Homepage loads successfully', async ({ page }) => {
    const response = await page.goto('/');

    // Check page loaded successfully
    expect(response?.status()).toBe(200);

    // Check basic page elements
    await expect(page.locator('body')).toBeVisible();

    // Check for common elements that should exist on most pages
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('Page has proper meta tags', async ({ page }) => {
    await page.goto('/');

    // Check for viewport meta tag
    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toHaveAttribute('content', 'width=device-width, initial-scale=1');
  });

  test('No console errors on page load', async ({ page }) => {
    const errors: string[] = [];

    // Listen for console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');

    // Wait a bit for any delayed console errors
    await page.waitForTimeout(1000);

    // Assert no console errors
    expect(errors.length).toBe(0);
  });

  test('Basic navigation elements exist', async ({ page }) => {
    await page.goto('/');

    // Look for common navigation patterns
    const navSelectors = [
      'nav',
      '[role="navigation"]',
      '.navigation',
      '.navbar',
      'header',
      '.header'
    ];

    let navigationFound = false;
    for (const selector of navSelectors) {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        navigationFound = true;
        break;
      }
    }

    // At least one navigation element should exist
    expect(navigationFound).toBe(true);
  });

  test('Page is responsive', async ({ page }) => {
    await page.goto('/');

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // Check page is still functional on mobile
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);

    // Check page is still functional on desktop
    await expect(body).toBeVisible();
  });
});