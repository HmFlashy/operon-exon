import { expect, test } from "bun:test"
import { extractSessionId, parseSessionMention, serializeSessionMention, sessionMentions } from "./session-mention.js"

const id = "ses_0123456789abcdefghijklmnop"

test("session tokens round-trip independently of the title", () => {
  expect(serializeSessionMention({ id })).toBe(`@session:${id}`)
  expect(parseSessionMention(`@session:${id}`)).toEqual({ id })
  expect(parseSessionMention(id)).toEqual({ id })
  expect(sessionMentions(`See @session:${id}, then ${id}.`).map((match) => match.id)).toEqual([id, id])
})

test.each(["ses_123", `@session:${id}extra`, `x${id}`, `${id}/path`, `https://host/${id}`, `@other:${id}`, `${id}_x`])(
  "does not parse malformed or embedded IDs: %s",
  (text) => {
    expect(parseSessionMention(text)).toBeUndefined()
    expect(sessionMentions(text)).toEqual([])
  },
)

test("extractSessionId resolves session IDs from various formats and URLs", () => {
  expect(extractSessionId(id)).toBe(id)
  expect(extractSessionId(`@session:${id}`)).toBe(id)
  expect(extractSessionId(`session:${id}`)).toBe(id)
  expect(extractSessionId(`/session/${id}`)).toBe(id)
  expect(extractSessionId(`/server/bWFpbg/session/${id}`)).toBe(id)
  expect(extractSessionId(`https://opencode.example.com/session/${id}`)).toBe(id)
  expect(extractSessionId(`https://opencode.example.com/server/xyz/session/${id}`)).toBe(id)
  expect(extractSessionId(`https://opencode.example.com/session/${id}?tab=diff#overview`)).toBe(id)
  expect(extractSessionId(`http://localhost:4096/session/${id}/`)).toBe(id)
})

test.each([
  "ses_123",
  `https://example.com/other/${id}`,
  `https://example.com/session/${id}extra`,
  `https://example.com/session/ses_123`,
  "",
  undefined,
  null,
])("extractSessionId returns undefined for invalid formats: %s", (text) => {
  expect(extractSessionId(text as string)).toBeUndefined()
})
