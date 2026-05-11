import api from '@/core/services/api.js'

export const trainerService = {
  // Dashboard

  async getDashboard() {
    const response = await api.get('/dashboard/trainer')
    return response.data
  },

  // Appointments

  async getAppointments(params = {}) {
    const response = await api.get('/appointments', { params })
    return response.data
  },

  async getAppointment(id) {
    const response = await api.get(`/appointments/${id}`)
    return response.data
  },

  /**
   * Physical/hybrid only. Records GPS coords when trainer departs the office.
   * @param {string} id - appointment UUID
   * @param {number} latitude
   * @param {number} longitude
   */
  async leaveOffice(id, latitude, longitude) {
    const response = await api.patch(`/appointments/${id}/leave-office`, { latitude, longitude })
    return response.data
  },

  /**
   * Marks appointment as in_progress. Requires proof media_id and GPS.
   * @param {Object} data - { start_proof_media_id, start_latitude, start_longitude }
   */
  async startAppointment(id, data) {
    const response = await api.patch(`/appointments/${id}/start`, data)
    return response.data
  },

  /**
   * Completes the appointment. Requires proof media_id, GPS, student count.
   * @param {Object} data - { end_proof_media_id, end_latitude, end_longitude, student_count, completion_notes? }
   */
  async completeAppointment(id, data) {
    const response = await api.patch(`/appointments/${id}/complete`, data)
    return response.data
  },

  async cancelAppointment(id, cancellationReason) {
    const response = await api.post(`/appointments/${id}/cancel`, { cancellation_reason: cancellationReason })
    return response.data
  },

  /**
   * @param {Object} data - { scheduled_date, scheduled_start_time, scheduled_end_time, reschedule_reason? }
   */
  async rescheduleAppointment(id, data) {
    const response = await api.post(`/appointments/${id}/reschedule`, data)
    return response.data
  },

  // Appointment Students

  async getStudents(appointmentId) {
    const response = await api.get(`/appointments/${appointmentId}/students`)
    return response.data
  },

  /**
   * @param {Array} students - [{ name, phone_number, profession, attendance_status? }]
   */
  async addStudents(appointmentId, students) {
    const response = await api.post(`/appointments/${appointmentId}/students`, { students })
    return response.data
  },

  /**
   * @param {string} status - 'present' | 'absent'
   */
  async markAttendance(appointmentId, studentId, status) {
    const response = await api.patch(
      `/appointments/${appointmentId}/students/${studentId}/attendance`,
      { attendance_status: status }
    )
    return response.data
  },

  // Media upload (unchanged)
  async checkin(latitude, longitude) {
    const response = await api.post('/trainer/checkin', { latitude, longitude })
    return response.data
  },

  async uploadProofPhoto(file) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('category', 'other')
    const response = await api.post('/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    const data = response.data?.data
    if (!data?.id) throw new Error('Media upload did not return a valid ID.')
    return { id: data.id, file_url: data.file_url }
  },

  // R2 presigned upload flow

  async presignMedia({ filename, mime_type, folder }) {
    const response = await api.post('/media/presign', { filename, mime_type, folder })
    return response.data?.data  // { upload_url, key }
  },

  async confirmMedia({ key, mime_type, file_size, original_filename, category = 'other' }) {
    const response = await api.post('/media/confirm', { key, mime_type, file_size, original_filename, category })
    return response.data?.data  // { media_id, file_url }
  },

  /**
   * Full R2 upload: presign → PUT to R2 → confirm → returns media_id
   * @param {Blob} blob - raw image blob
   * @param {'start_proof'|'end_proof'|'logos'|'patent'|'uploads'} folder
   * @returns {Promise<string>} media_id UUID
   */
  async uploadProofToR2(blob, folder) {
    const mimeType = blob.type || 'image/jpeg'

    const presigned = await this.presignMedia({
      filename: 'proof.jpg',
      mime_type: mimeType,
      folder,
    })
    if (!presigned?.upload_url) throw new Error('Failed to get upload URL from server.')

    const putRes = await fetch(presigned.upload_url, {
      method: 'PUT',
      body: blob,
      headers: { 'Content-Type': mimeType, ...(presigned.headers ?? {}) },
    })
    if (!putRes.ok) throw new Error(`Photo upload failed (${putRes.status}). Please try again.`)

    const confirmed = await this.confirmMedia({
      key: presigned.key,
      mime_type: mimeType,
      file_size: blob.size,
      original_filename: 'proof.jpg',
    })
    if (!confirmed?.media_id) throw new Error('Failed to confirm uploaded photo.')
    return confirmed.media_id
  },
}
