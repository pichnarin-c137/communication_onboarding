import api from '@core/services/api'

export const telegramService = {
  async generateSetupToken(clientId) {
    const res = await api.post('/telegram/setup-token', { client_id: clientId })
    return res.data.data
  },
  async listGroups(params) {
    const res = await api.get('/telegram/groups', { params })
    return res.data
  },
  async getGroup(id) {
    const res = await api.get(`/telegram/groups/${id}`)
    return res.data.data
  },
  async disconnectGroup(id) {
    const res = await api.patch(`/telegram/groups/${id}/disconnect`)
    return res.data
  },
  async updateLanguage(id, language) {
    const res = await api.patch(`/telegram/groups/${id}/language`, { language })
    return res.data
  },
  async sendTestMessage(id) {
    const res = await api.post(`/telegram/groups/${id}/test-message`)
    return res.data
  },
  async listMessages(params) {
    const res = await api.get('/telegram/messages', { params })
    return res.data
  },
}
