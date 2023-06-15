import { match } from "npm:ts-pattern@4.3.0"
import * as it from "https://deno.land/x/iter@v3.1.0/fp.ts"
import { c, p } from "https://deno.land/x/copb@v1.0.1/mod.ts"
export { switchTag } from "../mod.ts"

export { c, it, match, p }
export type R = { type: "ok"; value: string } | { type: "err"; error: number }

// deno-fmt-ignore
export const createResult = c(p
  (it.map<number, R>((x) => x > 0.5
    ? { type: "ok", value: `${x}` }
    : { type: "err", error: x }))
  (it.take(10000)),
)

export const cases = [...createResult(it.create.randomNumbers())]

export const names = {
  switchTagName: "switchTag",
  tsPatternName: "ts-pattern",
  nativeSwitchName: "native switch",
}
