import { Option, Schema } from "effect"
import path from "node:path"

declare const OPENCODE_VERSION: string
declare const OPENCODE_CHANNEL: string
declare const OPENCODE_ARTIFACT: string
declare const OPENCODE_RELEASE_HIGHLIGHTS: string

const version = typeof OPENCODE_VERSION === "string" ? OPENCODE_VERSION : "local"
const channel = typeof OPENCODE_CHANNEL === "string" ? OPENCODE_CHANNEL : "local"
const artifact = typeof OPENCODE_ARTIFACT === "string" ? OPENCODE_ARTIFACT : "cli"
// Stable release builds embed the release notes' Highlights; every other build has none.
const highlights =
  typeof OPENCODE_RELEASE_HIGHLIGHTS === "string"
    ? Option.getOrElse(
        Schema.decodeUnknownOption(
          Schema.fromJsonString(Schema.Array(Schema.Struct({ title: Schema.String, body: Schema.String }))),
        )(OPENCODE_RELEASE_HIGHLIGHTS),
        () => [],
      )
    : []

export {
  version as OPENCODE_VERSION,
  channel as OPENCODE_CHANNEL,
  artifact as OPENCODE_ARTIFACT,
  highlights as OPENCODE_HIGHLIGHTS,
}
export const OPENCODE_LOCAL = channel === "local"

/**
 * Optional directory of prebuilt web assets served instead of the embedded Brotli archive.
 * Prism sets this at provisioning to mount a tenant-branded frontend without recompiling the CLI.
 * The value is read at runtime (not a build define) so one binary works for every tenant.
 */
export const OPENCODE_WEB_ASSETS_DIR: string | undefined = (() => {
  const value = process.env.OPENCODE_WEB_ASSETS_DIR?.trim()
  return value ? path.resolve(value) : undefined
})()
