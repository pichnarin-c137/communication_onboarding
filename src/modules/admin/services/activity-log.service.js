import api from '@/core/services/api.js'

export const activityLogService = {
  async getLogs(params = {}) {
    const response = await api.get('/activity-logs', { params })
    return response.data
  },

  async getUserLogs(userId, params = {}) {
    const response = await api.get(`/users/${userId}/activity-logs`, { params })
    return response.data
  },
}
