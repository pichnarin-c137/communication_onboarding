import { ref, onUnmounted } from 'vue'
import { useLocationWatch } from './useGeolocation.js'
import { trainerTrackingService } from '@/modules/trainer/services/trackingService.js'

const STORAGE_KEY = 'coms_trainer_tracking'
const PING_INTERVAL_MS = 30000
const INITIAL_PING_DELAY_MS = 3000 // Wait for first GPS fix before sending

export function useTrainerTracking() {
  const isTracking = ref(false)
  const trackingState = ref(null)
  const { position, error: gpsError, start: startGps, stop: stopGps } = useLocationWatch()

  let pingInterval = null

  function _saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }

  function _clearState() {
    localStorage.removeItem(STORAGE_KEY)
  }

  function _loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  async function _sendPing() {
    if (!position.value) return
    try {
      await trainerTrackingService.sendPing({
        latitude: position.value.latitude,
        longitude: position.value.longitude,
        accuracy: position.value.accuracy ?? null,
        speed: position.value.speed ?? null,
        timestamp: new Date().toISOString()
      })
    } catch {
      // Silently fail — next ping will retry
    }
  }

  function startTracking(appointmentId, customerId) {
    const state = { appointmentId, customerId, startedAt: new Date().toISOString() }
    trackingState.value = state
    isTracking.value = true
    _saveState(state)

    startGps()

    if (pingInterval) clearInterval(pingInterval)
    pingInterval = setInterval(_sendPing, PING_INTERVAL_MS)
    setTimeout(_sendPing, INITIAL_PING_DELAY_MS)
  }

  function stopTracking() {
    isTracking.value = false
    trackingState.value = null
    _clearState()

    if (pingInterval) {
      clearInterval(pingInterval)
      pingInterval = null
    }
    stopGps()
  }

  function resumeIfActive() {
    const saved = _loadState()
    if (saved?.appointmentId) {
      trackingState.value = saved
      isTracking.value = true
      startGps()
      if (pingInterval) clearInterval(pingInterval)
      pingInterval = setInterval(_sendPing, PING_INTERVAL_MS)
    }
  }

  onUnmounted(() => {
    if (pingInterval) {
      clearInterval(pingInterval)
      pingInterval = null
    }
  })

  return { isTracking, trackingState, gpsError, startTracking, stopTracking, resumeIfActive }
}
