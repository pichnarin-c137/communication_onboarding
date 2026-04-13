import api from '@core/services/api'

export async function getSettings() {
  const res = await api.get('/settings')
  return res.data.data
}

export async function updateSettings(data) {
  const res = await api.patch('/settings', data)
  return res.data.data
}
