import { useState, useEffect, useCallback } from 'react'

export function useDetailFetch<T = unknown>(url: string | null) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async (fetchUrl: string, signal?: AbortSignal) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(fetchUrl, { signal })
      const json = await res.json()
      setData(json)
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return
      setError(e instanceof Error ? e : new Error(String(e)))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!url) return
    const controller = new AbortController()
    fetchData(url, controller.signal)
    return () => controller.abort()
  }, [url, fetchData])

  const refetch = useCallback(() => {
    if (url) fetchData(url)
  }, [url, fetchData])

  return { data, loading, error, refetch }
}
