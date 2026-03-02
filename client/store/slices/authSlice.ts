import { apiBaseUrl } from '@/configs'
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { setAccessToken } from '@/lib/api-client'

export interface User {
  id: number
  name?: string
  email?: string
  [key: string]: unknown
}

type AuthStatus = 'initializing' | 'authenticated' | 'unauthenticated'

interface AuthState {
  user: User | null
  loginUserData: Record<string, unknown>
  status: AuthStatus
}

export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { dispatch }) => {
    try {
      const res = await fetch(`${apiBaseUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) {
        dispatch(setUnauthenticated())
        return
      }
      const data = await res.json()
      if (data.status === 'success') {
        setAccessToken(data.token) // token 只存記憶體，不進 Redux
        dispatch(loginSuccess({ user: data.user }))
        dispatch(setLoginUserData(data.user))
      } else {
        dispatch(setUnauthenticated())
      }
    } catch {
      dispatch(setUnauthenticated())
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loginUserData: {},
    status: 'initializing',
  } as AuthState,
  reducers: {
    loginSuccess(state, action: PayloadAction<{ user: User }>) {
      state.user = action.payload.user
      state.status = 'authenticated'
    },
    logout(state) {
      state.user = null
      state.loginUserData = {}
      state.status = 'unauthenticated'
    },
    setLoginUserData(state, action: PayloadAction<Record<string, unknown>>) {
      state.loginUserData = action.payload
    },
    setUnauthenticated(state) {
      state.user = null
      state.status = 'unauthenticated'
    },
  },
})

export const { loginSuccess, logout, setLoginUserData, setUnauthenticated } =
  authSlice.actions

export default authSlice.reducer
