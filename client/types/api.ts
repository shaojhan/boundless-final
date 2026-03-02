// ─── API 層參數型別 ───────────────────────────────────────────────────────

export interface ApiGetParam {
  url: string
  success: (_data: unknown) => void
  fail: (_err: unknown) => void
}

export interface ApiPostParam<T = Record<string, unknown>> {
  url: string
  param?: T
  success: (_data: unknown) => void
  fail: (_err: unknown) => void
}

// ─── 使用者 / 認證 ────────────────────────────────────────────────────────

export interface LoginUserData {
  id: number
  name: string
  email: string
  phone: string | null
  google_uid: string | null
  img: string | null
  valid: number
  my_jam?: number
}

export interface JwtPayload {
  id: number
  email: string
  name: string
  my_jam?: number
  iat: number
  exp: number
}

// ─── 優惠券 ───────────────────────────────────────────────────────────────

export interface CouponItem {
  id: number
  name: string
  discount: number
  kind: number
  type: number
  created_time: string
  limit_time: string
  limitNum: number
  valid: number
  template_id: number
}

export interface CreateCouponParam {
  user_id: number
  coupon_template_id: number
}
