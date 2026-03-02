import { useState, useEffect, useCallback } from 'react'

export function useDetailFetch<T = unknown>(url: string | null) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async (fetchUrl: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(fetchUrl)
      const json = await res.json()
      setData(json)
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (url) {
      fetchData(url)
    }
  }, [url, fetchData])

  const refetch = useCallback(() => {
    if (url) fetchData(url)
  }, [url, fetchData])

  return { data, loading, error, refetch }
}
