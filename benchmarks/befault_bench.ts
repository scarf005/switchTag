import { cases, match, names, R } from "./bench_deps.ts"
import { otherwise, switchTag } from "../mod.ts"

const small = "small tagged union (with default)"

const nativeSwitch = (r: R) => {
  switch (r.type) {
    case "ok":
      return `${r.value}`
    default:
      return `${r.error}`
  }
}

const switchResult = switchTag("type")
const switchFn = (r: R) =>
  switchResult(r)({
    ok: ({ value }) => `${value}`,
    // @ts-expect-error: type not strong enough
    [otherwise]: (r) => `${r.error}`,
  })

const matchFn = (r: R) =>
  match(r)
    .with({ type: "ok" }, ({ value }) => `${value}`)
    .otherwise(({ error }) => `${error}`)

const groups = [
  { name: names.switchTagName, fn: switchFn, baseline: true },
  { name: names.tsPatternName, fn: matchFn },
  { name: names.nativeSwitchName, fn: nativeSwitch },
]
groups.forEach(({ name, fn, baseline }) =>
  Deno.bench({
    name: `${name}`,
    group: small,
    baseline: baseline ?? false,
    fn: () => cases.forEach(fn),
  })
)
