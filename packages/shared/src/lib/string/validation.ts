/**
 * String Validation Utilities
 *
 * Collection of helper functions for common string validation patterns.
 * Provides type-safe utilities for checking non-empty, trimmed strings.
 */

/**
 * Check if value is a non-empty string (after trimming)
 * @param value - Value to check
 * @returns true if value is a non-empty trimmed string
 *
 * @example
 * isNonEmptyString('hello') // true
 * isNonEmptyString('  ') // false
 * isNonEmptyString('') // false
 * isNonEmptyString(null) // false
 * isNonEmptyString(undefined) // false
 * isNonEmptyString(123) // false
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * Type guard: check if value is a non-empty trimmed string
 * Alias for isNonEmptyString for consistency with other type guards
 * @param value - Value to check
 * @returns true if value is a non-empty trimmed string
 */
export function isValidString(value: unknown): value is string {
  return isNonEmptyString(value)
}

/**
 * Get trimmed string if non-empty, otherwise return undefined
 * @param value - String to trim
 * @returns Trimmed string or undefined if empty
 *
 * @example
 * getTrimmedString('  hello  ') // 'hello'
 * getTrimmedString('  ') // undefined
 * getTrimmedString('') // undefined
 * getTrimmedString(null) // undefined
 */
export function getTrimmedString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

/**
 * Get trimmed string if non-empty, otherwise return fallback value
 * @param value - String to trim
 * @param fallback - Fallback value if empty (default: undefined)
 * @returns Trimmed string or fallback
 *
 * @example
 * getTrimmedStringOrDefault('  hello  ') // 'hello'
 * getTrimmedStringOrDefault('  ', 'default') // 'default'
 * getTrimmedStringOrDefault('', null) // null
 */
export function getTrimmedStringOrDefault<T>(
  value: unknown,
  fallback: T = undefined as unknown as T,
): string | T {
  return getTrimmedString(value) ?? fallback
}

/**
 * Type guard + trim: check if value is string, return trimmed if non-empty
 * Useful in filter operations and conditional assignments
 * @param value - Value to validate and trim
 * @returns Trimmed string if valid and non-empty, undefined otherwise
 *
 * @example
 * const items = [' hello ', '', null, ' world ']
 * items.map(trimIfString).filter(Boolean)
 * // ['hello', 'world']
 *
 * ['a', 'b'].filter((v): v is string => trimIfString(v) !== undefined)
 * // ['a', 'b']
 */
export function trimIfString(value: unknown): string | undefined {
  return getTrimmedString(value)
}

/**
 * Filter array of values to keep only non-empty strings
 * @param values - Array of values to filter
 * @returns Array of trimmed non-empty strings
 *
 * @example
 * filterNonEmptyStrings(['hello', '  ', '', 'world', null])
 * // ['hello', 'world']
 */
export function filterNonEmptyStrings(values: unknown[]): string[] {
  if (!Array.isArray(values)) return []
  return values
    .map(trimIfString)
    .filter((v): v is string => v !== undefined)
}

/**
 * Normalize array of strings: trim, filter empty, sort
 * @param values - Array of string values to normalize
 * @param sort - Whether to sort result (default: false)
 * @returns Normalized array of non-empty trimmed strings
 *
 * @example
 * normalizeStrings([' c ', 'a', '  ', ' b '], true)
 * // ['a', 'b', 'c']
 */
export function normalizeStrings(values: unknown[], sort = false): string[] {
  const filtered = filterNonEmptyStrings(values)
  return sort ? filtered.sort() : filtered
}
