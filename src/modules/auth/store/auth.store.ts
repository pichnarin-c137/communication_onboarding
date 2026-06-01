import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import AuthService from '../services/auth.service'
import { setAccessToken, setImpersonating } from '@core/services/api'
import type { UserProfile, LoginCredentials } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserProfile | null>(null)
  const pendingIdentifier = ref<string | null>(null)
  const pendingRememberMe = ref(false)
  const error = ref<string | null>(null)
  const loading = ref(false)
  const accessToken = ref<string | null>(null)
  const bootstrapped = ref(false)
  const impersonating = ref(false)

  const isSales = computed(() => user.value?.role === 'sale')
  const isTrainer = computed(() => user.value?.role === 'trainer')
  const isAuthenticated = computed(() => user.value !== null)
  const userId = computed(() => user.value?.id ?? null)

  async function login(credentials: LoginCredentials): Promise<void> {
    error.value = null
    loading.value = true
    try {
      const response = await AuthService.login(credentials)
      pendingIdentifier.value = response.data.email
      pendingRememberMe.value = Boolean(credentials.remember_me)
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function verifyOtp(otp: string): Promise<void> {
    const identifier = pendingIdentifier.value
    if (!identifier) throwError('No pending login. Please login again.')
    error.value = null
    loading.value = true
    try {
      const response = await AuthService.verifyOtp({
        identifier,
        otp,
        remember_me: pendingRememberMe.value,
      })
      accessToken.value = response.data.access_token
      setAccessToken(response.data.access_token)
      user.value = response.data.user
      pendingIdentifier.value = null
      pendingRememberMe.value = false

      silentGpsCheckin()
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function bootstrapSession(): Promise<void> {
    if (bootstrapped.value) return
    bootstrapped.value = true
    try {
      const response = await AuthService.refreshToken()
      accessToken.value = response.data.access_token
      setAccessToken(response.data.access_token)
      await fetchProfile()

      silentGpsCheckin()
    } catch {
      // Swallow — user is simply not authenticated
    }
  }

  /**
   * Fire-and-forget GPS check-in for trainers.
   * Seeds their position in Redis so sales can see them on the map.
   */
  function silentGpsCheckin(): void {
    if (user.value?.role !== 'trainer') return
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // @ts-ignore — trainerService is a plain JS module
        import('@/modules/trainer/services/trainerService').then(({ trainerService }: any) => {
          trainerService.checkin(pos.coords.latitude, pos.coords.longitude).catch(() => {
            // Silent — GPS check-in is best-effort
          })
        })
      },
      (err) => {
        if (import.meta.env.DEV) {
          console.debug(
            '[GPS Check-in] Unavailable — this is normal on desktop.',
            'Trainers on mobile devices will use hardware GPS.',
            `Reason: ${err.message}`
          )
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  async function logout(): Promise<void> {
    error.value = null
    loading.value = true
    try {
      await AuthService.logout()
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err)
    } finally {
      user.value = null
      pendingIdentifier.value = null
      pendingRememberMe.value = false
      accessToken.value = null
      setAccessToken(null)
      bootstrapped.value = false
      loading.value = false
    }
  }

  async function fetchProfile(): Promise<void> {
    error.value = null
    loading.value = true
    try {
      const response = await AuthService.getUserProfile()
      user.value = response.data
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : String(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Admin force-login: swap the in-memory session to the target user.
   * The admin's own session lives in the httpOnly refresh cookie and is left
   * untouched — stopImpersonation() restores it via bootstrapSession().
   */
  function startImpersonation(tokenBundle: {
    access_token: string
    user: UserProfile
  }): void {
    accessToken.value = tokenBundle.access_token
    setAccessToken(tokenBundle.access_token)
    user.value = tokenBundle.user
    impersonating.value = true
    setImpersonating(true)
    // Prevent route guards from re-bootstrapping the admin session over the top.
    bootstrapped.value = true
  }

  /**
   * Exit impersonation and restore the admin from the refresh cookie.
   */
  async function stopImpersonation(): Promise<void> {
    if (!impersonating.value) return
    impersonating.value = false
    setImpersonating(false)
    user.value = null
    accessToken.value = null
    setAccessToken(null)
    bootstrapped.value = false
    await bootstrapSession()
  }

  function clearError(): void {
    error.value = null
  }

  return {
    user,
    pendingIdentifier,
    pendingRememberMe,
    error,
    loading,
    accessToken,
    bootstrapped,
    impersonating,
    isSales,
    isTrainer,
    isAuthenticated,
    userId,
    login,
    verifyOtp,
    bootstrapSession,
    logout,
    fetchProfile,
    startImpersonation,
    stopImpersonation,
    clearError,
  }
})

function throwError(message: string): never {
  throw new Error(message)
}
