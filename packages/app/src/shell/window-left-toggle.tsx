import { Show } from "solid-js"
import { Icon } from "@opencode/ui/icon"
import { IconButton } from "@opencode/ui/icon-button"
import { Keybind } from "@opencode/ui/keybind"
import { Tooltip } from "@opencode/ui/tooltip"
import { useLanguage } from "@/runtime/i18n/language"
import { useCommand } from "@/shell/commands/command"
import { useLayout } from "@/shell/state/layout"
import { useWindowLeftAvailable } from "@/shell/window-left"

/** Opens and closes the experimental `window.left` column; renders nothing while the column does not exist. */
export function WindowLeftToggle() {
  const language = useLanguage()
  const command = useCommand()
  const layout = useLayout()
  const available = useWindowLeftAvailable()
  const keybind = () => command.keybindParts("window.left.toggle")

  return (
    <Show when={available()}>
      <Tooltip
        class="shrink-0 [app-region:no-drag]"
        placement="bottom"
        value={
          <>
            {language.t("command.window.left.toggle")}
            <Show when={keybind().length > 0}>
              <Keybind keys={keybind()} variant="neutral" />
            </Show>
          </>
        }
      >
        <IconButton
          type="button"
          data-slot="window-left-toggle"
          variant="ghost-muted"
          size="large"
          class="shrink-0"
          onMouseDown={(event) => event.preventDefault()}
          onClick={layout.windowLeft.toggle}
          aria-label={language.t("command.window.left.toggle")}
          aria-expanded={layout.windowLeft.opened()}
          aria-controls="window-left"
          icon={<Icon name={layout.windowLeft.opened() ? "layout-left-partial" : "layout-left"} />}
        />
      </Tooltip>
    </Show>
  )
}
