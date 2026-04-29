import type { EnricherTimingEntry } from './devtools-types'
import { createDevCircularStore } from './circular-store'

const isDev = process.env.NODE_ENV === 'development'

const timingStore = createDevCircularStore<EnricherTimingEntry>({
  globalKey: '__openMercatoEnricherTimingEntries__',
  maxEntries: 200,
})

export function getEnricherTimingEntries(): EnricherTimingEntry[] {
  return timingStore.getAll()
}

export function clearEnricherTimingEntries(): void {
  timingStore.clear()
}

export function logEnricherTiming(
  enricherId: string,
  moduleId: string,
  targetEntity: string,
  durationMs: number,
): void {
  timingStore.add({
    enricherId,
    moduleId,
    targetEntity,
    durationMs,
    timestamp: Date.now(),
  })
}

export async function withEnricherTiming<T>(
  enricherId: string,
  moduleId: string,
  targetEntity: string,
  fn: () => Promise<T>,
): Promise<T> {
  if (!isDev) return fn()

  const start = performance.now()
  try {
    return await fn()
  } finally {
    const durationMs = Math.round(performance.now() - start)
    logEnricherTiming(enricherId, moduleId, targetEntity, durationMs)
  }
}
