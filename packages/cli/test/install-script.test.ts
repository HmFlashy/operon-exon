import { describe, expect, test } from "bun:test"
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"

const installer = path.join(import.meta.dir, "..", "..", "..", "install")

describe.skipIf(process.platform === "win32")("install script version selection", () => {
  test("keeps -exon versions on the GitHub release without probing the API or npm", async () => {
    const result = await install("2.3.2-exon.1")
    expect(result.exitCode).toBe(0)
    expect(result.urls).toHaveLength(1)
    expect(result.urls[0]).toMatch(
      /^https:\/\/github\.com\/arkum-cloud\/operon-exon\/releases\/download\/v2\.3\.2-exon\.1\/operon-exon-[a-z0-9-]+\.tar\.gz$/,
    )
    expect(result.urls.join("\n")).not.toContain("npmjs.org")
    expect(result.urls.join("\n")).not.toContain("api.github.com")
  })

  test("accepts a leading v on -exon versions", async () => {
    const result = await install("v2.3.2-exon.1")
    expect(result.exitCode).toBe(0)
    expect(result.urls).toHaveLength(1)
    expect(result.urls[0]).toContain("/releases/download/v2.3.2-exon.1/")
  })

  test("names the version and target when an -exon download fails instead of falling back to npm", async () => {
    const result = await install("2.3.2-exon.9", { CURL_DOWNLOAD_EXIT: "22" })
    expect(result.exitCode).toBe(22)
    expect(result.stdout + result.stderr).toMatch(/Could not download Exon v2\.3\.2-exon\.9 for (linux|darwin)-[a-z0-9-]+/)
    expect(result.urls.join("\n")).not.toContain("npmjs.org")
    expect(result.urls.join("\n")).not.toContain("api.github.com")
  })

  test("still preflights upstream versions and falls back to npm when no release exists", async () => {
    const result = await install("1.2.3", { CURL_STATUS: "404" })
    expect(result.exitCode).toBe(1)
    expect(result.urls[0]).toBe("https://api.github.com/repos/arkum-cloud/operon-exon/releases/tags/v1.2.3")
    expect(result.urls.some((url) => url.includes("registry.npmjs.org"))).toBe(true)
    expect(result.stdout + result.stderr).toContain("Version 1.2.3 is not available for")
  })
})

// Shim curl and tar on PATH so the installer runs offline and records every URL it would have requested.
async function install(version: string, env: Record<string, string> = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), "opencode-install-"))
  try {
    const bin = path.join(root, "shim")
    const log = path.join(root, "curl.log")
    await mkdir(bin)
    await writeFile(
      path.join(bin, "curl"),
      `#!/usr/bin/env bash
out=""
status=false
for arg in "$@"; do
  if [ "$prev" = "-o" ]; then out="$arg"; fi
  if [ "$arg" = "-w" ]; then status=true; fi
  prev="$arg"
done
echo "\${@: -1}" >> "$CURL_LOG"
if [ "$status" = "true" ]; then printf '%s' "\${CURL_STATUS:-404}"; exit 0; fi
if [ -n "$out" ]; then
  if [ "\${CURL_DOWNLOAD_EXIT:-0}" != "0" ]; then exit "$CURL_DOWNLOAD_EXIT"; fi
  : > "$out"
  exit 0
fi
exit 22
`,
    )
    await writeFile(
      path.join(bin, "tar"),
      `#!/usr/bin/env bash
while [ $# -gt 0 ]; do
  if [ "$1" = "-C" ]; then : > "$2/exon"; fi
  shift
done
`,
    )
    await Promise.all([chmod(path.join(bin, "curl"), 0o755), chmod(path.join(bin, "tar"), 0o755)])
    await writeFile(log, "")
    const child = Bun.spawn(["bash", installer, "--version", version, "--no-modify-path"], {
      env: {
        ...process.env,
        HOME: root,
        TMPDIR: root,
        PATH: `${bin}:${process.env.PATH}`,
        CURL_LOG: log,
        ...env,
      },
      stdout: "pipe",
      stderr: "pipe",
    })
    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
      child.exited,
    ])
    const urls = (await readFile(log, "utf8")).split("\n").filter(Boolean)
    return { stdout, stderr, exitCode, urls }
  } finally {
    await rm(root, { recursive: true, force: true })
  }
}
