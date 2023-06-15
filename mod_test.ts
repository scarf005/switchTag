import { otherwise, switchTag } from "./mod.ts"
import { assertEquals, assertThrows, Result, test, zip } from "./test_deps.ts"

type ReqResult = Result<number, string>

const switchResult = switchTag("type")

const reqs: ReqResult[] = [
  { type: "ok", value: 1, otherTag: 1 },
  { type: "err", error: "error", otherTag: 2 },
]

Deno.test("Can be used as a function", () => {
  const strict = (req: ReqResult) =>
    switchResult(req)({
      ok: ({ value }) => `${value} ok`,
      err: ({ error }) => `${error} err`,
    })
  zip(reqs, ["1 ok", "error err"])
    .forEach(([req, expected]) => assertEquals(strict(req), expected))
})

Deno.test("Can be used as an expression", () => {
  const asExpr0 = switchResult(reqs[0])({
    ok: ({ value }) => `${value}`,
    err: ({ error }) => `${error}`,
  })
  assertEquals(asExpr0, "1")

  const asExpr1 = switchResult(reqs[1])({
    ok: ({ value }) => `${value}`,
    err: ({ error }) => `${error}`,
  })
  assertEquals(asExpr1, "error")
})

Deno.test("Can be switched on other tags", () => {
  const strictWithOtherKeys = (req: ReqResult) =>
    switchTag("otherTag")(req)({
      1: ({ value }) => `${value}`,
      2: ({ error }) => `${error}`,
    })

  assertEquals(strictWithOtherKeys(reqs[0]), "1")
  assertEquals(strictWithOtherKeys(reqs[1]), "error")
})

Deno.test("With otherwise", async (t) => {
  const otherwiseOnly = (req: ReqResult) =>
    switchResult(req)({
      [otherwise]: () => "otherwise",
    })

  test("return type is inferred for otherwise-only case", (t) => {
    const ret = otherwiseOnly(reqs[0])
    return t.equal<typeof ret, string>()
  })

  await t.step("Can be the only case", () => {
    reqs.forEach((req) => assertEquals(otherwiseOnly(req), "otherwise"))
  })

  await t.step("Can be used with other cases", () => {
    const loose = (req: ReqResult) =>
      switchResult(req)({
        ok: ({ value }) => `${value}`,
        [otherwise]: () => "otherwise",
      })
    assertEquals(loose(reqs[0]), "1")
    assertEquals(loose(reqs[1]), "otherwise")
  })
})

Deno.test("Narrows tag types in compile-time", () => {
  const val: Result<number, string> = { type: "ok", value: 1, otherTag: 1 }
  switchResult(val)({
    ok: ({ value }) => `${value}`,
    // @ts-expect-error: compile-time narrowing
    err: ({ error }) => `${error}`,
  })
})

Deno.test("Catches tags that are not in the union in compile-time", () => {
  const loose$unrelatedMatch = (req: ReqResult) =>
    switchResult(req)({
      ok: ({ value }) => `${value} ok`,
      err: ({ error }) => `${error} err`,
      // @ts-expect-error: `foo` is not a valid tag
      foo: ({ value }) => `${value} foo`,
      [otherwise]: () => "otherwise",
    })

  const strict$unrelatedMatch = (req: ReqResult) =>
    switchResult(req)({
      ok: ({ value }) => `${value} ok`,
      err: ({ error }) => `${error} err`,
      // @ts-expect-error: `foo` is not a valid tag
      foo: ({ value }) => `${value} foo`,
    })

  zip(reqs, ["1 ok", "error err"]).forEach(([req, expected]) =>
    [loose$unrelatedMatch, strict$unrelatedMatch].forEach((match) =>
      assertEquals(match(req), expected)
    )
  )
})

Deno.test("Catches empty match in compile-time", () => {
  // @ts-expect-error: match is not exhaustive
  const $empty = (req: ReqResult) => switchResult(req)({})

  reqs.forEach((req) => assertThrows(() => $empty(req)))
})

Deno.test("catches non-exhaustive match in compile-time", () => {
  const strict$nonExhaustive = (req: ReqResult) =>
    // @ts-expect-error: match is not exhaustive
    switchResult(req)({
      ok: ({ value }) => `${value} ok`,
    })

  assertEquals(strict$nonExhaustive(reqs[0]), "1 ok")
  assertThrows(() => strict$nonExhaustive(reqs[1]))
})
