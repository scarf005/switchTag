import { cases, match, names, R } from "./bench_deps.ts"
import { switchTag } from "../mod.ts"

const small = "small tagged union"

const nativeSwitch = (r: R) => {
  switch (r.type) {
    case "ok":
      return `${r.value}`
    case "err":
      return `${r.error}`
  }
}

const switchResult = switchTag("type")
const switchFn = (r: R) =>
  switchResult(r)({
    ok: ({ value }) => `${value}`,
    err: ({ error }) => `${error}`,
  })

const matchFn = (r: R) =>
  match(r)
    .with({ type: "ok" }, ({ value }) => `${value}`)
    .with({ type: "err" }, ({ error }) => `${error}`)
    .exhaustive()

const groups = [
  { name: names.switchTagName, fn: switchFn, baseline: true },
  { name: names.tsPatternName, fn: matchFn },
  { name: names.nativeSwitchName, fn: nativeSwitch },
]
groups.forEach(({ name, fn, baseline }) =>
  Deno.bench({
    name,
    group: small,
    baseline: baseline ?? false,
    fn: () => cases.forEach(fn),
  })
)
