import api from '@/core/services/api.js'

export const rosterService = {
  async getRoster(saleUserId) {
    const response = await api.get(`/users/${saleUserId}/dedicated-trainers`)
    return response.data
  },

  async updateRoster(saleUserId, trainerIds) {
    const response = await api.put(`/users/${saleUserId}/dedicated-trainers`, {
      trainer_ids: trainerIds,
    })
    return response.data
  },
}
