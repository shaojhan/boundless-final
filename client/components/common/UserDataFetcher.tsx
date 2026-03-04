import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useAuth } from '@/hooks/user/use-auth'

export function UserDataFetcher() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastAuthTime = useSelector((state: any) => state.auth.lastAuthTime)
  const { getLoginUserData } = useAuth()

  useEffect(() => {
    if (lastAuthTime) getLoginUserData()
  }, [lastAuthTime])

  return null
}
