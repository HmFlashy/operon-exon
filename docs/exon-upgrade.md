# `exon upgrade` version resolution

Status: fixed, with a regression test added alongside the `install` change. The exact trigger of the original failure
was not reproduced (see Known limits). Not verified visually.

`exon upgrade <version> --method curl` downloads the `install` script from the `dev` branch and runs it with
`--version <version> --no-modify-path`. The script decides where the binary comes from. Exon releases live on GitHub
(`arkum-cloud/operon-exon`), not on npm. Upstream OpenCode versions live on npm.

## Code paths

Line numbers describe the file before the fix and shift as the fix lands.

| What                                                  | Where                                             |
| ----------------------------------------------------- | ------------------------------------------------- |
| Download and run `install` for the `curl` method      | `packages/cli/src/services/updater.ts:586`        |
| Source selection: GitHub release or npm               | `install:178-194` (`use_github_release`)          |
| npm 404 error for a version that is not on the registry | `install:226`                                   |

## How the source is chosen

1. No `--version`: ask the GitHub API for `releases/latest`. If a `tag_name` comes back, use that release.
2. With `--version X`: strip a leading `v`, then query `releases/tags/vX`.
   - HTTP 200: download `operon-exon-<target>.tar.gz` from the GitHub release.
   - Anything else: fall through to the npm registry and look for `@opencode/cli-<target>` at version `X`, then
     `@opencode-ai/cli-<target>`.

## Invariants

- A version containing `-exon.` (for example `2.3.0-exon.1`) is an Exon release. It must resolve to the GitHub release
  and never to npm. Exon builds are not published to the npm packages, so any npm lookup for them can only fail.
  Falling back to npm turns a transient GitHub answer (rate limit, network error, non-200 status) into a misleading
  "not available" error.
- Upstream versions (no `-exon.` suffix) keep the previous behavior: try the GitHub tag first, then npm.

## Failure mode

The tag check at `install:178-194` treated any non-200 answer as "not an Exon release" and silently switched to npm.
The npm registry returns 404 for `-exon.*` versions, so the script ended at `install:226` with:

```
Error: Version 2.3.0-exon.1 is not available for linux-x64
```

The message names a platform package and a registry the user never asked for, which hides the real cause: the GitHub
tag lookup did not return 200.

## Behavior after the fix

- Version matching `-exon.*`: download directly from the GitHub release URL
  `https://github.com/arkum-cloud/operon-exon/releases/download/v<version>/operon-exon-<target>.tar.gz`. No tag
  probe, no npm fallback.
- Any other version: unchanged (GitHub tag probe, then npm).
- No version: unchanged (latest GitHub release).

## Known limits

- The exact trigger was not reproduced. The release tags answer HTTP 200 when probed by hand, so why the probe
  returned something else for the affected user is unknown (rate limiting and a network error are candidates, not
  confirmed).
- If the GitHub release asset itself is missing for a platform, the download fails with a curl error from the GitHub
  URL, not with the npm message above.
- Not verified visually, and not verified on platforms other than `linux-x64`.
