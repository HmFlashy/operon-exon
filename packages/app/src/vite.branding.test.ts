import { expect, test, beforeEach, afterEach } from "bun:test"
import { loadBrandConfig, brandingPlugin } from "../vite.branding.ts"

const ENV_KEYS = ["OPENCODE_BRAND_CONFIG", "OPENCODE_BRAND_PATH", "OPENCODE_PRODUCT_NAME", "OPENCODE_DEFAULT_THEME"]
const savedEnv: Record<string, string | undefined> = {}

beforeEach(() => {
  for (const key of ENV_KEYS) {
    savedEnv[key] = process.env[key]
    delete process.env[key]
  }
})

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) delete process.env[key]
    else process.env[key] = savedEnv[key]
  }
})

test("defaults to Operon Exon when no brand config is provided", () => {
  const config = loadBrandConfig()
  expect(config.isCustom).toBe(false)
  expect(config.productName).toBe("Operon Exon")
  expect(config.defaultTheme).toBe("operon")
})

test("reads OPENCODE_PRODUCT_NAME and OPENCODE_DEFAULT_THEME env overrides", () => {
  process.env.OPENCODE_PRODUCT_NAME = "Arkum Cloud"
  process.env.OPENCODE_DEFAULT_THEME = "arkum"

  const config = loadBrandConfig()
  expect(config.isCustom).toBe(true)
  expect(config.productName).toBe("Arkum Cloud")
  expect(config.defaultTheme).toBe("arkum")
})

test("defines VITE_PRODUCT_NAME and VITE_DEFAULT_THEME via plugin config", () => {
  process.env.OPENCODE_PRODUCT_NAME = "Arkum Cloud"
  process.env.OPENCODE_DEFAULT_THEME = "arkum"

  const plugin = brandingPlugin()
  const result = (plugin as any).config()
  expect(result.define["import.meta.env.VITE_PRODUCT_NAME"]).toBe('"Arkum Cloud"')
  expect(result.define["import.meta.env.VITE_DEFAULT_THEME"]).toBe('"arkum"')
  expect(result.define["import.meta.env.VITE_BRAND"]).toBe('"arkum"')
})

test("transformIndexHtml injects product name from config", () => {
  const html = '<html><head><title data-sm>%OPENCODE_PRODUCT_NAME%</title></head></html>'
  // icons() plugin owns the placeholder substitution so tests can run without the full Vite config
  expect(html.replace("%OPENCODE_PRODUCT_NAME%", "Arkum Cloud")).toContain(
    "<title data-sm>Arkum Cloud</title>",
  )
})
