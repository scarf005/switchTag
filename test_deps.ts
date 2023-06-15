export { test } from "npm:ts-spec@1.4.6"
export { zip } from "https://deno.land/std@0.191.0/collections/zip.ts"
export { assertEquals, assertThrows } from "https://deno.land/std@0.191.0/testing/asserts.ts"

export type Result<T, E> =
  | { type: "ok"; value: T; otherTag: 1 }
  | { type: "err"; error: E; otherTag: 2 }
