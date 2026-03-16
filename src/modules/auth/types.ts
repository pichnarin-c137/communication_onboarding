// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface LoginCredentials {
  identifier: string
  password: string
}

export interface OTPData {
  identifier: string
  otp: string
}

export interface RefreshTokenData {}

export interface LogoutData {}

// ─── User Profile ─────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string
  first_name: string
  last_name: string
  full_name?: string
  email: string
  username: string
  role: string
  phone_number?: string
  dob?: string
  address?: string
  gender?: string
  nationality?: string
  is_suspended?: boolean
  created_at?: string
}

// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface LoginResponse {
  success: boolean
  message: string
  data: {
    email: string
    next_step: string
  }
}

export interface OTPVerifyResponse {
  success: boolean
  message: string
  data: {
    access_token: string
    token_type: string
    expires_in: number
    user: UserProfile
  }
}

export interface RefreshTokenResponse {
  success: boolean
  message: string
  data: {
    access_token: string
    token_type: string
    expires_in: number
  }
}

export interface ProfileResponse {
  success: boolean
  data: UserProfile
}

// ─── Error Messages ───────────────────────────────────────────────────────────

export enum AuthErrorMessages {
  INVALID_CREDENTIALS = 'Invalid credentials. Please check your email and password.',
  OTP_MISMATCH = 'OTP does not match. Please try again.',
  TOKEN_EXPIRED = 'Your session has expired. Please login again.',
  LOGOUT_FAILED = 'Logout failed. Please try again.',
  PROFILE_FETCH_FAILED = 'Failed to load user profile. Please refresh.',
}
