import { assertEquals } from "https://deno.land/std/testing/asserts.ts"
import { switchTag } from "./mod.ts"

export type R =
  | { type: "ok"; value: number; otherTag: 1 }
  | { type: "err"; error: string; otherTag: 2 }

const reqs: R[] = [
  { type: "ok", value: 1, otherTag: 1 },
  { type: "err", error: "error", otherTag: 2 },
]

const first = reqs.map((req) =>
  switchTag("type")(req)({
    ok: ({ value }) => `${value} ok`,
    err: ({ error }) => `${error} err`,
  })
)
const second = reqs.map((req) =>
  switchTag("otherTag")(req)({
    1: ({ value }) => `${value} ok`,
    2: ({ error }) => `${error} err`,
  })
)

Deno.test("Example in README works", () => {
  assertEquals(first, ["1 ok", "error err"])
  assertEquals(second, ["1 ok", "error err"])
})
