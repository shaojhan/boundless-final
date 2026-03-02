import { useAuth } from '@/hooks/user/use-auth'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3005'

/**
 * 根據登入使用者資料回傳頭像圖片 URL
 * - 有上傳圖片 (img)：使用 API server 路徑
 * - Google 登入 (photo_url)：使用 OAuth 頭像 URL
 * - 其他：使用預設頭像
 */
export function useAvatarImage(): string {
  const { LoginUserData } = useAuth()
  if (LoginUserData.img) {
    return `${API_BASE}/user/${LoginUserData.img as string}`
  }
  if (LoginUserData.photo_url) {
    return LoginUserData.photo_url as string
  }
  return `${API_BASE}/user/avatar_userDefault.jpg`
}
