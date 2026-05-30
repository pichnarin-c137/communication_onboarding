import { defineStore } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import { analyticsService } from '@/modules/shared/services/analyticsService.js'
import { extractErrorMessage } from '@core/services/error.handler'

function toISODate(d) {
  return d.toISOString().slice(0, 10)
}

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function defaultFilters() {
  return {
    from: toISODate(daysAgo(29)),
    to: toISODate(new Date()),
    compare: 'prev',
    group_by: 'week',
    trainer_id: null,
    sale_id: null,
    location_type: null,
  }
}

const SLOTS = [
  'overview',
  'satisfaction',
  'trends',
  'appointments',
  'onboardingFunnel',
  'trainers',
  'trainerDetail',
  'sales',
  'heatmap',
  'engagement',
  'onboardingsBreakdown',
  'sentiment',
  'anomalies',
  'cohorts',
  'forecast',
]

function emptySlot() {
  return { data: null, loading: false, error: null, lastKey: null, controller: null }
}

export const useAnalyticsStore = defineStore('analytics', () => {
  const filters = ref(defaultFilters())
  const slots = reactive(Object.fromEntries(SLOTS.map((k) => [k, emptySlot()])))

  const filterKey = computed(() => JSON.stringify(filters.value))

  function setRange({ from, to }) {
    filters.value.from = from
    filters.value.to = to
  }

  function setFilter(key, value) {
    filters.value[key] = value
  }

  function resetFilters() {
    filters.value = defaultFilters()
  }

  function invalidate(slot) {
    if (slot) {
      slots[slot].lastKey = null
    } else {
      SLOTS.forEach((k) => (slots[k].lastKey = null))
    }
  }

  watch(filters, () => invalidate(), { deep: true })

  async function fetchSlot(slot, fetcher, extraKey = '') {
    const key = `${filterKey.value}|${extraKey}`
    if (slots[slot].lastKey === key && slots[slot].data && !slots[slot].error) {
      return slots[slot].data
    }
    if (slots[slot].controller) slots[slot].controller.abort()
    const controller = new AbortController()
    slots[slot].controller = controller
    slots[slot].loading = true
    slots[slot].error = null
    try {
      const data = await fetcher(controller.signal)
      slots[slot].data = data
      slots[slot].lastKey = key
      return data
    } catch (err) {
      if (err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError') {
        return null
      }
      slots[slot].error = extractErrorMessage(err)
      throw err
    } finally {
      if (slots[slot].controller === controller) {
        slots[slot].controller = null
        slots[slot].loading = false
      }
    }
  }

  function fetchOverview() {
    return fetchSlot('overview', (signal) =>
      analyticsService.overview(filters.value, signal),
    )
  }

  function fetchSatisfaction() {
    return fetchSlot('satisfaction', (signal) =>
      analyticsService.satisfaction(filters.value, signal),
    )
  }

  function fetchTrends(metric) {
    return fetchSlot(
      'trends',
      (signal) =>
        analyticsService.trends({ ...filters.value, metric }, signal),
      metric,
    )
  }

  function fetchAppointments() {
    return fetchSlot('appointments', (signal) =>
      analyticsService.appointments(filters.value, signal),
    )
  }

  function fetchOnboardingFunnel() {
    return fetchSlot('onboardingFunnel', (signal) =>
      analyticsService.onboardingFunnel(filters.value, signal),
    )
  }

  function fetchTrainers(extra = {}) {
    return fetchSlot(
      'trainers',
      (signal) =>
        analyticsService.trainers({ ...filters.value, ...extra }, signal),
      JSON.stringify(extra),
    )
  }

  function fetchTrainerDetail(id) {
    return fetchSlot(
      'trainerDetail',
      (signal) => analyticsService.trainerDetail(id, filters.value, signal),
      id,
    )
  }

  function fetchSales(extra = {}) {
    return fetchSlot(
      'sales',
      (signal) =>
        analyticsService.sales({ ...filters.value, ...extra }, signal),
      JSON.stringify(extra),
    )
  }

  function fetchHeatmap() {
    return fetchSlot('heatmap', (signal) =>
      analyticsService.heatmap(filters.value, signal),
    )
  }

  function fetchEngagement() {
    return fetchSlot('engagement', (signal) =>
      analyticsService.engagement(filters.value, signal),
    )
  }

  function fetchOnboardingsBreakdown() {
    return fetchSlot('onboardingsBreakdown', (signal) =>
      analyticsService.onboardingsBreakdown(filters.value, signal),
    )
  }

  function fetchSentiment() {
    return fetchSlot('sentiment', (signal) =>
      analyticsService.sentiment(filters.value, signal),
    )
  }

  function fetchAnomalies() {
    return fetchSlot('anomalies', (signal) =>
      analyticsService.anomalies(filters.value, signal),
    )
  }

  function fetchCohorts(extra = {}) {
    return fetchSlot(
      'cohorts',
      (signal) => analyticsService.cohorts({ ...filters.value, ...extra }, signal),
      JSON.stringify(extra),
    )
  }

  function fetchForecast(extra = {}) {
    return fetchSlot(
      'forecast',
      (signal) => analyticsService.forecast({ ...filters.value, ...extra }, signal),
      JSON.stringify(extra),
    )
  }

  return {
    filters,
    slots,
    setRange,
    setFilter,
    resetFilters,
    invalidate,
    fetchOverview,
    fetchSatisfaction,
    fetchTrends,
    fetchAppointments,
    fetchOnboardingFunnel,
    fetchTrainers,
    fetchTrainerDetail,
    fetchSales,
    fetchHeatmap,
    fetchEngagement,
    fetchOnboardingsBreakdown,
    fetchSentiment,
    fetchAnomalies,
    fetchCohorts,
    fetchForecast,
  }
})
