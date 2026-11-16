import { createMemo } from "solid-js"
import { createMediaQuery } from "@solid-primitives/media"
import { BuiltinSlot } from "@opencode/plugin/gui/builtin"
import { usePluginHost } from "@/runtime/plugin/host"
import { useSettings } from "@/settings/model"

/**
 * Whether the window has an experimental `window.left` column: the Settings › Experimental switch is on, the window is
 * at least 768px wide and a plugin contributes. The shell renders the column and the titlebar its toggle only while
 * this holds, so neither leaves DOM behind. This is the one place that decides it.
 */
export function useWindowLeftAvailable() {
  const host = usePluginHost()
  const settings = useSettings()
  const desktop = createMediaQuery("(min-width: 768px)")
  const contributed = createMemo(() => host.items(BuiltinSlot).some((item) => item.value.at === "window.left"))

  return () => settings.general.windowLeft() && desktop() && contributed()
}
