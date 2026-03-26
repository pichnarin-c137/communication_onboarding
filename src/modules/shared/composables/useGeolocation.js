import { ref, onUnmounted } from 'vue'

/**
 * Wraps navigator.geolocation.getCurrentPosition in a Promise.
 * Resolves with { latitude, longitude }.
 * Rejects with a user-readable error string if permission is denied or request times out.
 *
 * @returns {Promise<{ latitude: number, longitude: number }>}
 */
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
      (err) => {
        if (err.code === 1) {
          reject(new Error('Location access is required to start a session. Please enable it in your browser settings.'))
        } else if (err.code === 3) {
          reject(new Error('Location request timed out. Please try again.'))
        } else {
          reject(new Error('Unable to retrieve your location. Please try again.'))
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  })
}

/**
 * Reactive composable that wraps navigator.geolocation.watchPosition.
 * Provides continuous GPS tracking with start/stop controls.
 *
 * Must be called during component setup (uses onUnmounted for cleanup).
 */
export function useLocationWatch() {
  const position = ref(null)
  const error = ref(null)
  const isWatching = ref(false)
  let watchId = null

  function start() {
    if (!navigator.geolocation) {
      error.value = 'Geolocation is not supported by your browser.'
      return
    }
    isWatching.value = true
    error.value = null
    watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        position.value = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          speed: coords.speed ?? null
        }
      },
      (err) => {
        if (err.code === 1) error.value = 'Location permission denied. Please enable it in your browser settings.'
        else if (err.code === 3) error.value = 'Location request timed out.'
        else error.value = 'Unable to retrieve your location.'
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    )
  }

  function stop() {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      watchId = null
    }
    isWatching.value = false
  }

  onUnmounted(stop)

  return { position, error, isWatching, start, stop }
}
