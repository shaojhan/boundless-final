/**
 * api-client.ts — 集中式 fetch 封裝，處理 access token 的記憶體儲存與自動 refresh
 *
 * 安全設計：
 * - access token 存在模組層級變數（記憶體），不碰 localStorage，XSS 無法讀取
 * - 401 時自動呼叫 /api/auth/refresh（瀏覽器自動帶上 HTTP-only cookie）
 * - refresh 失敗則跳轉 /login，避免無限 retry loop
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3005'

// 模組層級 access token（頁面重整後清空，需透過 /api/auth/refresh 從 cookie 還原）
let _accessToken: string | null = null

export function setAccessToken(token: string): void {
  _accessToken = token
}

export function clearAccessToken(): void {
  _accessToken = null
}

export function getAccessToken(): string | null {
  return _accessToken
}

/**
 * authFetch — 帶 Authorization header 的 fetch wrapper
 *
 * 用法與 fetch() 相同：
 *   authFetch('/api/user/123')
 *   authFetch('/api/user/editProfile/123', { method: 'POST', body: JSON.stringify(data) })
 */
export async function authFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`

  const buildHeaders = (): HeadersInit => ({
    'Content-Type': 'application/json',
    ...options.headers,
    ...(_accessToken ? { Authorization: `Bearer ${_accessToken}` } : {}),
  })

  // 第一次嘗試
  let response = await fetch(url, {
    ...options,
    headers: buildHeaders(),
    credentials: 'include', // 讓 refresh endpoint 能帶上 HTTP-only cookie
  })

  if (response.status !== 401) {
    return response
  }

  // 收到 401 → 嘗試 refresh
  const refreshed = await _tryRefresh()
  if (!refreshed) {
    // refresh 也失敗 → 通知 AuthProvider 清除狀態並跳回登入頁
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth:logout'))
    }
    return response
  }

  // 用新 token retry 原始請求（只 retry 一次，避免無限迴圈）
  return fetch(url, {
    ...options,
    headers: buildHeaders(), // buildHeaders() 重新讀取已更新的 _accessToken
    credentials: 'include',
  })
}

/** 內部：呼叫 /api/auth/refresh，成功回傳 true */
async function _tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // 關鍵：讓瀏覽器帶上 HTTP-only refreshToken cookie
    })
    if (!res.ok) return false

    const data = await res.json()
    if (data.status === 'success' && data.token) {
      setAccessToken(data.token)
      return true
    }
    return false
  } catch {
    return false
  }
}
