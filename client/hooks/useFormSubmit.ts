import { useState } from 'react'

interface UseFormSubmitOptions<T> {
  method?: 'POST' | 'PUT'
  onSuccess?: (_result: T) => void
}

export function useFormSubmit<T = unknown>(
  url: string,
  options: UseFormSubmitOptions<T> = {},
) {
  const { method = 'PUT', onSuccess } = options
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const submit = async (formData: FormData): Promise<T | null> => {
    if (!url) return null
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(url, {
        method,
        body: formData,
        credentials: 'include',
      })
      const result: T = await res.json()
      onSuccess?.(result)
      return result
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)))
      return null
    } finally {
      setSubmitting(false)
    }
  }

  return { submit, submitting, error }
}
