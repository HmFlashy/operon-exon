import { Show } from "solid-js"
import { Icon } from "@opencode/ui/icon"
import { IconButton } from "@opencode/ui/icon-button"
import { Tooltip } from "@opencode/ui/tooltip"
import { useLanguage } from "@/runtime/i18n/language"
import { useLayout } from "@/shell/state/layout"
import { useWindowLeftAvailable } from "@/shell/window-left"

/** Opens and closes the experimental `window.left` column; renders nothing while the column does not exist. */
export function WindowLeftToggle() {
  const language = useLanguage()
  const layout = useLayout()
  const available = useWindowLeftAvailable()

  return (
    <Show when={available()}>
      <Tooltip class="shrink-0 [app-region:no-drag]" placement="bottom" value={language.t("window.left.toggle")}>
        <IconButton
          type="button"
          data-slot="window-left-toggle"
          variant="ghost-muted"
          size="large"
          class="shrink-0"
          onMouseDown={(event) => event.preventDefault()}
          onClick={layout.windowLeft.toggle}
          aria-label={language.t("window.left.toggle")}
          aria-expanded={layout.windowLeft.opened()}
          aria-controls="window-left"
          icon={<Icon name={layout.windowLeft.opened() ? "layout-left-partial" : "layout-left"} />}
        />
      </Tooltip>
    </Show>
  )
}
