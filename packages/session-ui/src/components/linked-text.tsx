import { Index, Show, createMemo } from "solid-js"
import { extractSessionId } from "@opencode/util/session-mention"
import { useMarkdown } from "../context/markdown"
import { linkSegments } from "./link-segments"

/** Plain text with http(s) URLs. Session URLs navigate in-place; external URLs open outside the app. */
export function LinkedText(props: { text: string }) {
  const markdown = useMarkdown()
  const segments = createMemo(() => linkSegments(props.text))

  return (
    <Index each={segments()}>
      {(segment) => (
        <Show when={segment().href} fallback={segment().text}>
          {(href) => {
            const sessionId = createMemo(() => extractSessionId(href()))
            return (
              <Show
                when={sessionId()}
                fallback={
                  <a data-slot="linked-text-link" href={href()} target="_blank" rel="noopener noreferrer">
                    {segment().text}
                  </a>
                }
              >
                {(id) => (
                  <a
                    data-slot="linked-text-link"
                    data-session-id={id()}
                    href={href()}
                    onClick={(e) => {
                      if (e.button !== 0 || e.defaultPrevented) return
                      const handler = markdown?.openSession
                      if (!handler) return
                      e.preventDefault()
                      e.stopPropagation()
                      handler(id())
                    }}
                  >
                    {segment().text}
                  </a>
                )}
              </Show>
            )
          }}
        </Show>
      )}
    </Index>
  )
}
