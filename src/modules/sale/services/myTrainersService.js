import api from '@/core/services/api.js'

export const myTrainersService = {
  async getRoster({ search = '', status = '', sort_by = '' } = {}) {
    const params = {}
    if (search) params.search = search
    if (status) params.status = status
    if (sort_by) params.sort_by = sort_by
    const response = await api.get('/me/dedicated-trainers', { params })
    return response.data
  },

  async getOverview(trainerId) {
    const response = await api.get(`/me/dedicated-trainers/${trainerId}/overview`)
    return response.data
  },
}
