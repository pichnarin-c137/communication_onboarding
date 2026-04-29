import { ref, computed } from 'vue'

export function useTableColumns(tableId, allColumns) {
  const storageKey = `coms_columns_${tableId}`

  function loadHidden() {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) return new Set(JSON.parse(stored))
    } catch {
      // ignore corrupt storage
    }
    return new Set()
  }

  const hiddenKeys = ref(loadHidden())

  function isVisible(key) {
    const col = allColumns.find(c => c.key === key)
    if (col?.required) return true
    return !hiddenKeys.value.has(key)
  }

  function toggleColumn(key) {
    const col = allColumns.find(c => c.key === key)
    if (col?.required) return
    const next = new Set(hiddenKeys.value)
    if (next.has(key)) {
      next.delete(key)
    } else {
      next.add(key)
    }
    hiddenKeys.value = next
    localStorage.setItem(storageKey, JSON.stringify([...next]))
  }

  function resetColumns() {
    hiddenKeys.value = new Set()
    localStorage.removeItem(storageKey)
  }

  const hiddenCount = computed(() => hiddenKeys.value.size)

  return { isVisible, toggleColumn, resetColumns, hiddenCount, allColumns }
}
