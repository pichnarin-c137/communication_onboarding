import { defineStore } from 'pinia'
import { ref } from 'vue'
import { rosterService } from '@/modules/admin/services/roster.service.js'

export const useRosterStore = defineStore('roster', () => {
  const roster = ref([])
  const saleUserId = ref(null)
  const loading = ref(false)
  const saving = ref(false)
  const lastDiff = ref({ added: [], removed: [] })

  async function fetch(id) {
    loading.value = true
    saleUserId.value = id
    try {
      const response = await rosterService.getRoster(id)
      roster.value = response.data?.dedicated_trainers || []
      return response.data
    } finally {
      loading.value = false
    }
  }

  async function save(id, trainerIds) {
    saving.value = true
    try {
      const response = await rosterService.updateRoster(id, trainerIds)
      roster.value = response.data?.dedicated_trainers || []
      lastDiff.value = {
        added: response.data?.added || [],
        removed: response.data?.removed || [],
      }
      return response.data
    } finally {
      saving.value = false
    }
  }

  function reset() {
    roster.value = []
    saleUserId.value = null
    lastDiff.value = { added: [], removed: [] }
  }

  return {
    roster,
    saleUserId,
    loading,
    saving,
    lastDiff,
    fetch,
    save,
    reset,
  }
})
