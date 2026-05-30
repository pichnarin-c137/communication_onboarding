import { defineStore } from 'pinia'
import { ref } from 'vue'
import { crmService } from '@/modules/crm/services/crmService.js'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { extractErrorMessage } from '@/core/services/error.handler'

export const useCrmStore = defineStore('crm', () => {
  // State
  const contacts = ref([])
  const deals = ref([])
  const pipelineStats = ref(null)

  const loadingContacts = ref(false)
  const loadingDeals = ref(false)
  const loadingStats = ref(false)

  const contactsMeta = ref({ total: 0, per_page: 15, current_page: 1, last_page: 1, from: 0, to: 0 })

  // Actions

  async function fetchContacts(params = {}) {
    loadingContacts.value = true
    try {
      const { items, meta } = await crmService.getContacts(params)
      contacts.value = items
      if (meta) contactsMeta.value = meta
    } catch (err) {
      throw new Error(extractErrorMessage(err))
    } finally {
      loadingContacts.value = false
    }
  }

  async function fetchDeals(params = {}) {
    loadingDeals.value = true
    try {
      const { items } = await crmService.getDeals(params)
      deals.value = items
    } catch (err) {
      throw new Error(extractErrorMessage(err))
    } finally {
      loadingDeals.value = false
    }
  }

  async function fetchPipelineStats() {
    loadingStats.value = true
    try {
      pipelineStats.value = await crmService.getPipelineStats()
    } catch (err) {
      // Stats failure is non-critical, swallow silently
      pipelineStats.value = null
    } finally {
      loadingStats.value = false
    }
  }

  async function createContact(data) {
    return await crmService.createContact(data)
  }

  async function createDeal(data) {
    // The board is scoped per user: a deal with assigned_to = null is hidden from
    // every sale and only shows on the admin board. Default it to the creator so
    // the new deal appears on their own pipeline immediately.
    const authStore = useAuthStore()
    const payload = data.assigned_to || !authStore.userId
      ? data
      : { ...data, assigned_to: authStore.userId }
    const newDeal = await crmService.createDeal(payload)
    if (newDeal) deals.value.unshift(newDeal)
    return newDeal
  }

  async function updateDeal(id, data) {
    const updated = await crmService.updateDeal(id, data)
    const idx = deals.value.findIndex(d => d.id === id)
    if (idx !== -1) {
      // Prefer the server's full deal; fall back to merging the patched fields
      // so we never blow away title/value/contact when the API returns a stub.
      deals.value[idx] = updated && updated.stage
        ? updated
        : { ...deals.value[idx], ...data }
    }
    return updated
  }

  // POST /deals/:id/won returns sync info { deal_id, client_id, client_name, won_at },
  // NOT a deal. Merge the stage into the existing deal instead of replacing it.
  async function markWon(id) {
    const result = await crmService.markDealWon(id)
    const idx = deals.value.findIndex(d => d.id === id)
    if (idx !== -1) {
      deals.value[idx] = {
        ...deals.value[idx],
        stage: 'won',
        ...(result?.client_id ? { client_id: result.client_id } : {})
      }
    }
    return result
  }

  async function markLost(id, reason) {
    const result = await crmService.markDealLost(id, reason)
    const idx = deals.value.findIndex(d => d.id === id)
    if (idx !== -1) {
      deals.value[idx] = {
        ...deals.value[idx],
        stage: 'lost',
        lost_reason: reason || deals.value[idx].lost_reason
      }
    }
    return result
  }

  return {
    contacts,
    deals,
    pipelineStats,
    loadingContacts,
    loadingDeals,
    loadingStats,
    contactsMeta,
    fetchContacts,
    fetchDeals,
    fetchPipelineStats,
    createContact,
    createDeal,
    updateDeal,
    markWon,
    markLost
  }
})
