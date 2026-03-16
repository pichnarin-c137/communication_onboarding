import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { saleService } from '@/modules/sale/services/saleService.js'

export const useSaleStore = defineStore('sale', () => {
  const appointments = ref([])
  const dashboardData = ref(null)
  const clients = ref([])
  const trainers = ref([])
  const loading = ref(false)
  const loadingClients = ref(false)
  const loadingTrainers = ref(false)
  const error = ref(null)

  // Pagination meta from server
  const meta = ref({ total: 0, per_page: 15, current_page: 1, last_page: 1 })

  // Local filters (applied on top of server-side pagination)
  const statusFilter = ref('')
  const typeFilter = ref('')

  const filteredAppointments = computed(() => {
    let result = [...appointments.value]
    if (statusFilter.value) {
      result = result.filter(a => a.status === statusFilter.value)
    }
    if (typeFilter.value) {
      result = result.filter(a => a.appointment_type === typeFilter.value)
    }
    return result
  })

  // Appointments

  async function fetchAppointments(params = {}) {
    loading.value = true
    appointments.value = []
    error.value = null
    try {
      const response = await saleService.getAppointments(params)
      appointments.value = response.data || []
      if (response.meta) meta.value = response.meta
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createAppointment(data) {
    const response = await saleService.createAppointment(data)
    await fetchAppointments()
    return response
  }

  async function cancelAppointment(id, reason = '') {
    const response = await saleService.cancelAppointment(id, reason)
    await fetchAppointments()
    return response
  }

  async function rescheduleAppointment(id, data) {
    const response = await saleService.rescheduleAppointment(id, data)
    await fetchAppointments()
    return response
  }

  // Dashboard

  async function fetchDashboard() {
    loading.value = true
    dashboardData.value = null
    error.value = null
    try {
      const response = await saleService.getDashboard()
      dashboardData.value = response.data || null
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Dropdown selections

  async function fetchClients(search = '') {
    loadingClients.value = true
    try {
      const response = await saleService.listClients({ search })
      clients.value = response.data?.data || response.data || []
    } catch {
      clients.value = []
    } finally {
      loadingClients.value = false
    }
  }

  async function fetchTrainers(search = '') {
    loadingTrainers.value = true
    try {
      const response = await saleService.listTrainers({ search })
      trainers.value = response.data?.data || response.data || []
    } catch {
      trainers.value = []
    } finally {
      loadingTrainers.value = false
    }
  }

  return {
    appointments,
    dashboardData,
    clients,
    trainers,
    meta,
    loading,
    loadingClients,
    loadingTrainers,
    error,
    statusFilter,
    typeFilter,
    filteredAppointments,
    fetchAppointments,
    createAppointment,
    cancelAppointment,
    rescheduleAppointment,
    fetchDashboard,
    fetchClients,
    fetchTrainers
  }
})
