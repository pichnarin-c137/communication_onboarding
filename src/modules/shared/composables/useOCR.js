import { ref } from 'vue'
import api from '@/core/services/api.js'

//  Public Composable 

export function useOCR() {
  const processing = ref(false)
  const progress = ref(0)
  const error = ref(null)
  const rawText = ref('')

  /**
   * Process a File (image or PDF) via the backend OCR endpoint and return extracted form fields.
   * Calls POST /companies/extract-document (multipart) and maps response fields to form field names.
   * @param {File} file
   * @returns {Promise<{company_name,company_name_kh,owner_name,owner_name_kh,phone,address_kh,business_type}|null>}
   */
  async function processFile(file) {
    processing.value = true
    progress.value = 0
    error.value = null
    rawText.value = ''

    try {
      progress.value = 10

      const formData = new FormData()
      formData.append('document', file)

      const response = await api.post('/companies/extract-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) {
            // Map upload progress to 10–60 range
            progress.value = 10 + Math.round((e.loaded / e.total) * 50)
          }
        },
      })

      progress.value = 80

      const extracted = response.data?.data?.extracted || {}
      rawText.value = response.data?.data?.raw_text || ''

      progress.value = 100

      // Map backend field names (company_name_en/km, address_km, etc.) to frontend form field names
      return {
        company_name:    extracted.company_name_en  || '',
        company_name_kh: extracted.company_name_km  || '',
        owner_name:      extracted.owner_name_en    || '',
        owner_name_kh:   extracted.owner_name_km    || '',
        phone:           extracted.phone            || '',
        address_kh:      extracted.address_km       || '',
        business_type:   extracted.business_type_id || '',
      }
    } catch (err) {
      error.value = err?.response?.data?.message || err?.message || 'OCR processing failed.'
      return null
    } finally {
      processing.value = false
    }
  }

  return { processing, progress, error, rawText, processFile }
}
