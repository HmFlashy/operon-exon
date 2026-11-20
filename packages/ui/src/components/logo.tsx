import { type ComponentProps, Show } from "solid-js"

// ---------------------------------------------------------------------------
// Brand detection (injected at build time by vite.branding.ts)
// ---------------------------------------------------------------------------
// import.meta.env.VITE_BRAND is "arkum" | "default" (or any other custom brand slug)
const brand =
  typeof import.meta !== "undefined" &&
  typeof (import.meta as any).env !== "undefined"
    ? (import.meta as any).env.VITE_BRAND ?? "default"
    : "default"

const isArkum = brand === "arkum"

// ---------------------------------------------------------------------------
// Mark — compact monogram (used in sidebars, breadcrumbs, favicon contexts)
// ---------------------------------------------------------------------------
export const Mark = (props: { class?: string }) => {
  if (isArkum) return <ArkumMark class={props.class} />

  return (
    <svg
      data-component="logo-mark"
      classList={{ [props.class ?? ""]: !!props.class }}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M1 2H5L10 10L5 18H1L6 10Z" fill="var(--icon-weak-base)" />
      <path d="M19 2H15L10 10L15 18H19L14 10Z" fill="var(--icon-strong-base)" />
      <path d="M10 5.5L14 10L10 14.5L6 10Z" fill="var(--icon-base)" stroke="var(--icon-weak-base)" stroke-width="0.8" />
      <circle cx="10" cy="10" r="1.8" fill="var(--icon-weak-base)" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Splash — large display monogram (new session screen, onboarding)
// ---------------------------------------------------------------------------
export const Splash = (props: Pick<ComponentProps<"svg">, "ref" | "class">) => {
  if (isArkum) return <ArkumSplash ref={props.ref} class={props.class} />

  return (
    <svg
      ref={props.ref}
      data-component="logo-splash"
      classList={{ [props.class ?? ""]: !!props.class }}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6 6H22L40 40L22 74H6L24 40Z" fill="var(--icon-weak-base)" />
      <path d="M74 6H58L40 40L58 74H74L56 40Z" fill="var(--icon-strong-base)" />
      <path d="M40 20L56 40L40 60L24 40Z" fill="var(--icon-base)" stroke="var(--icon-strong-base)" stroke-width="2" />
      <path d="M40 29L46 40L40 51L34 40Z" fill="var(--icon-weak-base)" />
      <circle cx="40" cy="40" r="3" fill="var(--icon-strong-base)" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Logo — wordmark with leading mark (topbars, login screens)
// ---------------------------------------------------------------------------
export const Logo = (props: { class?: string }) => {
  if (isArkum) return <ArkumLogo class={props.class} />

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 234 42"
      fill="none"
      classList={{ [props.class ?? ""]: !!props.class }}
    >
      <g>
        <path d="M1 6H7L12 21L7 36H1L6 21Z" fill="var(--icon-weak-base)" />
        <path d="M23 6H17L12 21L17 36H23L18 21Z" fill="var(--icon-strong-base)" />
        <path d="M12 15L17 21L12 27L7 21Z" fill="var(--icon-base)" />
        <circle cx="12" cy="21" r="1.6" fill="var(--icon-weak-base)" />
      </g>
      <g stroke="var(--icon-base)" stroke-width="5" stroke-linecap="square" stroke-linejoin="miter" fill="none">
        <path d="M48 9H78M48 9V33M48 21H72M48 33H78" />
        <path d="M90 9L122 33M122 9L90 33" />
        <path d="M136 9H154L158 13V29L154 33H136L132 29V13Z" />
        <path d="M176 33V9L210 33V9" />
      </g>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Arkum brand variants
// ---------------------------------------------------------------------------

/** Arkum Prisme de Convergence — compact mark (16×20 viewport to match OpenCode Mark) */
const ArkumMark = (props: { class?: string; ref?: (el: SVGSVGElement) => void }) => (
  <svg
    ref={props.ref}
    data-component="logo-mark"
    data-brand="arkum"
    classList={{ [props.class ?? ""]: !!props.class }}
    viewBox="0 0 16 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="ak_m_lw" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0284c7" />
        <stop offset="100%" stop-color="#075985" />
      </linearGradient>
      <linearGradient id="ak_m_rw" x1="1" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#38bdf8" />
        <stop offset="100%" stop-color="#0284c7" />
      </linearGradient>
    </defs>
    {/* Left wing */}
    <path d="M8 1 L2 15 L4.5 15 L8 7 Z" fill="url(#ak_m_lw)" />
    {/* Right wing */}
    <path d="M8 1 L8 7 L11.5 15 L14 15 Z" fill="url(#ak_m_rw)" />
    {/* Crossbar */}
    <rect x="4" y="10" width="8" height="2" rx="0.5" fill="#080a0f" stroke="#38bdf8" stroke-width="0.5" />
    {/* Apex dot */}
    <circle cx="8" cy="1" r="0.8" fill="#38bdf8" />
  </svg>
)

/** Arkum Prisme de Convergence — large Splash (80×100 viewport to match OpenCode Splash) */
const ArkumSplash = (props: Pick<ComponentProps<"svg">, "ref" | "class">) => (
  <svg
    ref={props.ref}
    data-component="logo-splash"
    data-brand="arkum"
    classList={{ [props.class ?? ""]: !!props.class }}
    viewBox="0 0 80 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="ak_s_bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#080a0f" />
        <stop offset="100%" stop-color="#0f1522" />
      </linearGradient>
      <linearGradient id="ak_s_lw" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0284c7" />
        <stop offset="100%" stop-color="#075985" />
      </linearGradient>
      <linearGradient id="ak_s_rw" x1="1" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#38bdf8" />
        <stop offset="100%" stop-color="#0284c7" />
      </linearGradient>
      <filter id="ak_s_glow">
        <feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="#0284c7" flood-opacity="0.6" />
      </filter>
    </defs>
    {/* Background */}
    <rect width="80" height="100" rx="10" fill="url(#ak_s_bg)" />
    {/* Orbital ring */}
    <circle cx="40" cy="50" r="35" fill="none" stroke="#1e293b" stroke-width="0.8" />
    {/* Wings */}
    <g filter="url(#ak_s_glow)">
      <path d="M 40 10 L 18 72 L 27 72 L 40 38 Z" fill="url(#ak_s_lw)" stroke="#0369a1" stroke-width="0.5" />
      <path d="M 40 10 L 40 38 L 53 72 L 62 72 Z" fill="url(#ak_s_rw)" stroke="#38bdf8" stroke-width="0.5" />
      {/* Crossbar */}
      <polygon points="24,54 56,54 53,61 27,61" fill="#080d16" stroke="#38bdf8" stroke-width="1" />
      <circle cx="40" cy="57.5" r="1.2" fill="#ffffff" />
    </g>
    {/* Apex accent */}
    <circle cx="40" cy="10" r="2" fill="#38bdf8" />
    {/* Bottom anchor */}
    <line x1="30" y1="82" x2="50" y2="82" stroke="#1e293b" stroke-width="2" stroke-linecap="round" />
    <circle cx="40" cy="82" r="1.5" fill="#38bdf8" />
  </svg>
)

/** Arkum wordmark — "Arkum" text with leading Prisme mark */
const ArkumLogo = (props: { class?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 180 32"
    fill="none"
    data-brand="arkum"
    classList={{ [props.class ?? ""]: !!props.class }}
  >
    <defs>
      <linearGradient id="ak_l_lw" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0284c7" />
        <stop offset="100%" stop-color="#075985" />
      </linearGradient>
      <linearGradient id="ak_l_rw" x1="1" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#38bdf8" />
        <stop offset="100%" stop-color="#0284c7" />
      </linearGradient>
    </defs>
    {/* Mark — left wing */}
    <path d="M13 2 L4 25 L7.5 25 L13 11 Z" fill="url(#ak_l_lw)" />
    {/* Mark — right wing */}
    <path d="M13 2 L13 11 L18.5 25 L22 25 Z" fill="url(#ak_l_rw)" />
    {/* Crossbar */}
    <rect x="6.5" y="17" width="13" height="3" rx="0.5" fill="#080a0f" stroke="#38bdf8" stroke-width="0.6" />
    {/* Apex dot */}
    <circle cx="13" cy="2" r="1.2" fill="#38bdf8" />
    {/* "Arkum" wordmark — geometric pixel-style to match Kinetic Cyber-Precision */}
    <text
      x="30"
      y="22"
      font-family="system-ui, -apple-system, 'Segoe UI', sans-serif"
      font-size="16"
      font-weight="600"
      letter-spacing="0.5"
      fill="var(--icon-strong-base, #e0f2fe)"
    >
      Arkum
    </text>
  </svg>
)
