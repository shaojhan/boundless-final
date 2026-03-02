import crypto from 'crypto';
import db from '../db.js';

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 天

/** 產生密碼學安全的隨機 token 字串（512 bits entropy） */
export function generateRefreshTokenString(): string {
  return crypto.randomBytes(64).toString('hex');
}

/** 建立新 refresh token 並存入 DB，回傳 token 字串 */
export async function createRefreshToken(userId: number): Promise<string> {
  const token = generateRefreshTokenString();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  const expiresAtSQL = expiresAt.toISOString().slice(0, 19).replace('T', ' ');
  const createdAtSQL = new Date().toISOString().slice(0, 19).replace('T', ' ');

  await db.execute(
    'INSERT INTO refresh_token (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)',
    [token, userId, expiresAtSQL, createdAtSQL]
  );
  return token;
}

interface RefreshTokenRow {
  id: number;
  token: string;
  user_id: number;
  expires_at: Date;
  created_at: Date;
}

/** 查詢有效 refresh token，不存在或已過期回傳 null */
export async function findValidRefreshToken(
  token: string
): Promise<RefreshTokenRow | null> {
  const [rows] = await db.execute<RefreshTokenRow>(
    'SELECT * FROM refresh_token WHERE token = ? AND expires_at > NOW() LIMIT 1',
    [token]
  );
  return rows[0] ?? null;
}

/** 刪除指定 refresh token（logout / rotation 時使用） */
export async function deleteRefreshToken(token: string): Promise<void> {
  await db.execute('DELETE FROM refresh_token WHERE token = ?', [token]);
}
