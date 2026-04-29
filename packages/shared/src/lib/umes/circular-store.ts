/**
 * Circular Store Utilities
 *
 * Generic utilities for managing fixed-size arrays stored in globalThis.
 * Useful for development-time data collection (logs, timings, activities) that need
 * memory boundaries to prevent unbounded growth.
 */

const isDev = process.env.NODE_ENV === 'development'

export interface CircularStoreConfig {
  /** Global key to store the array */
  globalKey: string
  /** Maximum number of entries to keep */
  maxEntries: number
}

export interface CircularStore<T> {
  /** Get all entries currently in the store */
  getAll(): T[]
  /** Add an entry to the store (trimmed to maxEntries if exceeded) */
  add(entry: T): void
  /** Clear all entries from the store */
  clear(): void
}

/**
 * Create a circular store for managing fixed-size arrays in globalThis
 * Automatically trims to maxEntries when limit is exceeded
 *
 * @param config - Configuration with globalKey and maxEntries
 * @returns CircularStore instance with get, add, clear methods
 *
 * @example
 * const store = createCircularStore<LogEntry>({
 *   globalKey: '__myLogs__',
 *   maxEntries: 100
 * })
 *
 * store.add({ message: 'hello', timestamp: Date.now() })
 * const logs = store.getAll()
 * store.clear()
 */
export function createCircularStore<T>(config: CircularStoreConfig): CircularStore<T> {
  function getInternalStore(): T[] {
    const existing = (globalThis as Record<string, unknown>)[config.globalKey]
    if (Array.isArray(existing)) return existing as T[]
    const store: T[] = []
    ;(globalThis as Record<string, unknown>)[config.globalKey] = store
    return store
  }

  return {
    getAll(): T[] {
      return getInternalStore()
    },
    add(entry: T): void {
      const store = getInternalStore()
      store.push(entry)
      if (store.length > config.maxEntries) {
        const trimmed = store.slice(-config.maxEntries)
        ;(globalThis as Record<string, unknown>)[config.globalKey] = trimmed
      }
    },
    clear(): void {
      ;(globalThis as Record<string, unknown>)[config.globalKey] = []
    },
  }
}

/**
 * Create a conditional circular store that only logs in development mode
 * All operations are no-ops in production
 *
 * @param config - Configuration with globalKey and maxEntries
 * @returns CircularStore instance (no-op in production)
 */
export function createDevCircularStore<T>(config: CircularStoreConfig): CircularStore<T> {
  const store = createCircularStore<T>(config)

  if (!isDev) {
    return {
      getAll: () => [],
      add: () => {
        /* no-op in production */
      },
      clear: () => {
        /* no-op in production */
      },
    }
  }

  return store
}
