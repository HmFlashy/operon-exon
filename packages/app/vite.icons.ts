import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import type { Plugin } from "vite"
import manifest from "./manifest.json" with { type: "json" }
import { loadBrandConfig } from "./vite.branding.ts"

/**
 * Build the icon file list.
 *
 * When OPENCODE_BRAND_PATH is set and contains the expected files, those brand
 * assets are served instead of the desktop channel icons.  The fallback is the
 * standard desktop/icons/<channel>/ directory used for every other build.
 *
 * Brand path layout expected (PNG files at 1024×1024 are downscaled by the
 * browser; for now we serve the largest PNG available):
 *   <OPENCODE_BRAND_PATH>/png/<brand>-brand-squircle-1024x1024.png  → favicon / touch-icon
 *   <OPENCODE_BRAND_PATH>/png/<brand>-brand-squircle-1024x1024.png  → PWA manifests
 */
export function icons(channel: string): Plugin {
  const selected = channel === "beta" || channel === "prod" ? channel : "dev"
  const prefix = `icons/${selected}`

  const brand = loadBrandConfig()

  // Resolve brand icon files when a custom brand path is configured.
  let brandFavicon: Buffer | undefined
  let brandTouchIcon: Buffer | undefined
  let brandPwa192: Buffer | undefined
  let brandPwa512: Buffer | undefined

  if (brand.brandPath) {
    const bp = brand.brandPath
    // Look for <brandName>-brand-squircle-1024x1024.png (squircle variant) or fallback to square
    const brandSlug = brand.name.toLowerCase()
    const candidates = [
      path.join(bp, "png", `${brandSlug}-brand-squircle-1024x1024.png`),
      path.join(bp, "png", `${brandSlug}-brand-square-1024x1024.png`),
      path.join(bp, "png", `${brandSlug}-brand-circle-1024x1024.png`),
    ]
    const foundPng = candidates.find((f) => existsSync(f))
    if (foundPng) {
      const img = readFileSync(foundPng)
      brandFavicon = img
      brandTouchIcon = img
      brandPwa192 = img
      brandPwa512 = img
    }

    // Also try to find a .ico in the brand path
    const icoPath = path.join(bp, "favicon.ico")
    if (existsSync(icoPath)) brandFavicon = readFileSync(icoPath)
  }

  const useBrandAssets = !!(brandFavicon && brandTouchIcon && brandPwa192 && brandPwa512)

  const webManifest = {
    ...manifest,
    ...(brand.isCustom
      ? {
          name: brand.productName,
          short_name: brand.shortName,
          theme_color: "#080a0f",
          background_color: "#080a0f",
        }
      : {}),
    icons: manifest.icons.map((icon) => ({ ...icon, src: `/${prefix}${icon.src}` })),
  }

  const files = [
    ...(useBrandAssets
      ? [
          {
            fileName: `${prefix}/favicon.ico`,
            source: brandFavicon!,
            type: "image/x-icon",
          },
          {
            fileName: `${prefix}/apple-touch-icon.png`,
            source: brandTouchIcon!,
            type: "image/png",
          },
          {
            fileName: `${prefix}/web-app-manifest-192x192.png`,
            source: brandPwa192!,
            type: "image/png",
          },
          {
            fileName: `${prefix}/web-app-manifest-512x512.png`,
            source: brandPwa512!,
            type: "image/png",
          },
        ]
      : Object.entries({
          "favicon.ico": "icon.ico",
          "apple-touch-icon.png": "ios/AppIcon-60x60@3x.png",
          "web-app-manifest-192x192.png": "android/mipmap-xxxhdpi/ic_launcher.png",
          "web-app-manifest-512x512.png": "icon.png",
        }).map(([name, source]) => ({
          fileName: `${prefix}/${name}`,
          source: readFileSync(new URL(`../desktop/icons/${selected}/${source}`, import.meta.url)),
          type: name.endsWith(".ico") ? "image/x-icon" : "image/png",
        }))),
    {
      fileName: "site.webmanifest",
      source: JSON.stringify(webManifest),
      type: "application/manifest+json",
    },
  ]

  return {
    name: "opencode-app:icons",
    generateBundle() {
      files.forEach((file) => this.emitFile({ type: "asset", fileName: file.fileName, source: file.source }))
    },
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const file = files.find((file) => `/${file.fileName}` === request.url?.split("?")[0])

        if (!file) return next()
        response.setHeader("Content-Type", file.type)
        response.end(file.source)
      })
    },
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        return html
          .replace("%OPENCODE_FAVICON%", `/${prefix}/favicon.ico`)
          .replace("%OPENCODE_APPLE_TOUCH_ICON%", `/${prefix}/apple-touch-icon.png`)
          .replace("%OPENCODE_PRODUCT_NAME%", brand.productName)
      },
    },
  }
}
