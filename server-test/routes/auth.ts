import express from 'express';
import jwt from 'jsonwebtoken';
import 'dotenv/config.js';
import prisma from '#configs/prisma.js';
import {
  findValidRefreshToken,
  deleteRefreshToken,
  createRefreshToken,
} from '#db-helpers/refresh-token.js';

const router = express.Router();
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 毫秒（7 天）
};

/**
 * POST /api/auth/refresh
 *
 * 讀取 HttpOnly refreshToken cookie，驗證後做 rotation：
 * - 刪除舊 token
 * - 建立新 refresh token（存 DB + 設 cookie）
 * - 回傳新 15 分鐘 access token
 */
router.post('/refresh', async (req, res) => {
  const incomingRefreshToken: string | undefined = req.cookies?.refreshToken;

  if (!incomingRefreshToken) {
    return res.status(401).json({
      status: 'error',
      message: '未登入',
      code: 'NO_REFRESH_TOKEN',
    });
  }

  // 查 DB 確認 token 有效且未過期
  const tokenRow = await findValidRefreshToken(incomingRefreshToken);
  if (!tokenRow) {
    // 無效或過期，清除殘留 cookie
    res.clearCookie('refreshToken', { ...REFRESH_COOKIE_OPTIONS, maxAge: 0 });
    return res.status(401).json({
      status: 'error',
      message: '登入已過期，請重新登入',
      code: 'INVALID_REFRESH_TOKEN',
    });
  }

  // 查詢 user 資料
  const user = await prisma.user.findFirst({
    where: { id: tokenRow.user_id, valid: 1 },
    select: { id: true, uid: true, name: true, email: true, img: true, my_jam: true },
  });
  if (!user) {
    await deleteRefreshToken(incomingRefreshToken);
    res.clearCookie('refreshToken', { ...REFRESH_COOKIE_OPTIONS, maxAge: 0 });
    return res.status(401).json({
      status: 'error',
      message: '使用者不存在',
      code: 'USER_NOT_FOUND',
    });
  }

  // Rotation：刪除舊 token，建立新 token
  await deleteRefreshToken(incomingRefreshToken);
  const newRefreshToken = await createRefreshToken(user.id as number);

  // 簽發新 access token（15 分鐘）
  const newAccessToken = jwt.sign(
    {
      id: user.id,
      uid: user.uid,
      name: user.name,
      email: user.email,
      img: user.img,
      my_jam: user.my_jam,
    },
    accessTokenSecret,
    { expiresIn: '15m' }
  );

  // 設定新 refresh token cookie
  res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);

  return res.status(200).json({
    status: 'success',
    token: newAccessToken,
    user: {
      id: user.id,
      uid: user.uid,
      name: user.name,
      email: user.email,
      img: user.img,
      my_jam: user.my_jam,
    },
  });
});

/**
 * POST /api/auth/logout
 *
 * 不需要 access token；refreshToken cookie path = '/api/auth' 所以這裡能收到。
 * 從 DB 刪除 refresh token，再清除 cookie。
 */
router.post('/logout', async (req, res) => {
  const incomingRefreshToken: string | undefined = req.cookies?.refreshToken;
  if (incomingRefreshToken) {
    await deleteRefreshToken(incomingRefreshToken);
  }
  res.clearCookie('refreshToken', { ...REFRESH_COOKIE_OPTIONS, maxAge: 0 });
  return res.status(200).json({ status: 'success', message: '已登出' });
});

export default router;
