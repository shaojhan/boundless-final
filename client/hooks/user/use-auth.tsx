import { useDispatch, useSelector } from 'react-redux'
import { setAccessToken, clearAccessToken, authFetch } from '@/lib/api-client'
import {
  loginSuccess,
  logout as logoutAction,
  setLoginUserData,
  type User,
} from '@/store/slices/authSlice'
import type { RootState } from '@/store'

export function useAuth() {
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.auth.user)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loginUserData = useSelector((state: any) => state.auth.loginUserData)
  const status = useSelector((state: RootState) => state.auth.status)

  // 重組 auth 物件，維持原有 auth.user.id 用法
  const auth = status === 'initializing' ? undefined : !user ? null : { user }

  const isAuth = status === 'authenticated'

  const handleLoginSuccess = (token: string, userData: User) => {
    setAccessToken(token)
    dispatch(loginSuccess({ user: userData }))
    dispatch(setLoginUserData(userData))
  }

  const handleLoginStatus = () => {
    return status === 'authenticated'
  }

  const handleLogout = async () => {
    try {
      await authFetch('/api/auth/logout', {
        method: 'POST',
      })
    } catch {
      // server 呼叫失敗仍清除 client 狀態
    } finally {
      clearAccessToken()
      dispatch(logoutAction())
    }
  }

  const getLoginUserData = async () => {
    if (!user?.id) return null
    try {
      const response = await authFetch(`/api/user/${user.id}`)
      if (!response.ok) return null
      const data = await response.json()
      dispatch(setLoginUserData(data))
      return data
    } catch (error) {
      console.error('getLoginUserData failed:', error)
      return null
    }
  }

  return {
    auth,
    isAuth,
    LoginUserData: loginUserData,
    handleLoginSuccess,
    handleLoginStatus,
    handleLogout,
    getLoginUserData,
  }
}
