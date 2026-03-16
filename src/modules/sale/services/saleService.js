import api from '@/core/services/api.js'

export const saleService = {
  // Appointments

  async getAppointments(params = {}) {
    const response = await api.get('/appointments', { params })
    console
    return response.data
  },

  async getAppointment(id) {
    const response = await api.get(`/appointments/${id}`)
    return response.data
  },

  /**
   * @param {Object} data - { title, appointment_type, location_type, client_id, system_id,
   *   trainer_id?, scheduled_date, scheduled_start_time, scheduled_end_time,
   *   meeting_link?, physical_location?, notes? }
   */
  async createAppointment(data) {
    const response = await api.post('/appointments', data)
    return response.data
  },

  async updateAppointment(id, data) {
    const response = await api.patch(`/appointments/${id}`, data)
    return response.data
  },

  async cancelAppointment(id, reason = '') {
    const response = await api.post(`/appointments/${id}/cancel`, { cancellation_reason: reason })
    return response.data
  },

  /**
   * @param {Object} data - { scheduled_date, scheduled_start_time, scheduled_end_time, reschedule_reason? }
   */
  async rescheduleAppointment(id, data) {
    const response = await api.post(`/appointments/${id}/reschedule`, data)
    return response.data
  },

  // Dashboard

  async getDashboard() {
    const response = await api.get('/dashboard/sale')
    return response.data
  },

  // Dropdown selections

  async listClients({ search = '', limit = 10 } = {}) {
    const params = { limit }
    if (search) params.search = search
    const response = await api.get('/selection/clients-dropdown', { params })
    return response.data
  },

  async listTrainers({ search = '', limit = 10 } = {}) {
    const params = { limit }
    if (search) params.search = search
    const response = await api.get('/selection/trainers-dropdown', { params })
    return response.data
  }
}
