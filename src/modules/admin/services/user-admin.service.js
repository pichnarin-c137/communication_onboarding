import api from '@/core/services/api.js'

export const userAdminService = {
  async getUsers(params = {}) {
    const response = await api.get('/get-users', { params })
    return response.data
  },

  async getUserDetail(id) {
    const response = await api.get(`/user-detail/${id}`)
    return response.data
  },

  async createUser(data) {
    const response = await api.post('/create-user', data)
    return response.data
  },

  async updateUserInfo(id, data) {
    const response = await api.patch(`/update-user-information/${id}`, data)
    return response.data
  },

  async updateCredentials(id, data) {
    const response = await api.patch(`/users/${id}/credentials`, data)
    return response.data
  },

  async toggleSuspend(id) {
    const response = await api.patch(`/users/${id}/suspend`)
    return response.data
  },

  async forcePasswordReset(id) {
    const response = await api.post(`/users/${id}/force-password-reset`)
    return response.data
  },

  async softDelete(id) {
    const response = await api.delete(`/soft-delete-user/${id}`)
    return response.data
  },

  async hardDelete(id) {
    const response = await api.delete(`/hard-delete-user/${id}`)
    return response.data
  },

  async restoreUser(id) {
    const response = await api.patch(`/restore-user/${id}`)
    return response.data
  },
}
