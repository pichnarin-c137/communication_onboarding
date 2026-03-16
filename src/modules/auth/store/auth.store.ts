import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import AuthService from '../services/auth.service'
import { setAccessToken } from '@core/services/api'
import type { UserProfile, LoginCredentials } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserProfile | null>(null)
  const pendingIdentifier = ref<string | null>(null)
  const error = ref<string | null>(null)
  const loading = ref(false)
  const accessToken = ref<string | null>(null)
  const bootstrapped = ref(false)

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
      const response = await AuthService.verifyOtp({ identifier, otp })
      accessToken.value = response.data.access_token
      setAccessToken(response.data.access_token)
      user.value = response.data.user
      pendingIdentifier.value = null
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
    } catch {
      // Swallow — user is simply not authenticated
    }
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

  function clearError(): void {
    error.value = null
  }

  return {
    user,
    pendingIdentifier,
    error,
    loading,
    accessToken,
    bootstrapped,
    isSales,
    isTrainer,
    isAuthenticated,
    userId,
    login,
    verifyOtp,
    bootstrapSession,
    logout,
    fetchProfile,
    clearError,
  }
})

function throwError(message: string): never {
  throw new Error(message)
}
