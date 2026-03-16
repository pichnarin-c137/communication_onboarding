import api from '@/core/services/api.js'

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

  async refreshProgress(id) {
    const response = await api.post(`/onboarding/${id}/refresh-progress`)
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

  async removePolicy(onboardingId, policyId) {
    const response = await api.delete(`/onboarding/${onboardingId}/policies/${policyId}`)
    return response.data
  },

  // Lessons

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

  async sendLesson(onboardingId, lessonId) {
    const response = await api.post(`/onboarding/${onboardingId}/lessons/${lessonId}/send`)
    return response.data
  }
}
