#!/usr/bin/env bun
// Empaquette un dist Vite brandé en bundle versionné prêt pour le registre GitHub.
// Usage: bun script/build-brand-bundle.ts --dist packages/app/dist --out /tmp/arkum-brand --version v2026.11.20-1
import { spawnSync } from "node:child_process"
import { createHash } from "node:crypto"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

const args = process.argv.slice(2)
const get = (name: string) => {
  const index = args.indexOf(`--${name}`)
  return index >= 0 ? args[index + 1] : undefined
}

const dist = get("dist")
const out = get("out")
const version = get("version")
if (!dist || !out || !version) {
  console.error("Usage: bun script/build-brand-bundle.ts --dist <dir> --out <dir> --version <tag>")
  process.exit(1)
}
if (!existsSync(dist)) {
  console.error(`dist introuvable: ${dist}`)
  process.exit(1)
}
if (!/^v[0-9]+\.[0-9]+\.[0-9]+(?:[-+][\w.-]+)?$/.test(version)) {
  console.error(`version invalide (attendu vX.Y.Z): ${version}`)
  process.exit(1)
}

const releaseDir = path.join(out, version)
mkdirSync(releaseDir, { recursive: true })
const archive = path.join(releaseDir, "bundle.tar.gz")

// `-C dist .` garde les chemins relatifs à la racine du dist.
const packed = spawnSync("tar", ["-czf", archive, "-C", dist, "."], { encoding: "utf8" })
if (packed.status !== 0) {
  console.error(`tar a échoué: ${packed.stderr?.trim()}`)
  process.exit(1)
}

const hash = createHash("sha256").update(readFileSync(archive)).digest("hex")
writeFileSync(path.join(releaseDir, "bundle.tar.gz.sha256"), `${hash}  bundle.tar.gz\n`)
// Pointeur publié à la racine du registre et lu par le polling Ray.
writeFileSync(path.join(out, "VERSION"), `${version}\n`)

console.log(`Bundle ${version} prêt dans ${releaseDir}`)
console.log(`SHA-256: ${hash}`)
