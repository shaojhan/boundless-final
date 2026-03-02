import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useAuth } from '@/hooks/user/use-auth'
import type { RootState } from '@/store'

export function UserDataFetcher() {
  const status = useSelector((state: RootState) => state.auth.status)
  const { getLoginUserData } = useAuth()

  useEffect(() => {
    if (status === 'authenticated') getLoginUserData()
  }, [status])

  return null
}
