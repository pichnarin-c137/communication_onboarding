import { ref, computed } from 'vue'

export function useStatusFilter(filterId, allStatuses) {
  const storageKey = `coms_status_filter_${filterId}`

  function loadHidden() {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) return new Set(JSON.parse(stored))
    } catch {}
    return new Set()
  }

  const hiddenStatuses = ref(loadHidden())

  function isStatusVisible(key) {
    return !hiddenStatuses.value.has(key)
  }

  function toggleStatus(key) {
    const next = new Set(hiddenStatuses.value)
    // Always keep at least one status visible
    if (next.has(key)) {
      next.delete(key)
    } else {
      if (allStatuses.length - next.size <= 1) return
      next.add(key)
    }
    hiddenStatuses.value = next
    localStorage.setItem(storageKey, JSON.stringify([...next]))
  }

  function resetStatuses() {
    hiddenStatuses.value = new Set()
    localStorage.removeItem(storageKey)
  }

  const hiddenCount = computed(() => hiddenStatuses.value.size)

  function filterByStatus(items) {
    if (hiddenStatuses.value.size === 0) return items
    return items.filter(item => isStatusVisible(item.status))
  }

  return { isStatusVisible, toggleStatus, resetStatuses, hiddenCount, allStatuses, filterByStatus }
}
