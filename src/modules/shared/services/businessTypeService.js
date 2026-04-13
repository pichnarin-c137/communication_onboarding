import api from '@core/services/api'

export const businessTypeService = {
  async getAll(params = {}) {
    const response = await api.get('/business-types', { params })
    return response.data
  },

  async create(data) {
    const response = await api.post('/business-types', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`/business-types/${id}`, data)
    return response.data
  },

  async remove(id) {
    const response = await api.delete(`/business-types/${id}`)
    return response.data
  }
}
