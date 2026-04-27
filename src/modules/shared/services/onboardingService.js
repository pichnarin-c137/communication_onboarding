import api from '@/core/services/api.js'
import axios from 'axios'

export const onboardingService = {
  // Onboarding Requests

  async getOnboardings(params = {}) {
    const response = await api.get('/onboarding', { params })
    return response.data
  },

  async getOnboarding(id) {
    const response = await api.get(`/onboarding/${id}`)
    return response.data
  },

  async getOnboardingSales(id) {
    const response = await api.get(`/onboarding/${id}/sales`)
    return response.data
  },

  async refreshProgress(id) {
    const response = await api.post(`/onboarding/${id}/refresh-progress`)
    return response.data
  },

  async startOnboarding(id) {
    const response = await api.patch(`/onboarding/${id}/start`)
    return response.data
  },

  async completeOnboarding(id) {
    const response = await api.patch(`/onboarding/${id}/complete`)
    return response.data
  },

  async cancelOnboarding(id, reason = '') {
    const response = await api.post(`/onboarding/${id}/cancel`, { reason })
    return response.data
  },

  // Company Info

  async getCompanyInfo(onboardingId) {
    const response = await api.get(`/onboarding/${onboardingId}/company-info`)
    return response.data
  },

  /**
   * @param {Object} data - { content?, is_completed? }
   */
  async updateCompanyInfo(onboardingId, data) {
    const response = await api.patch(`/onboarding/${onboardingId}/company-info`, data)
    return response.data
  },

  // System Analysis

  async getSystemAnalysis(onboardingId) {
    const response = await api.get(`/onboarding/${onboardingId}/system-analysis`)
    return response.data
  },

  /**
   * @param {Object} data - { import_employee_count?, connected_app_count?, profile_mobile_count? }
   */
  async updateSystemAnalysis(onboardingId, data) {
    const response = await api.patch(`/onboarding/${onboardingId}/system-analysis`, data)
    return response.data
  },

  // Policies

  async getPolicies(onboardingId) {
    const response = await api.get(`/onboarding/${onboardingId}/policies`)
    return response.data
  },

  async addPolicy(onboardingId, policyName) {
    const response = await api.post(`/onboarding/${onboardingId}/policies`, { policy_name: policyName })
    return response.data
  },

  async checkPolicy(onboardingId, policyId) {
    const response = await api.patch(`/onboarding/${onboardingId}/policies/${policyId}/check`)
    return response.data
  },

  async uncheckPolicy(onboardingId, policyId) {
    const response = await api.patch(`/onboarding/${onboardingId}/policies/${policyId}/uncheck`)
    return response.data
  },

  async removePolicy(onboardingId, policyId) {
    const response = await api.delete(`/onboarding/${onboardingId}/policies/${policyId}`)
    return response.data
  },

  // Lessons

  // Global playlist of available training videos — delegates to lessonService
  async getPlaylistLessons(params = {}) {
    const { lessonService } = await import('./lessonService.js')
    return lessonService.getAll(params)
  },

  async getLessons(onboardingId) {
    const response = await api.get(`/onboarding/${onboardingId}/lessons`)
    return response.data
  },

  /**
   * @param {Object} data - { path (1|2|3), lesson_document_id?, lesson_video_url? }
   */
  async addLesson(onboardingId, data) {
    const response = await api.post(`/onboarding/${onboardingId}/lessons`, data)
    return response.data
  },

  /**
   * @param {Object} data - { path?, lesson_document_id?, lesson_video_url? }
   */
  async updateLesson(onboardingId, lessonId, data) {
    const response = await api.patch(`/onboarding/${onboardingId}/lessons/${lessonId}`, data)
    return response.data
  },

  async deleteLesson(onboardingId, lessonId) {
    const response = await api.delete(`/onboarding/${onboardingId}/lessons/${lessonId}`)
    return response.data
  },

  async sendLesson(onboardingId, lessonId, message) {
    const body = message ? { message } : {}
    const response = await api.post(`/onboarding/${onboardingId}/lessons/${lessonId}/send`, body)
    return response.data
  },

  // Scenario 1 — Linked Sessions
  async getLinkedSessions(onboardingId) {
    const res = await api.get(`/onboarding/${onboardingId}/appointments`)
    return res.data.data
  },

  // Scenario 2 — Cycle History
  async getCycleHistory(onboardingId) {
    const res = await api.get(`/onboarding/${onboardingId}/cycles`)
    return res.data.data
  },

  // Scenario 3 — Reopen
  async reopenOnboarding(id) {
    const res = await api.patch(`/onboarding/${id}/reopen`)
    return res.data.data
  },

  // Scenario 4 — On Hold / Resume
  async holdOnboarding(id, reason) {
    const res = await api.patch(`/onboarding/${id}/hold`, { reason })
    return res.data.data
  },
  async resumeFromHold(id) {
    const res = await api.patch(`/onboarding/${id}/resume`)
    return res.data.data
  },

  // Scenario 5 — Revision
  async requestRevision(id, note) {
    const res = await api.patch(`/onboarding/${id}/request-revision`, { note })
    return res.data.data
  },
  async acknowledgeRevision(id) {
    const res = await api.patch(`/onboarding/${id}/acknowledge-revision`)
    return res.data.data
  },
  async getRevisionHistory(id) {
    const res = await api.get(`/onboarding/${id}/revision-history`)
    return res.data.data
  },

  // Scenario 6 — Feedback
  async requestFeedbackEmail(id) {
    const res = await api.post(`/onboarding/${id}/request-feedback`)
    return res.data.data
  },
  async submitManualFeedback(id, rating, comment) {
    const res = await api.post(`/onboarding/${id}/manual-feedback`, { rating, comment })
    return res.data.data
  },
  async getFeedbackStatus(id) {
    const res = await api.get(`/onboarding/${id}/feedback-status`)
    return res.data.data
  },

  // Scenario 8 — Trainer Reassignment
  async getAvailableTrainers() {
    const res = await api.get('/trainers', { params: { available: true } })
    return res.data.data
  },
  async reassignTrainer(id, trainerId, notes) {
    const res = await api.patch(`/onboarding/${id}/reassign`, { trainer_id: trainerId, notes })
    return res.data.data
  },
  async getTrainerHistory(id) {
    const res = await api.get(`/onboarding/${id}/trainer-history`)
    return res.data.data
  }
}

export const feedbackService = {
  async getFeedbackForm(token) {
    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/feedback/${token}`)
    return res.data.data
  },
  async submitClientFeedback(token, data) {
    const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/feedback/${token}`, data)
    return res.data.data
  }
}
