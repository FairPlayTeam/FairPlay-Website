import axios from 'axios'

type ApiErrorPayload = {
  error?: unknown
  message?: unknown
}

function toMessage(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim()
  return normalized ? normalized : null
}

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong!'): string {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    const payload = error.response?.data
    const fromPayload = toMessage(payload?.error) ?? toMessage(payload?.message)
    if (fromPayload) return fromPayload
  }

  if (error instanceof Error) {
    const fromError = toMessage(error.message)
    if (fromError) return fromError
  }

  return fallback
}
