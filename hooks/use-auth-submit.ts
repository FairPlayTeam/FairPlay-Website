'use client'

import { useCallback, useState } from 'react'
import { getApiErrorMessage } from '@/lib/api-error'

type AuthSubmitAction<TValues> = (values: TValues) => Promise<void>

export function useAuthSubmit<TValues>(
  action: AuthSubmitAction<TValues>,
  fallbackErrorMessage?: string,
) {
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const onSubmit = useCallback(
    async (values: TValues) => {
      setError(null)
      setIsSubmitting(true)

      try {
        await action(values)
      } catch (error) {
        setError(getApiErrorMessage(error, fallbackErrorMessage))
      } finally {
        setIsSubmitting(false)
      }
    },
    [action, fallbackErrorMessage],
  )

  return {
    onSubmit,
    error,
    isSubmitting,
    clearError,
  }
}
