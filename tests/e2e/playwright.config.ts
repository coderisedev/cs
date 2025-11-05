import { defineConfig, devices } from "@playwright/test"

const PORT = 8000
const HOST = "127.0.0.1"
const baseURL = `http://${HOST}:${PORT}`

export default defineConfig({
  testDir: "./",
  timeout: 60_000,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["list"], ["html", { outputFolder: "./playwright-report" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    video: process.env.CI ? "on" : "retain-on-failure",
  },
  webServer: {
    command: "pnpm --filter medusa-next dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: "dummy",
      MEDUSA_BACKEND_URL: "http://127.0.0.1:9999",
      NEXT_SKIP_REGION_MIDDLEWARE: "true",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
})
