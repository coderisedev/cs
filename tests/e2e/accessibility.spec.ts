import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

const ROUTES = (process.env.E2E_A11Y_PATHS || "/us,/us/store,/us/checkout")
  .split(",")
  .map((route) => route.trim())
  .filter(Boolean)

const benignViolations = new Set<string>([
  // add IDs here once reviewed (e.g., "color-contrast")
])

test.describe("Accessibility smoke", () => {
  for (const route of ROUTES) {
    test(`axe scan ${route}`, async ({ page }) => {
      await page.goto(route)
      await page.waitForLoadState("networkidle")

      const scan = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze()

      const actionable = scan.violations.filter(
        (violation) =>
          (violation.impact === "serious" || violation.impact === "critical") &&
          !benignViolations.has(violation.id)
      )

      if (actionable.length) {
        console.error(
          `Accessibility violations on ${route}:`,
          actionable.map((violation) => ({
            id: violation.id,
            impact: violation.impact,
            description: violation.description,
            nodes: violation.nodes.map((node) => node.target),
          }))
        )
      }

      expect(actionable, `Serious accessibility violations found on ${route}`).toHaveLength(0)
    })
  }
})
