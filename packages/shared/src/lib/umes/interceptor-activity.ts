import type { InterceptorActivityEntry } from './devtools-types'
import { createDevCircularStore } from './circular-store'

const activityStore = createDevCircularStore<InterceptorActivityEntry>({
  globalKey: '__openMercatoInterceptorActivityEntries__',
  maxEntries: 200,
})

export function getInterceptorActivityEntries(): InterceptorActivityEntry[] {
  return activityStore.getAll()
}

export function clearInterceptorActivityEntries(): void {
  activityStore.clear()
}

export function logInterceptorActivity(entry: InterceptorActivityEntry): void {
  activityStore.add(entry)
}
