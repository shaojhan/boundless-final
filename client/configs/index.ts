const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3005'

export const PORT = 6005
export const DEV = true

// express 的位置
export const apiBaseUrl: string = `${API_BASE}/api`
export const avatarBaseUrl: string = `${API_BASE}/avatar`
