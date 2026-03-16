import type { AxiosError, AxiosResponse } from 'axios'

export interface BackendErrorBody {
  message: string
  status?: number
  code?: number
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

export function extractErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (!error.response) {
      return error.request != null
        ? 'No internet connection. Please check your network and try again.'
        : 'Failed to send request. Please try again.'
    }

    const { status, data } = error.response as AxiosResponse<unknown>

    if (isBackendErrorBody(data) && data.message.trim().length > 0) {
      return data.message.trim()
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
