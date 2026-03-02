import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/router'
import { logout } from '@/store/slices/authSlice'
import { clearAccessToken } from '@/lib/api-client'

export function AuthEventBridge() {
  const dispatch = useDispatch()
  const router = useRouter()

  useEffect(() => {
    const onTokenExpired = () => {
      clearAccessToken()
      dispatch(logout())
      router.push('/login')
    }
    window.addEventListener('auth:logout', onTokenExpired)
    return () => window.removeEventListener('auth:logout', onTokenExpired)
  }, [dispatch, router])

  return null
}
