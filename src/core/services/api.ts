import axios, { type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios'

// In-memory token — never written to localStorage
let _accessToken: string | null = null
let _isRefreshing = false
let _refreshQueue: Array<(token: string) => void> = []

export function setAccessToken(token: string | null): void {
  _accessToken = token
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Attach Bearer token from memory
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (_accessToken) {
      config.headers.set('Authorization', `Bearer ${_accessToken}`)
    }
    return config
  },
  (error: unknown) => Promise.reject(error),
)

// 401 → silent refresh → retry original request
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    // If the failing request IS the refresh endpoint, give up and redirect
    const refreshUrl: string = import.meta.env.VITE_AUTH_REFRESH
    if (original.url === refreshUrl) {
      _accessToken = null
      _refreshQueue = []
      window.location.href = '/login'
      return Promise.reject(error)
    }

    // Queue parallel requests while refresh is in-flight
    if (_isRefreshing) {
      return new Promise((resolve) => {
        _refreshQueue.push((token: string) => {
          original.headers.set('Authorization', `Bearer ${token}`)
          resolve(api(original))
        })
      })
    }

    original._retry = true
    _isRefreshing = true

    try {
      const res = await api.post(refreshUrl)   // no body — cookie is auto-sent
      const newToken: string = res.data.data.access_token
      _accessToken = newToken
      _refreshQueue.forEach((cb) => cb(newToken))
      _refreshQueue = []
      original.headers.set('Authorization', `Bearer ${newToken}`)
      return api(original)
    } catch {
      _accessToken = null
      _refreshQueue = []
      window.location.href = '/login'
      return Promise.reject(error)
    } finally {
      _isRefreshing = false
    }
  },
)

export default api
