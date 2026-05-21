import { defineStore } from 'pinia'
import { ref } from 'vue'
import { activityLogService } from '@/modules/admin/services/activity-log.service.js'

export const useActivityLogStore = defineStore('activityLog', () => {
  const logs = ref([])
  const meta = ref({ total: 0, per_page: 15, current_page: 1, last_page: 1 })
  const loading = ref(false)
  const error = ref(null)

  const filters = ref({
    user_id: '',
    action: '',
    from: '',
    to: '',
  })

  async function fetchLogs(page = 1) {
    loading.value = true
    error.value = null
    try {
      const params = { page, per_page: meta.value.per_page }
      if (filters.value.user_id) params.user_id = filters.value.user_id
      if (filters.value.action) params.action = filters.value.action
      if (filters.value.from) params.from = filters.value.from
      if (filters.value.to) params.to = filters.value.to

      const response = await activityLogService.getLogs(params)
      logs.value = response.data || []
      if (response.meta) meta.value = response.meta
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchUserLogs(userId, page = 1) {
    loading.value = true
    error.value = null
    try {
      const params = { page, per_page: meta.value.per_page }
      if (filters.value.action) params.action = filters.value.action
      if (filters.value.from) params.from = filters.value.from
      if (filters.value.to) params.to = filters.value.to

      const response = await activityLogService.getUserLogs(userId, params)
      logs.value = response.data || []
      if (response.meta) meta.value = response.meta
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  function resetFilters() {
    filters.value = { user_id: '', action: '', from: '', to: '' }
  }

  return {
    logs,
    meta,
    loading,
    error,
    filters,
    fetchLogs,
    fetchUserLogs,
    resetFilters,
  }
})
