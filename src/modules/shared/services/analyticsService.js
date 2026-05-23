import api from '@core/services/api'

function clean(params) {
  const out = {}
  for (const [k, v] of Object.entries(params || {})) {
    if (v === null || v === undefined || v === '') continue
    out[k] = v
  }
  return out
}

function get(path, params, signal) {
  return api
    .get(path, { params: clean(params), signal })
    .then((res) => res.data?.data)
}

export const analyticsService = {
  overview(params, signal) {
    return get('/analytics/overview', params, signal)
  },
  trends(params, signal) {
    return get('/analytics/trends', params, signal)
  },
  appointments(params, signal) {
    return get('/analytics/appointments', params, signal)
  },
  onboardingFunnel(params, signal) {
    return get('/analytics/onboarding-funnel', params, signal)
  },
  satisfaction(params, signal) {
    return get('/analytics/satisfaction', params, signal)
  },
  trainers(params, signal) {
    return get('/analytics/trainers', params, signal)
  },
  trainerDetail(id, params, signal) {
    return get(`/analytics/trainers/${id}`, params, signal)
  },
  sales(params, signal) {
    return get('/analytics/sales', params, signal)
  },
  heatmap(params, signal) {
    return get('/analytics/heatmap', params, signal)
  },
  engagement(params, signal) {
    return get('/analytics/engagement', params, signal)
  },
  onboardingsBreakdown(params, signal) {
    return get('/analytics/onboardings/breakdown', params, signal)
  },
}

export default analyticsService
