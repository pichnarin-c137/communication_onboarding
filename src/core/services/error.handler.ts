import type { AxiosError, AxiosResponse } from 'axios'

export interface BackendErrorBody {
  message: string
  status?: number
  code?: number
  error_code?: string
  errors?: Record<string, unknown>
  context?: Record<string, unknown>
  data?: unknown
}

export function isAxiosError(error: unknown): error is AxiosError<BackendErrorBody> {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as Record<string, unknown>)['isAxiosError'] === true
  )
}

function isBackendErrorBody(data: unknown): data is BackendErrorBody {
  return (
    typeof data === 'object' &&
    data !== null &&
    'message' in data &&
    typeof (data as Record<string, unknown>)['message'] === 'string'
  )
}

const HTTP_ERROR_MAP: Readonly<Record<number, string>> = {
  400: 'Bad request.',
  401: 'Unauthorized. Please login.',
  403: 'You do not have permission.',
  404: 'Resource not found.',
  408: 'Request timed out.',
  422: 'Validation failed.',
  429: 'Too many requests. Please slow down.',
  500: 'Server error. Please try again later.',
  502: 'Bad gateway.',
  503: 'Service unavailable.',
}

const ERROR_CODE_MAP: Readonly<Record<string, string>> = {
  TRAINER_NOT_IN_SALE_ROSTER: 'This trainer is not in the sale’s assigned roster.',
  TRAINER_HAS_ACTIVE_COMMITMENTS: 'Trainer has active onboardings, appointments, or roster memberships. Clear them first.',
  TRAINER_WORKLOAD_EXCEEDED: 'Trainer has reached a workload cap.',
  MIN_DEDICATED_TRAINERS_REQUIRED: 'At least one dedicated trainer is required.',
  INVALID_USER_ROLE_FOR_ROSTER: 'User role is not eligible for a trainer roster.',
  SUSPENDED_OR_DELETED_TRAINER_CANNOT_BE_ASSIGNED: 'Suspended or deleted trainers cannot be assigned.',
}

export function getErrorCode(error: unknown): string | null {
  if (!isAxiosError(error) || !error.response) return null
  const data = error.response.data as unknown
  if (isBackendErrorBody(data) && typeof data.error_code === 'string') {
    return data.error_code
  }
  return null
}

export function getErrorContext<T = Record<string, unknown>>(error: unknown): T | null {
  if (!isAxiosError(error) || !error.response) return null
  const data = error.response.data as unknown
  if (isBackendErrorBody(data) && data.context && typeof data.context === 'object') {
    return data.context as T
  }
  return null
}

export function extractErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (!error.response) {
      return error.request != null
        ? 'No internet connection. Please check your network and try again.'
        : 'Failed to send request. Please try again.'
    }

    const { status, data } = error.response as AxiosResponse<unknown>

    if (isBackendErrorBody(data)) {
      if (data.error_code && ERROR_CODE_MAP[data.error_code]) {
        return ERROR_CODE_MAP[data.error_code]
      }
      if (data.message.trim().length > 0) {
        return data.message.trim()
      }
    }

    return HTTP_ERROR_MAP[status] ?? `Unexpected error (HTTP ${status}).`
  }

  if (error instanceof Error) {
    return error.message.trim() || 'An unexpected error occurred.'
  }

  if (typeof error === 'string' && error.trim().length > 0) {
    return error.trim()
  }

  return 'An unexpected error occurred.'
}

export function throwError(message: string): never {
  throw new Error(message)
}
