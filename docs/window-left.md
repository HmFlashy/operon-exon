# `window.left` plugin column

Status: experimental. Behind a local switch in Settings › Experimental, off by default. Not verified visually and not
exercised end to end; only the slot stacking is covered by a component test.

`window.left` is a GUI plugin slot. Plugins that contribute to it fill a persistent column between the vertical tabs
sidebar and `<main>`. The slot, the titlebar toggle and the column exist only while the switch is on and at least one
plugin contributes; otherwise none of them leaves DOM behind.

## Code paths

| What                                   | Where                                                                                    |
| -------------------------------------- | ---------------------------------------------------------------------------------------- |
| Slot type and TSDoc                    | `packages/plugin/src/gui/registries.ts` (`SlotMap["window.left"]`)                       |
| Type test                              | `packages/plugin/src/gui/context.typecheck.ts`                                           |
| Availability rule                      | `packages/app/src/shell/window-left.ts` (`useWindowLeftAvailable`)                       |
| Column                                 | `packages/app/src/shell/shell.tsx` (`<aside id="window-left">`, before `<main>`)         |
| Toggle                                 | `packages/app/src/shell/window-left-toggle.tsx`, placed in `shell/titlebar/titlebar.tsx` |
| Open state and width                   | `packages/app/src/shell/state/layout.tsx` (`windowLeft`, `WINDOW_LEFT_WIDTH`)            |
| Switch                                 | `packages/app/src/settings/model.tsx` (`general.windowLeft`), `settings/experimental/`   |
| Stacking and error isolation (testing) | `packages/app/component-tests/plugin-host.spec.ts`                                       |

## How to turn it on

1. Settings › Experimental › **Plugin column** (`data-action="settings-window-left"`). The setting key is
   `settings.general.windowLeft`, default `false`.
2. Install or enable a plugin that does `ctx.add(Slot, { at: "window.left", render })`.
3. Use the toggle (`layout-left` icon) in the titlebar.

There is no `window_left` key in `packages/schema/src/config/flag.ts`. Feature flags are read by Core only, and no
flag state reaches the client, so a server flag would have nothing on the app side to read it. If that changes, wire it
inside `useWindowLeftAvailable`, the single place that decides availability.

## Where the column sits

- Default "Top tabs" layout: there is no vertical sidebar, so the column is at the far left, under the titlebar.
- "Side tabs" or "Inbox" (Settings › Preferences › Interface layout): the column sits right of
  `#vertical-tabs-sidebar`. That aside is not modified.
- Several plugins can contribute. Contributions stack top to bottom, sorted by `order` (default 0).

## Invariants

- **Zero DOM when unavailable.** `useWindowLeftAvailable` is `setting ON && width >= 768px && at least one
  contribution`. The shell wraps the column in `<Show>` on it and the toggle does the same. Why: a plugin-less or
  disabled window must not pay for an empty column or a dead button.
- **Closed stays mounted.** A closed column is `hidden` and `inert`, not unmounted. Why: a plugin's state (scroll,
  inputs, subscriptions) survives a toggle. Consequence: a plugin cannot tell "closed" from "open".
- **Closed by default.** `layout.windowLeft` is absent from storage until the user touches it; the accessors fall back
  to closed and `WINDOW_LEFT_WIDTH.initial`.
- **Independent of `tabsWidth`.** The column has its own width: 280px by default, resize range 200–480px, capped at
  `max-w-[50%]` of the window.
- **Persisted.** Open state and width live in `layout.windowLeft` (`{ opened, width }`) in the shell layout store.
  A stored value of the wrong shape decodes to "absent" rather than failing the whole layout.
- **No column on mobile.** Below 768px neither the toggle nor the column renders, whatever the setting says.
- **One contribution cannot take the column down.** `PluginSlot` wraps each contribution in `Contribution`'s
  `ErrorBoundary`, which renders nothing and records the failure on the plugin; the other contributions stay.

## Toggle placement

- Horizontal tabs, or Windows: in the titlebar, after the sidebar toggle.
- Vertical tabs on macOS and Linux: the titlebar is hidden, so the toggle sits in the vertical sidebar header, before
  the sidebar toggle.

## Failure modes

- A contribution throws while rendering: it renders nothing and the plugin's status becomes failed (Settings › Plugins
  shows the error). The rest of the column keeps rendering. The error text is the thrown one, for example
  `broken contribution`.
- The setting is on but nothing is shown: no plugin currently contributes to `window.left`, or the window is under
  768px wide. This is the intended state, not a bug.
- The toggle shows but the column is blank: a plugin contributed an element that renders empty. The column is mounted
  and open; check that plugin.

## Known limits

- The switch is local to the client. It is not a server feature flag, so `OPENCODE_FLAGS`, `experimental.*` in config
  and `OPENCODE_FLAGS=all` have no effect on it, and it does not follow the "on in local and dev builds" default of
  server flags: it is off everywhere until the user turns it on.
- The column width adds to `tabsWidth` (up to 640px with vertical tabs). On a narrow desktop window both can squeeze
  `<main>`.
- No keyboard shortcut and no command palette entry for the toggle.
- The width is written to the layout store on every resize-handle move, as `session.resize` does.
- A plugin cannot open or close the column, nor read its state.
- Not verified visually, on macOS, or with vertical tabs on a real desktop window. Only the stacking and error
  isolation are tested (component test) plus the layout persistence (unit test).
