# Switchtag

Switch expression for typescript tagged unions.

```ts
import { switchTag } from "https://deno.land/x/switchtag/mod.ts"
import { assertEquals } from "https://deno.land/std/testing/asserts.ts"

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
```

## Should I use it?

No. Use [`ts-pattern`](https://github.com/gvergnaud/ts-pattern) instead.

## Bench

<details>

```
cpu: AMD Ryzen 5 5600G with Radeon Graphics
runtime: deno 1.34.2 (x86_64-unknown-linux-gnu)

file:///home/scarf/repo/deno-packages/switchTag/benchmarks/befault_bench.ts
benchmark                       time (avg)             (min … max)       p75       p99      p995
------------------------------------------------------------------ -----------------------------
switchTag with default           3.42 ms/iter     (3.09 ms … 6.49 ms)   3.28 ms   6.29 ms   6.49 ms
ts-pattern with default          3.65 ms/iter      (3.3 ms … 5.81 ms)   3.74 ms   4.99 ms   5.81 ms
native switch with default     340.04 µs/iter      (291.87 µs … 2 ms)  343.1 µs  703.6 µs 833.52 µs

summary
  switchTag with default
   10.07x slower than native switch with default
   1.07x faster than ts-pattern with default

file:///home/scarf/repo/deno-packages/switchTag/benchmarks/exhaustive_bench.ts
benchmark          time (avg)             (min … max)       p75       p99      p995
----------------------------------------------------- -----------------------------
switchTag         701.07 µs/iter   (517.81 µs … 2.66 ms) 705.38 µs   1.63 ms   1.98 ms
ts-pattern          4.35 ms/iter      (3.9 ms … 5.91 ms)   4.45 ms   5.74 ms   5.91 ms
native switch     381.61 µs/iter   (306.95 µs … 2.75 ms) 381.49 µs 714.34 µs 852.12 µs

summary
  switchTag
   1.84x slower than native switch
   6.21x faster than ts-pattern
```

</details>

## Limitations

using `otherwise` cannot narrow types unlike to `ts-pattern` or native `switch`.

## License

[AGPL-3.0](LICENSE)
