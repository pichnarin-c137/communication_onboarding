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
