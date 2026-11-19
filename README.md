<p align="center">
  <picture>
    <source srcset=".github/assets/logo-ornate-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset=".github/assets/logo-ornate-light.svg" media="(prefers-color-scheme: light)">
    <img src=".github/assets/logo-ornate-light.svg" alt="Operon Exon logo">
  </picture>
</p>
<p align="center">The open source AI coding agent — Forked & tailored by Arkum Cloud.</p>
<p align="center">
  <a href="https://github.com/arkum-cloud/operon-exon"><img alt="GitHub repo" src="https://img.shields.io/badge/github-arkum--cloud%2Foperon--exon-blue?style=flat-square" /></a>
  <a href="https://github.com/arkum-cloud/operon-exon/releases"><img alt="Release" src="https://img.shields.io/github/v/release/arkum-cloud/operon-exon?style=flat-square&color=orange" /></a>
</p>

<p align="center">
  <a href="README.md">English</a> |
  <a href="README.fr.md">Français</a>
</p>

[![Operon Exon Terminal UI](services/site/public/v1/docs/assets/lander/screenshot.png)](https://github.com/arkum-cloud/operon-exon)

---

### Installation

```bash
curl -fsSL https://raw.githubusercontent.com/arkum-cloud/operon-exon/dev/install | bash
```

This installs the `exon` binary CLI (along with `operon-exon` and `opencode` aliases) directly to `$HOME/.opencode/bin`.

### Usage

```bash
# Launch the TUI
exon

# Or using the alias
operon-exon
opencode
```

#### Self-Update

Operon Exon includes a built-in updater checking releases from `arkum-cloud/operon-exon`:

```bash
exon update
```

### Agents

Operon Exon includes built-in agents you can switch between with the `Tab` key.

- **build** - Default, full-access agent for development work
- **plan** - Read-only agent for analysis and code exploration
  - Denies file edits by default
  - Asks permission before running bash commands
  - Ideal for exploring unfamiliar codebases or planning changes

Also included is a **general** subagent for complex searches and multistep tasks.
This is used internally and can be invoked using `@general` in messages.

### Documentation & Upstream

Fork-specific notes live in `docs/`:

- [`docs/window-left.md`](docs/window-left.md) — the experimental `window.left` plugin column.
- [`docs/exon-upgrade.md`](docs/exon-upgrade.md) — how `exon upgrade` resolves a version (GitHub release vs npm).

Operon Exon is built on top of [OpenCode](https://github.com/anomalyco/opencode).
For general configuration, tools, and agent workflows, refer to the [upstream documentation](https://opencode.ai/docs).
