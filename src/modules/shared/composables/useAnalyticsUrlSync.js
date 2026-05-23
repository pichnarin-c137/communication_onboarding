import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAnalyticsStore } from '@/modules/shared/store/analytics.js'

const SYNC_KEYS = ['from', 'to', 'compare', 'group_by', 'location_type']

/**
 * Two-way sync between the analytics store filters and the URL query string,
 * so analytics views are shareable and bookmarkable
 * (e.g. ?from=2026-04-01&to=2026-04-30&compare=prev).
 *
 * Call once from an analytics view's setup(). Hydrates the store from the URL
 * on entry, then mirrors filter changes back into the query with router.replace
 * (no history spam).
 */
export function useAnalyticsUrlSync() {
  const route = useRoute()
  const router = useRouter()
  const store = useAnalyticsStore()

  // Hydrate store from URL on mount.
  const patch = {}
  for (const key of SYNC_KEYS) {
    const v = route.query[key]
    if (v !== undefined && v !== null && v !== '') patch[key] = String(v)
  }
  if (Object.keys(patch).length) Object.assign(store.filters, patch)

  // Mirror store -> URL.
  watch(
    () => store.filters,
    (f) => {
      const query = { ...route.query }
      for (const key of SYNC_KEYS) {
        if (f[key]) query[key] = f[key]
        else delete query[key]
      }
      router.replace({ query }).catch(() => {})
    },
    { deep: true },
  )
}
