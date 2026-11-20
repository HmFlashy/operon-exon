# White-Label Brand Injection (Operon Exon)

**Status:** Implemented (opt-in). Default build is unchanged upstream Operon Exon.

This document explains how deployers can skin the Operon Exon web UI at **build time** to
produce an Arkum-branded frontend, without forking or editing upstream source. All injection
happens during Vite compilation so that PWA Workbox integrity hashes and the CLI's CSP hash
stay valid (see `vite.pwa.ts` and `packages/cli/src/services/web-ui.ts` for why post-build
rewrites are forbidden).

## Code paths

| File | Role |
| --- | --- |
| `packages/app/vite.branding.ts` | Parses brand config from env vars + optional JSON, exposes `loadBrandConfig()` and `brandingPlugin()`. |
| `packages/app/vite.icons.ts` | Favicon / touch-icon / PWA manifest substitution, with optional custom asset directory. |
| `packages/app/vite.js` | Registers `brandingPlugin()`; injects `window.__BRAND_DEFAULT_THEME__` preamble into the inlined theme preload script. |
| `packages/app/index.html` | `<title data-sm>%OPENCODE_PRODUCT_NAME%</title>` placeholder. |
| `packages/app/src/app.tsx` | Reads `VITE_PRODUCT_NAME` and `VITE_DEFAULT_THEME` for `<Title>` and `<ThemeProvider>`. |
| `packages/app/public/oc-theme-preload.js` | Reads `window.__BRAND_DEFAULT_THEME__` before falling back to `"oc-2"`. |
| `packages/ui/src/components/logo.tsx` | Branded `Mark` / `Splash` / `Logo` variants keyed on `VITE_BRAND`. |
| `packages/ui/src/theme/themes/arkum.json` | Official "Arkum Kinetic" theme (dark-first, Kinetic Cyber-Precision palette). |
| `packages/ui/src/theme/context.tsx` | Registers `arkum: "Arkum Kinetic"` in the theme display-name map. |

## Configuration

All variables are read at **build time** by `loadBrandConfig()`:

| Variable | Meaning | Default |
| --- | --- | --- |
| `OPENCODE_PRODUCT_NAME` | Product name shown in `<title>`, PWA manifest, About screen. | `Operon Exon` |
| `OPENCODE_DEFAULT_THEME` | Theme ID passed to `<ThemeProvider>` and the FOUC preload script. | `operon` |
| `OPENCODE_BRAND_PATH` | Absolute path to a brand asset directory containing `png/<slug>-brand-*.png`. | none (uses `desktop/icons/<channel>/`) |
| `OPENCODE_BRAND_CONFIG` | Optional path to a JSON file with `name`, `shortName`, `productName`, `theme.id`, `logo` fields. | none |

Example building Arkum Edition:

```bash
OPENCODE_BRAND_CONFIG=/home/dev/projects/arkum/assets/branding/branding.json \
OPENCODE_BRAND_PATH=/home/dev/projects/arkum/assets/branding \
OPENCODE_DEFAULT_THEME=arkum \
bun run build
```

`branding.json` already declares `"name": "Arkum"`, `"productName": "Arkum Cloud"` and theme
colors; `loadBrandConfig()` derives `brandId: "arkum"` from it, which activates the Arkum
Prisme SVG variants in `logo.tsx`.

## Invariants & why

1. **No brand env vars → identical upstream build.** `isCustom` is false, `productName` is
   `"Operon Exon"`, `defaultTheme` is `"operon"`, `brandId` is `"default"`. All placeholders
   resolve exactly as before.
2. **Preload script unit tests stay green.** `oc-theme-preload.js` keeps `"oc-2"` as its
   hardcoded JS fallback. The custom default is injected by `vite.js` as a
   `window.__BRAND_DEFAULT_THEME__` assignment prefixed inside the `<script id="...">` tag at
   build time. Tests eval the raw file (no preamble) → they still expect `"oc-2"`.
3. **Icon placeholder substitution happens in `icons()` plugin**, not only in
   `brandingPlugin()`. Isolated Vite builds used by `vite.icons.test.ts` load only `icons()`;
   putting the substitution there keeps the zero-placeholder assertion valid.
4. **Integrity of Workbox + CSP preserved.** All transformations run in `transformIndexHtml`
   (`order: "pre"`) during Vite's `build`, before Workbox hashes emitted assets and before
   the CLI computes the inline script SHA-256.

## Failure modes

| Symptom | Cause | Fix |
| --- | --- | --- |
| `<title>%OPENCODE_PRODUCT_NAME%</title>` in output | `icons()` plugin not present in Vite config | Ensure `icons(channel)` is listed in `vite.config.ts` plugins. |
| Theme flashes `oc-2` before Arkum theme loads | `inlineThemePreload` did not inject preamble | Check that `brand.isCustom && brand.defaultTheme !== "oc-2"` and that the `<script id="oc-theme-preload-script">` tag matches the regex in `inlineThemePreload`. |
| Workbox `Couldn't find configuration for either precaching or runtime caching` | `dist/` is empty when Workbox's `closeBundle` runs (happens in a fresh git worktree with symlinked `node_modules`, where Vite resolves `root` to the main checkout). | Build once from the real checkout, or make `dist/` resolvable from the worktree before invoking `vite build`. This is an environment artifact, not a branding failure. |
| CSP blocks theme preload | Inline script hash changed post-build | Never edit the emitted HTML after Vite. Rebuild instead. |

## Known limits

- **Brand is baked at build time.** Changing brand requires a new build. Hosted instances get
  the new build as a versioned bundle through the rollout pipeline described in
  [`brand-bundle-rollout.md`](./brand-bundle-rollout.md); reverse-proxy header injection is out
  of scope.
- **Custom brand asset directory** expects PNGs named `<slug>-brand-{squircle,square,circle}-1024x1024.png`
  under `<OPENCODE_BRAND_PATH>/png/`. Other layouts fall back to desktop channel icons.
- **Wordmark animation** in `packages/app/src/new-session/wordmark.tsx` still uses OpenCode's
  letter-by-letter physics paths. Arkum mode currently relies on the `Splash` monogram for
  branded surfaces; replacing the animated wordmark needs a separate slot integration.
- **Desktop / TUI surfaces** (`packages/desktop/`, `packages/tui/`) are not rebranded. They
  keep upstream identity; this system targets the hosted web UI only.
- `not verified on hardware`: the full `bun run build` was not validated inside an isolated
  worktree due to the Workbox `dist/` resolution note above. Unit tests
  (`vite.branding.test.ts`, `vite.icons.test.ts`, `theme-preload.test.ts`, UI 629 tests)
  all pass, and the reference checkout builds successfully.
