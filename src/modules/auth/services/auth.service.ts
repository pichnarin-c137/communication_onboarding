import api from '@core/services/api'
import { extractErrorMessage, throwError } from '@/core/services/error.handler'
import type {
  LoginCredentials,
  OTPData,
  LoginResponse,
  OTPVerifyResponse,
  RefreshTokenResponse,
  ProfileResponse,
} from '../types'
import { AuthErrorMessages } from '../types'

const ENDPOINTS = {
  LOGIN: import.meta.env.VITE_AUTH_LOGIN,
  VERIFY_OTP: import.meta.env.VITE_AUTH_VERIFY_OTP,
  REFRESH_TOKEN: import.meta.env.VITE_AUTH_REFRESH,
  LOGOUT: import.meta.env.VITE_USER_LOGOUT,
  PROFILE: import.meta.env.VITE_USER_PROFILE,
} as const

class AuthService {
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>(ENDPOINTS.LOGIN, credentials)
      return response.data
    } catch (error: unknown) {
      throwError(extractErrorMessage(error) || AuthErrorMessages.INVALID_CREDENTIALS)
    }
  }

  static async verifyOtp(data: OTPData): Promise<OTPVerifyResponse> {
    try {
      const response = await api.post<OTPVerifyResponse>(ENDPOINTS.VERIFY_OTP, data)
      return response.data
    } catch (error: unknown) {
      throwError(extractErrorMessage(error) || AuthErrorMessages.OTP_MISMATCH)
    }
  }

  static async refreshToken(): Promise<RefreshTokenResponse> {
    try {
      const response = await api.post<RefreshTokenResponse>(ENDPOINTS.REFRESH_TOKEN)
      return response.data
    } catch (error: unknown) {
      throwError(extractErrorMessage(error) || AuthErrorMessages.TOKEN_EXPIRED)
    }
  }

  static async logout(): Promise<void> {
    try {
      await api.post(ENDPOINTS.LOGOUT)
    } catch (error: unknown) {
      throwError(extractErrorMessage(error) || AuthErrorMessages.LOGOUT_FAILED)
    }
  }

  static async getUserProfile(): Promise<ProfileResponse> {
    try {
      const response = await api.get<ProfileResponse>(ENDPOINTS.PROFILE)
      return response.data
    } catch (error: unknown) {
      throwError(extractErrorMessage(error) || AuthErrorMessages.PROFILE_FETCH_FAILED)
    }
  }
}

export default AuthService


