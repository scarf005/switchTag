/** @internal Alias for Object containing a compile-time known key and a value. */
type Key<Key extends PropertyKey, V> = { [K in Key]: V }

/** @internal Alias for {@link Key} with an indexable value. */
type TaggedUnion<Tag extends PropertyKey> = Key<Tag, PropertyKey>

/**
 * # Strict tag matcher
 *
 * Object of functions that handle **every** cases of a tagged union.
 *
 * Missing cases are a compile-time error.
 *
 * @typeParam Tag - Property name used to tag the union
 * @typeParam A - Union tagged with `Tag`
 *
 * @internal
 */
type StrictMatcher<Tag extends PropertyKey, A extends TaggedUnion<Tag>, R> = {
  readonly [T in A[Tag]]: (matched: Extract<A, Key<Tag, T>>) => R
}

/**
 * # Loose tag matcher
 *
 * Object of functions that handle **some** cases of a tagged union, and
 * a `otherwise` case as a fallback.
 *
 * Missing `otherwise` case is a compile-time error.
 *
 * @typeParam Tag - Property name used to tag the union
 * @typeParam A - Union tagged with `Tag`
 *
 * @internal
 */
type FallbackMatcher<Tag extends PropertyKey, A extends TaggedUnion<Tag>, R> =
  & { readonly [otherwise]: (all: A) => R }
  & { readonly [T in A[Tag]]?: (matched: Extract<A, Key<Tag, T>>) => R }

type Matcher<Tag extends PropertyKey, A extends TaggedUnion<Tag>, R> =
  | FallbackMatcher<Tag, A, R>
  | StrictMatcher<Tag, A, R>

/** unique symbol to represent the otherwise case in a match statement */
export const otherwise: unique symbol = Symbol("otherwise@switch-tag")

/**
 * # Switch expression for tagged unions
 *
 * @example
 * ```ts
 * import { switchTag } from "./mod.ts"
 * import { assertEquals } from "https://deno.land/std/testing/asserts.ts"
 *
 * type Result<T, E> =
 *   | { type: "ok", value: T }
 *   | { type: "err", error: E }
 *
 * const result = { type: "ok", value: 1 } as Result<number, string>
 *
 * const switchResult = switchTag("type")
 * const output = switchResult(result)({
 *   ok: ({ value }) => `successful: ${value}`,
 *   err: ({ error }) => `failed: ${error}`,
 * })
 *
 * assertEquals(output, "successful: 1")
 * assertEquals(1, 2)
 * ```
 */
export const switchTag =
  <Tag extends PropertyKey>(tag: Tag) =>
  <A extends TaggedUnion<Tag>>(toMatch: A) =>
  <B>(cases: Matcher<Tag, A, B>): B => {
    const type = toMatch[tag]
    // @ts-expect-error: existance of `otherwise` is checked at compile-time
    const f = (cases[type ?? otherwise] ?? cases[otherwise]) as (value: unknown) => B
    return f(toMatch)
  }
