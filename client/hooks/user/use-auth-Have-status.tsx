import { apiBaseUrl } from '@/configs'
import { createContext, useState, useContext, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import type { JwtPayload } from '@/types/api'

//建立context
interface AuthContextValue {
  handleLoginStatus: (_e?: unknown) => Promise<void>
  getLoginUserData: (_e?: unknown) => Promise<null | void>
}
const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// 協助全站(_app.js)裡套用Provider的元件，集中要使用的狀態
// 使⽤有前後開頭與結尾的自訂元件標記，需要⽤ props.children 屬性來獲得夾在其中的不確定值
export function AuthProvider({ children }) {
  // const initAuth = {
  //   isAuth: false,
  //   userData: {
  //     id: 0,
  //     name: '',
  //     email: '',
  //     google_uid: '',
  //     img: '',
  //   },
  // }

  // 共享用狀態(state)
  // const [auth, setAuth] = useState(initAuth)
  const [token, _setToken] = useState('')
  // const [userData, setUserData] = useState()

  const appKey = 'userToken'

  // 登入
  // const login = () => {
  //   setAuth({
  //     isAuth: true,
  //     userData: {
  //       id: 3,
  //       name: '鍾傑元',
  //       email: 'harmon4652@gmail.com',
  //       google_uid: '',
  //       img: 'avatar_user0003.jpg',
  //     },
  //   })
  // }

  // 登出
  // const logout = () => {
  //   setAuth(initAuth)
  // }

  //驗證當前token
  const handleLoginStatus = async (_e?: unknown) => {
    // 拿取Token回傳後端驗證狀態
    const usertoken = localStorage.getItem(appKey)
    try {
      const response = await fetch(`${apiBaseUrl}/user/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${usertoken}`,
        },
        body: JSON.stringify(null),
      })

      if (!response.ok) return
      const _statusData = await response.json()

      // 在這裡處理後端返回的資料
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error)
    }
  }

  useEffect(() => {
    // 在這裡呼叫 handleLoginStatus，確保 token 已經有值
    if (token) {
      handleLoginStatus()
    }
  }, [token])

  // 原本
  const getLoginUserData = async (_e?: unknown) => {
    // 拿取Token回傳後端驗證狀態
    const Loginusertoken = localStorage.getItem(appKey)

    if (!Loginusertoken) {
      console.error('沒有登入的token 故無法取得使用者資料。')
      return null
    }
    const userID = jwtDecode<JwtPayload>(Loginusertoken)
    const id = userID.id

    try {
      const response = await fetch(`/user/${id}`, {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Loginusertoken}`,
        },
      })

      if (!response.ok) return
      // 在這裡處理後端返回的資料
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error)
    }
  }

  useEffect(() => {
    // 在這裡呼叫 handleLoginStatus，確保 token 已經有值
    if (token) {
      getLoginUserData()
    }
  }, [token])

  return (
    <AuthContext.Provider
      value={{ handleLoginStatus, getLoginUserData }} //用value屬性傳入共享用狀態(state)
    >
      {children}
    </AuthContext.Provider>
  )
}

// 包裝好專用於此context的勾子名稱
export const useAuth = () => useContext(AuthContext)
