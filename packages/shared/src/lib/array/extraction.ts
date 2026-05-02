/**
 * Array Field Extraction Utilities
 *
 * Collection of helpers for extracting, filtering, and transforming field values from object arrays.
 * Simplifies common patterns like map + filter operations on array fields.
 */

/**
 * Extract field values from array of objects
 * @param items - Array of objects
 * @param fieldKey - Field name to extract
 * @returns Array of field values (including null/undefined if present)
 *
 * @example
 * const users = [{ id: '1', name: 'Alice' }, { id: '2', name: 'Bob' }]
 * extractFieldValues(users, 'name') // ['Alice', 'Bob']
 */
export function extractFieldValues<T extends Record<string, any>, K extends keyof T>(
  items: T[],
  fieldKey: K,
): Array<T[K]> {
  if (!Array.isArray(items)) return []
  return items.map(item => item[fieldKey])
}

/**
 * Extract field values and filter out falsy values
 * @param items - Array of objects
 * @param fieldKey - Field name to extract
 * @returns Array of truthy field values
 *
 * @example
 * const records = [{ id: '1' }, { id: null }, { id: '2' }]
 * extractNonFalsyFieldValues(records, 'id') // ['1', '2']
 */
export function extractNonFalsyFieldValues<T extends Record<string, any>, K extends keyof T>(
  items: T[],
  fieldKey: K,
): Array<NonNullable<T[K]>> {
  if (!Array.isArray(items)) return []
  return items.map(item => item[fieldKey]).filter((value): value is NonNullable<T[K]> => Boolean(value))
}

/**
 * Extract string field values (type guard + filter)
 * @param items - Array of objects
 * @param fieldKey - Field name to extract
 * @returns Array of string field values only
 *
 * @example
 * const records = [{ name: 'Alice' }, { name: 123 }, { name: 'Bob' }]
 * extractStringFieldValues(records, 'name') // ['Alice', 'Bob']
 */
export function extractStringFieldValues<T extends Record<string, any>, K extends keyof T>(
  items: T[],
  fieldKey: K,
): string[] {
  if (!Array.isArray(items)) return []
  return items.map(item => item[fieldKey]).filter((value): value is string => typeof value === 'string')
}

/**
 * Extract non-empty trimmed string field values
 * @param items - Array of objects
 * @param fieldKey - Field name to extract
 * @returns Array of non-empty trimmed string field values
 *
 * @example
 * const records = [{ tag: 'active' }, { tag: '  ' }, { tag: 'archived' }]
 * extractValidStringFieldValues(records, 'tag') // ['active', 'archived']
 */
export function extractValidStringFieldValues<T extends Record<string, any>, K extends keyof T>(
  items: T[],
  fieldKey: K,
): string[] {
  if (!Array.isArray(items)) return []
  return items
    .map(item => item[fieldKey])
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .map(value => value.trim())
}

/**
 * Extract numeric field values (type guard + filter)
 * @param items - Array of objects
 * @param fieldKey - Field name to extract
 * @returns Array of numeric field values only
 *
 * @example
 * const records = [{ count: 5 }, { count: 'invalid' }, { count: 10 }]
 * extractNumberFieldValues(records, 'count') // [5, 10]
 */
export function extractNumberFieldValues<T extends Record<string, any>, K extends keyof T>(
  items: T[],
  fieldKey: K,
): number[] {
  if (!Array.isArray(items)) return []
  return items
    .map(item => item[fieldKey])
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
}

/**
 * Map and filter in one operation
 * Applies a transformation function and filters out null/undefined results
 * @param items - Array to transform
 * @param transformer - Function to transform each item
 * @returns Array of non-null/undefined transformed values
 *
 * @example
 * const items = [1, 2, 3, 4]
 * mapAndFilter(items, (x) => x % 2 === 0 ? x * 2 : null) // [4, 8]
 */
export function mapAndFilter<T, R>(items: T[], transformer: (item: T, index: number) => R | null | undefined): R[] {
  if (!Array.isArray(items)) return []
  return items.map((item, index) => transformer(item, index)).filter((value): value is R => value != null)
}
