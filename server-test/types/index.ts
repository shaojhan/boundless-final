// ─── DB Row 型別 ──────────────────────────────────────────────────────────

export interface UserRow {
  id: number;
  name: string;
  email: string;
  password: string;
  phone: string | null;
  google_uid: string | null;
  img: string | null;
  valid: number;
  created_at: string;
  updated_at: string;
}

export interface OtpRow {
  id: number;
  user_id: number;
  email: string;
  token: string;
  exp_timestamp: number | bigint;
  created_at: string;
  updated_at: string;
}

export interface CouponTemplateRow {
  id: number;
  name: string;
  discount: string | number;
  kind: number;
  type: number;
  coupon_code: string;
  requirement: number;
  created_time: string;
  limit_time: string;
  valid: number;
}

export interface CouponRow {
  id: number;
  user_id: number;
  coupon_template_id: number;
  created_time: string;
  valid: number;
}

// ─── db.execute() 回傳型別 ────────────────────────────────────────────────

export type DbSelectResult<T = Record<string, unknown>> = [T[]];
export type DbMutateResult = [{ affectedRows: number; insertId: number }];

// ─── JWT Payload ──────────────────────────────────────────────────────────

export interface JwtPayload {
  id: number;
  uid: string;
  email: string;
  name: string;
  img?: string | null;
  my_jam?: string | null;
  iat?: number;
  exp?: number;
}

// ─── Express Request 擴充（JWT middleware 注入的 user 欄位）─────────────

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
      decoded?: JwtPayload;
      timestamp?: number;
    }
  }
}
