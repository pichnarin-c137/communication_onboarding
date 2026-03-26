import api from '@/core/services/api.js'

export const trainerTrackingService = {
  async sendPing(data) {
    const response = await api.post('/trainer/location-ping', data)
    return response.data
  },

  async changeStatus(data) {
    const response = await api.post('/trainer/status', data)
    return response.data
  }
}
