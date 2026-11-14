<p align="center">
  <picture>
    <source srcset=".github/assets/logo-ornate-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset=".github/assets/logo-ornate-light.svg" media="(prefers-color-scheme: light)">
    <img src=".github/assets/logo-ornate-light.svg" alt="Logo Operon Exon">
  </picture>
</p>
<p align="center">L'agent de codage IA open source — Forké et adapté par Arkum Cloud.</p>
<p align="center">
  <a href="https://github.com/arkum-cloud/operon-exon"><img alt="Dépôt GitHub" src="https://img.shields.io/badge/github-arkum--cloud%2Foperon--exon-blue?style=flat-square" /></a>
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

Le script installe le binaire CLI `exon` (avec les alias `operon-exon` et `opencode`) directement dans `$HOME/.opencode/bin`.

### Utilisation

```bash
# Lancer le TUI
exon

# Ou via les alias
operon-exon
opencode
```

#### Mise à jour

Operon Exon intègre un système de mise à jour automatique vérifiant les releases de `arkum-cloud/operon-exon` :

```bash
exon update
```

### Agents

Operon Exon inclut des agents intégrés que vous pouvez basculer avec la touche `Tab`.

- **build** - Agent par défaut avec accès complet pour le développement
- **plan** - Agent en lecture seule pour l'analyse et l'exploration de code
  - Refuse les modifications de fichiers par défaut
  - Demande confirmation avant d'exécuter des commandes bash

Un sous-agent **general** est aussi inclus pour les recherches complexes et les tâches multi-étapes (`@general`).

### Documentation & Upstream

Operon Exon est basé sur [OpenCode](https://github.com/anomalyco/opencode).
Pour la configuration générale et les workflows, consultez la [documentation upstream](https://opencode.ai/docs).
