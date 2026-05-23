import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { myTrainersService } from '@/modules/sale/services/myTrainersService.js'

export const useMyTrainersStore = defineStore('myTrainers', () => {
  const roster = ref([])
  const rosterLoading = ref(false)
  const rosterLoaded = ref(false)

  const rosterFilters = reactive({
    search: '',
    status: '',
    sort_by: 'name',
  })

  const currentOverview = ref(null)
  const overviewLoading = ref(false)

  async function fetchRoster() {
    rosterLoading.value = true
    try {
      const response = await myTrainersService.getRoster(rosterFilters)
      roster.value = response.data || []
      rosterLoaded.value = true
      return roster.value
    } finally {
      rosterLoading.value = false
    }
  }

  async function fetchOverview(trainerId) {
    overviewLoading.value = true
    currentOverview.value = null
    try {
      const response = await myTrainersService.getOverview(trainerId)
      currentOverview.value = response.data || null
      return currentOverview.value
    } finally {
      overviewLoading.value = false
    }
  }

  function patchLiveStatus({ trainer_id, status, status_updated_at }) {
    const id = String(trainer_id)
    const idx = roster.value.findIndex((t) => String(t.trainer_user_id) === id)
    if (idx !== -1) {
      roster.value[idx] = {
        ...roster.value[idx],
        live_status: status ?? roster.value[idx].live_status,
        live_status_updated_at: status_updated_at ?? new Date().toISOString(),
      }
    }
    if (currentOverview.value && String(currentOverview.value.trainer?.trainer_user_id) === id) {
      currentOverview.value = {
        ...currentOverview.value,
        live: {
          ...currentOverview.value.live,
          status: status ?? currentOverview.value.live?.status,
          status_updated_at: status_updated_at ?? new Date().toISOString(),
        },
      }
    }
  }

  function setFilter(key, value) {
    rosterFilters[key] = value
  }

  function resetOverview() {
    currentOverview.value = null
  }

  function reset() {
    roster.value = []
    rosterLoaded.value = false
    currentOverview.value = null
    rosterFilters.search = ''
    rosterFilters.status = ''
    rosterFilters.sort_by = 'name'
  }

  return {
    roster,
    rosterLoading,
    rosterLoaded,
    rosterFilters,
    currentOverview,
    overviewLoading,
    fetchRoster,
    fetchOverview,
    patchLiveStatus,
    setFilter,
    resetOverview,
    reset,
  }
})
