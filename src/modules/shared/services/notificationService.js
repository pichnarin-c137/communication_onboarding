import api from '@/core/services/api.js'

export const notificationService = {
  async getNotifications(limit = 20) {
    const response = await api.get('/notifications', { params: { limit } })
    return response.data
  },

  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count')
    return response.data
  },

  async markAsRead(id) {
    const response = await api.patch(`/notifications/${id}/read`)
    return response.data
  },

  async markAllAsRead() {
    const response = await api.patch('/notifications/read-all')
    return response.data
  }
}
