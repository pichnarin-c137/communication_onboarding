/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_AUTH_LOGIN: string
  readonly VITE_AUTH_VERIFY_OTP: string
  readonly VITE_AUTH_REFRESH: string
  readonly VITE_USER_LOGOUT: string
  readonly VITE_USER_PROFILE: string
  readonly VITE_GOOGLE_CALLBACK: string
  readonly VITE_GOOGLE_REDIECT: string
  readonly VITE_GOOGLE_STATUS: string
  readonly VITE_GOOGLE_DISCONNECT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
