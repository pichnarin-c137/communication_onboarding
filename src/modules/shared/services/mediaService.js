import api from '@/core/services/api.js'

export const mediaService = {
  /**
   * Upload a File object to the backend media endpoint (multipart/form-data).
   * Returns { id, file_url, filename, media_category, storage }
   * @param {File} file
   * @param {string} category - 'logo' | 'document' | 'profile' | 'banner' | 'other'
   */
  async uploadFile(file, category = 'other') {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('category', category)
    const response = await api.post('/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  /**
   * Upload a Base64 data URI string to the backend media endpoint.
   * Returns { id, file_url, filename, media_category, storage }
   * @param {string} base64 - data URI (e.g. "data:image/png;base64,...")
   * @param {string} category
   */
  async uploadBase64(base64, category = 'other') {
    const response = await api.post('/media', { base64, category })
    return response.data
  },
}
