/**
 * Object Utilities
 *
 * Collection of helper functions for common object operations.
 * Provides type-safe utilities for checking emptiness, type guards, and filtering.
 */

/**
 * Check if an object is empty (has no properties)
 * @param obj - Object to check
 * @returns true if object has no enumerable properties
 *
 * @example
 * isEmpty({}) // true
 * isEmpty({ a: 1 }) // false
 * isEmpty(null) // true
 * isEmpty(undefined) // true
 */
export function isEmpty(obj: unknown): boolean {
  if (obj === null || obj === undefined) return true
  if (typeof obj !== 'object') return true
  return Object.keys(obj as Record<string, unknown>).length === 0
}

/**
 * Check if an object has any properties
 * @param obj - Object to check
 * @returns true if object has at least one enumerable property
 *
 * @example
 * hasKeys({}) // false
 * hasKeys({ a: 1 }) // true
 * hasKeys(null) // false
 */
export function hasKeys(obj: unknown): boolean {
  return !isEmpty(obj)
}

/**
 * Type guard: check if value is a plain object (not null, not array, etc.)
 * @param value - Value to check
 * @returns true if value is a plain object
 *
 * @example
 * isPlainObject({}) // true
 * isPlainObject([]) // false
 * isPlainObject(null) // false
 * isPlainObject("string") // false
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Filter out undefined values from an object
 * Returns undefined if all values are undefined or object is empty
 * @param obj - Object to filter
 * @returns Filtered object or undefined
 *
 * @example
 * removeUndefinedValues({ a: 1, b: undefined, c: 2 })
 * // { a: 1, c: 2 }
 *
 * removeUndefinedValues({ a: undefined })
 * // undefined
 */
export function removeUndefinedValues(
  obj: Record<string, unknown> | undefined | null,
): Record<string, unknown> | undefined {
  if (!isPlainObject(obj)) return undefined
  const filtered = Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  )
  return isEmpty(filtered) ? undefined : filtered
}

/**
 * Filter an object to keep only specified keys
 * @param obj - Object to filter
 * @param keys - Keys to keep
 * @returns Filtered object with only specified keys (if they exist)
 *
 * @example
 * pickKeys({ a: 1, b: 2, c: 3 }, ['a', 'c'])
 * // { a: 1, c: 3 }
 */
export function pickKeys(
  obj: Record<string, unknown> | undefined | null,
  keys: string[],
): Record<string, unknown> {
  if (!isPlainObject(obj) || !Array.isArray(keys)) return {}
  return Object.fromEntries(
    keys
      .filter((key) => key in obj)
      .map((key) => [key, obj[key]]),
  )
}

/**
 * Filter an object to exclude specified keys
 * @param obj - Object to filter
 * @param keys - Keys to exclude
 * @returns Filtered object without specified keys
 *
 * @example
 * omitKeys({ a: 1, b: 2, c: 3 }, ['b'])
 * // { a: 1, c: 3 }
 */
export function omitKeys(
  obj: Record<string, unknown> | undefined | null,
  keys: string[],
): Record<string, unknown> {
  if (!isPlainObject(obj)) return {}
  const keysSet = new Set(keys)
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keysSet.has(key)),
  )
}
