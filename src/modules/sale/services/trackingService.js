import api from '@/core/services/api.js'

export const trackingService = {
  async getLiveStatus() {
    const res = await api.get('/trainers/live-status')
    return res.data
  },

  async getTodayActivity(trainerId) {
    const res = await api.get(`/trainers/${trainerId}/today-activity`)
    return res.data
  },

  async getActivityLog(trainerId, date) {
    const res = await api.get(`/trainers/${trainerId}/activity-log`, { params: { date } })
    return res.data
  },

  async getCustomerLocations() {
    const res = await api.get('/customers/locations')
    return res.data
  }
}
