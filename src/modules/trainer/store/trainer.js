import { defineStore } from 'pinia'
import { ref } from 'vue'
import { trainerService } from '@/modules/trainer/services/trainerService.js'

export const useTrainerStore = defineStore('trainer', () => {
  const dashboardData = ref(null)
  const appointments = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Pagination meta from server
  const meta = ref({ total: 0, per_page: 15, current_page: 1, last_page: 1 })

  // Dashboard

  async function fetchDashboard() {
    loading.value = true
    dashboardData.value = null
    error.value = null
    try {
      const response = await trainerService.getDashboard()
      dashboardData.value = response.data || null
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Appointments

  async function fetchAppointments(params = {}) {
    loading.value = true
    appointments.value = []
    error.value = null
    try {
      const response = await trainerService.getAppointments(params)
      appointments.value = response.data || []
      if (response.meta) meta.value = response.meta
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    dashboardData,
    appointments,
    meta,
    loading,
    error,
    fetchDashboard,
    fetchAppointments
  }
})
