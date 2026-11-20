import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import type { Plugin } from "vite"

export interface BrandConfig {
  isCustom: boolean
  /** Short brand slug used for component variants: "arkum", "operon", or "default". */
  brandId: string
  name: string
  shortName: string
  productName: string
  defaultTheme: string
  brandPath?: string
  logo?: {
    dark?: string
    light?: string
    mark?: string
  }
}

export function loadBrandConfig(): BrandConfig {
  const configPath = process.env.OPENCODE_BRAND_CONFIG
  let jsonConfig: any = {}
  let isCustom = false

  if (configPath && existsSync(configPath)) {
    try {
      jsonConfig = JSON.parse(readFileSync(configPath, "utf-8"))
      isCustom = true
    } catch (e) {
      console.warn("Failed to parse OPENCODE_BRAND_CONFIG:", e)
    }
  }

  const brandPath = process.env.OPENCODE_BRAND_PATH || (configPath ? path.dirname(configPath) : undefined)
  if (process.env.OPENCODE_BRAND_PATH || process.env.OPENCODE_PRODUCT_NAME || process.env.OPENCODE_DEFAULT_THEME) {
    isCustom = true
  }

  const productName =
    process.env.OPENCODE_PRODUCT_NAME ||
    jsonConfig.productName ||
    jsonConfig.name ||
    "Operon Exon"

  const name = jsonConfig.name || (isCustom ? productName : "Operon Exon")

  // Derive a stable brand slug for component variants. JSON config `name` wins;
  // otherwise infer from productName containing a known brand token.
  const brandId =
    !isCustom
      ? "default"
      : (jsonConfig.name?.toLowerCase() ??
        (/arkum/i.test(productName) ? "arkum" : /operon/i.test(productName) ? "operon" : productName.toLowerCase().replace(/\s+/g, "-")))

  const defaultTheme =
    process.env.OPENCODE_DEFAULT_THEME ||
    jsonConfig.theme?.id ||
    (jsonConfig.name?.toLowerCase() === "arkum" ? "arkum" : undefined) ||
    "operon"

  return {
    isCustom,
    brandId,
    name,
    shortName: jsonConfig.shortName || jsonConfig.name || name,
    productName,
    defaultTheme,
    brandPath,
    logo: jsonConfig.logo,
  }
}

export function brandingPlugin(): Plugin {
  const brand = loadBrandConfig()

  return {
    name: "opencode-app:branding",
    config() {
      return {
        define: {
          "import.meta.env.VITE_PRODUCT_NAME": JSON.stringify(brand.productName),
          "import.meta.env.VITE_DEFAULT_THEME": JSON.stringify(brand.defaultTheme),
          "import.meta.env.VITE_BRAND": JSON.stringify(brand.brandId),
        },
      }
    },
  }
}
