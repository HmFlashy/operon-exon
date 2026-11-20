import { Effect, FileSystem, Option } from "effect"
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import path from "node:path"
import { brotliDecompressSync } from "node:zlib"
import { AppArchive } from "./app-archive"
import { OPENCODE_LOCAL, OPENCODE_WEB_ASSETS_DIR } from "./version"

export type AssetMap = Readonly<Record<string, string | Uint8Array>>
/** Each asset's brotli-compressed bytes, when the build embedded them. */
export type BrotliMap = Readonly<Record<string, Uint8Array>>

export const load = Effect.fn("cli.app-assets.load")(function* () {
  // A mounted tenant-branded assets directory wins over the embedded archive.
  // This lets one CLI binary serve different brands per provisioned instance
  // without recompiling (Prism writes the dir at provisioning time).
  // The returned proxy watches VERSION so a Ray symlink swap is picked up live.
  if (OPENCODE_WEB_ASSETS_DIR && existsSync(OPENCODE_WEB_ASSETS_DIR))
    return { files: liveAssets(OPENCODE_WEB_ASSETS_DIR), brotli: undefined }

  const embedded = yield* Effect.tryPromise(() => import("virtual:opencode-app-assets")).pipe(
    Effect.map((module) => AppArchive.decode(module.default())),
    Effect.option,
  )
  if (Option.isSome(embedded) && (Object.keys(embedded.value).length > 0 || !OPENCODE_LOCAL))
    return {
      files: lazy(embedded.value, (key) => brotliDecompressSync(embedded.value[key]!)),
      brotli: embedded.value,
    }
  if (!OPENCODE_LOCAL) return yield* Effect.fail(new Error("Web UI assets are missing from the CLI build"))
  return { files: yield* sourceAssets(), brotli: undefined }
})

const sourceAssets = Effect.fnUntraced(function* (rootOverride?: string) {
  const fs = yield* FileSystem.FileSystem
  const root = rootOverride ?? path.resolve(import.meta.dirname, "../../app/dist")
  const files = yield* fs.readDirectory(root, { recursive: true })
  const assets = Object.fromEntries(
    (yield* Effect.forEach(
      files.filter((file) => !file.endsWith(".map")),
      Effect.fnUntraced(function* (file) {
        const target = path.join(root, file)
        if ((yield* fs.stat(target)).type === "Directory") return
        return [file, target] as const
      }),
      { concurrency: "unbounded" },
    )).filter((asset) => asset !== undefined),
  )
  return lazy(assets, (key) => readFileSync(assets[key]!))
})

function lazy(assets: Readonly<Record<string, unknown>>, load: (key: string) => Uint8Array): AssetMap {
  // Immutable browser caching makes retaining decompressed copies in the server unnecessary.
  return new Proxy(
    {},
    {
      get: (_, key) => {
        if (typeof key !== "string" || assets[key] === undefined) return
        const body = load(key)
        return isText(key) ? Buffer.from(body).toString() : body
      },
    },
  )
}

/**
 * Asset map that follows a `current` symlink swapped by Ray during a brand rollout.
 * Each access compares the VERSION stamp; on change it re-scans the directory.
 * This avoids a CLI restart when Prism pushes a new bundle to every host.
 */
function liveAssets(root: string): AssetMap {
  let currentVersion: string | undefined
  let delegate: AssetMap = emptyAssets()

  const refresh = () => {
    const versionFile = path.join(root, "VERSION")
    let version: string
    try {
      version = readFileSync(versionFile, "utf8").trim()
    } catch {
      version = "__none__"
    }
    if (version !== currentVersion) {
      currentVersion = version
      delegate = scanDirectory(root)
    }
  }
  refresh()

  return new Proxy(
    {},
    {
      get: (_, key) => {
        if (typeof key !== "string") return
        refresh()
        return delegate[key]
      },
      has: (_, key) => {
        if (typeof key !== "string") return false
        refresh()
        return key in delegate
      },
      ownKeys: () => {
        refresh()
        return Reflect.ownKeys(delegate)
      },
      getOwnPropertyDescriptor: (_, key) => {
        refresh()
        const descriptor = Reflect.getOwnPropertyDescriptor(delegate, key)
        return descriptor ? { ...descriptor, configurable: true } : undefined
      },
    },
  )
}

function emptyAssets(): AssetMap {
  return Object.freeze({}) as AssetMap
}

function scanDirectory(root: string): AssetMap {
  const files = readdirRecursive(root)
  const assets: Record<string, string> = {}
  for (const file of files) {
    if (file.endsWith(".map")) continue
    const target = path.join(root, file)
    let stat
    try {
      stat = statSync(target)
    } catch {
      continue
    }
    if (stat.isDirectory()) continue
    assets[file] = target
  }
  return lazy(assets, (key) => readFileSync(assets[key]!))
}

function readdirRecursive(root: string): string[] {
  const out: string[] = []
  const walk = (dir: string, prefix: string) => {
    for (const entry of readdirSync(dir)) {
      const full = path.join(dir, entry)
      const rel = prefix ? `${prefix}/${entry}` : entry
      out.push(rel)
      try {
        if (statSync(full).isDirectory()) walk(full, rel)
      } catch {
        // broken symlink during a swap — skip
      }
    }
  }
  try {
    walk(root, "")
  } catch {
    // directory not ready yet
  }
  return out
}

function isText(file: string) {
  return file === "_headers" || /\.(?:css|html|js|json|svg|txt|webmanifest|xml)$/.test(file)
}
