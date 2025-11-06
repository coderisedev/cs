#!/usr/bin/env node
import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"

const projectRoot = process.cwd()
const srcDir = path.join(projectRoot, "src")
const allowList = new Set([
  path.join(srcDir, "styles", "design-tokens.css"),
  path.join(srcDir, "styles", "dji-utilities.css"),
])
const allowedExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".mdx"])
const skipDirectories = new Set(["node_modules", ".next", "test-results", "stories"])
const results = []

const scanFile = (filePath) => {
  const content = readFileSync(filePath, "utf8")
  const lines = content.split(/\r?\n/)
  lines.forEach((line, index) => {
    const matches = line.match(/#[0-9a-fA-F]{3,6}\b/g)
    if (matches) {
      results.push(`${path.relative(projectRoot, filePath)}:${index + 1}: ${line.trim()}`)
    }
  })
}

const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue
    if (skipDirectories.has(entry.name)) continue

    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(fullPath)
    } else if (allowedExtensions.has(path.extname(entry.name)) && !allowList.has(fullPath)) {
      scanFile(fullPath)
    }
  }
}

if (!readdirSync(projectRoot).includes("src")) {
  console.error("check-hex: expected to run from apps/dji-storefront with a src directory")
  process.exit(1)
}

walk(srcDir)

if (results.length > 0) {
  console.error("Disallowed hex color literals found:\n" + results.join("\n"))
  process.exit(1)
}

console.log("✅ No disallowed hex color literals detected.")
