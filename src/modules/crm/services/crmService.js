import api from '@/core/services/api.js'

// Laravel resource responses wrap payloads as { data: ... } and collections add
// { meta: ... }. Some endpoints may return a bare object/array instead. These
// helpers normalize both shapes so the store/views always get predictable data.

function unwrapObject(body) {
  // Single resource → return the inner object (or the body if not wrapped).
  if (body && typeof body === 'object' && !Array.isArray(body) && 'data' in body) {
    return body.data
  }
  return body
}

function unwrapList(body) {
  // Collection → { items: [...], meta }. Handles bare arrays, { data: [] },
  // and double-wrapped { data: { data: [] } } shapes.
  if (Array.isArray(body)) return { items: body, meta: null }
  if (body && Array.isArray(body.data)) {
    return { items: body.data, meta: body.meta || null }
  }
  if (body && body.data && Array.isArray(body.data.data)) {
    return { items: body.data.data, meta: body.data.meta || body.meta || null }
  }
  return { items: [], meta: null }
}

export const crmService = {
  // Contacts

  async getContacts(params = {}) {
    const res = await api.get('/crm/contacts', { params })
    return unwrapList(res.data)
  },

  async getContact(id) {
    const res = await api.get(`/crm/contacts/${id}`)
    return unwrapObject(res.data)
  },

  async createContact(data) {
    const res = await api.post('/crm/contacts', data)
    return unwrapObject(res.data)
  },

  async updateContact(id, data) {
    const res = await api.patch(`/crm/contacts/${id}`, data)
    return unwrapObject(res.data)
  },

  async deleteContact(id) {
    const res = await api.delete(`/crm/contacts/${id}`)
    return unwrapObject(res.data)
  },

  async getContactDeals(id) {
    const res = await api.get(`/crm/contacts/${id}/deals`)
    return unwrapList(res.data).items
  },

  // Deals

  async getDeals(params = {}) {
    const res = await api.get('/crm/deals', { params })
    return unwrapList(res.data)
  },

  async createDeal(data) {
    const res = await api.post('/crm/deals', data)
    return unwrapObject(res.data)
  },

  async updateDeal(id, data) {
    const res = await api.patch(`/crm/deals/${id}`, data)
    return unwrapObject(res.data)
  },

  // Returns sync info { deal_id, client_id, client_name, won_at } — NOT a full deal.
  async markDealWon(id) {
    const res = await api.post(`/crm/deals/${id}/won`)
    return unwrapObject(res.data)
  },

  async markDealLost(id, lost_reason) {
    const res = await api.post(`/crm/deals/${id}/lost`, { lost_reason })
    return unwrapObject(res.data)
  },

  // Pipeline

  async getPipelineStats() {
    const res = await api.get('/crm/pipeline/stats')
    return unwrapObject(res.data)
  }
}
