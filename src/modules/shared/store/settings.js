import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getSettings, updateSettings } from '@/modules/shared/services/settingsService'
import { extractErrorMessage } from '@core/services/error.handler'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref(null)

  async function fetchSettings() {
    loading.value = true
    error.value = null
    try {
      settings.value = await getSettings()
    } catch (err) {
      error.value = extractErrorMessage(err)
    } finally {
      loading.value = false
    }
  }

  async function saveSettings(patch) {
    saving.value = true
    error.value = null
    try {
      settings.value = await updateSettings(patch)
      return true
    } catch (err) {
      error.value = extractErrorMessage(err)
      return false
    } finally {
      saving.value = false
    }
  }

  return { settings, loading, saving, error, fetchSettings, saveSettings }
})
