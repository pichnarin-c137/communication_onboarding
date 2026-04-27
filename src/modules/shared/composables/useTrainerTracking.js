import { ref, onUnmounted } from 'vue'
import { useLocationWatch } from './useGeolocation.js'
import { trainerTrackingService } from '@/modules/trainer/services/trackingService.js'

const STORAGE_KEY = 'coms_trainer_tracking'
const INITIAL_PING_DELAY_MS = 3000  // Wait for first GPS fix before sending
const ERROR_RETRY_DELAY_MS  = 30000 // Retry delay when a ping request fails

export function useTrainerTracking() {
  const isTracking = ref(false)
  const trackingState = ref(null)
  const { position, error: gpsError, start: startGps, stop: stopGps } = useLocationWatch()

  let pingTimer = null

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

  function _schedulePing(delayMs) {
    if (pingTimer) clearTimeout(pingTimer)
    pingTimer = setTimeout(_sendPing, delayMs)
  }

  async function _sendPing() {
    if (!position.value) {
      // No GPS fix yet — retry after the error delay
      _schedulePing(ERROR_RETRY_DELAY_MS)
      return
    }
    try {
      const res = await trainerTrackingService.sendPing({
        latitude:  position.value.latitude,
        longitude: position.value.longitude,
        accuracy:  position.value.accuracy ?? null,
        speed:     position.value.speed ?? null,
        timestamp: new Date().toISOString()
      })
      const nextIn = res?.data?.next_ping_in
      _schedulePing((nextIn > 0 ? nextIn : 30) * 1000)
    } catch {
      // Silently fail — retry after error delay
      _schedulePing(ERROR_RETRY_DELAY_MS)
    }
  }

  function _stopTimer() {
    if (pingTimer) {
      clearTimeout(pingTimer)
      pingTimer = null
    }
  }

  function startTracking(appointmentId, customerId) {
    const state = { appointmentId, customerId, startedAt: new Date().toISOString() }
    trackingState.value = state
    isTracking.value = true
    _saveState(state)

    startGps()
    _schedulePing(INITIAL_PING_DELAY_MS)
  }

  function stopTracking() {
    isTracking.value = false
    trackingState.value = null
    _clearState()
    _stopTimer()
    stopGps()
  }

  function resumeIfActive() {
    const saved = _loadState()
    if (saved?.appointmentId) {
      trackingState.value = saved
      isTracking.value = true
      startGps()
      _schedulePing(INITIAL_PING_DELAY_MS)
    }
  }

  onUnmounted(() => {
    _stopTimer()
    stopGps()
  })

  return { isTracking, trackingState, gpsError, startTracking, stopTracking, resumeIfActive }
}
