import express from 'express';
import jwt from 'jsonwebtoken';
import 'dotenv/config.js';
import prisma from '#configs/prisma.js';
import { createRefreshToken } from '#db-helpers/refresh-token.js';

const router = express.Router();
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

router.post('/', async (req, res) => {
  const { accessToken } = req.body as { accessToken?: string };

  if (!accessToken) {
    return res
      .status(400)
      .json({ status: 'error', message: '缺少 Google access token' });
  }

  // 向 Google userinfo API 驗證 token 並取得使用者資料
  const userInfoRes = await fetch(
    'https://www.googleapis.com/oauth2/v3/userinfo',
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!userInfoRes.ok) {
    return res
      .status(401)
      .json({ status: 'error', message: 'Google token 無效' });
  }

  const {
    sub: google_uid,
    email,
    name,
    picture,
  } = (await userInfoRes.json()) as {
    sub: string;
    email: string;
    name: string;
    picture?: string;
  };

  if (!google_uid || !email) {
    return res
      .status(401)
      .json({ status: 'error', message: 'Google 使用者資料不完整' });
  }

  // 查詢是否已有此 google_uid 的使用者
  const SELECT_FIELDS = {
    id: true,
    name: true,
    email: true,
    img: true,
    my_jam: true,
  } as const;

  let returnUser = await prisma.user.findFirst({
    where: { google_uid },
    select: SELECT_FIELDS,
  });

  if (!returnUser) {
    // 不存在 → 建立新使用者
    const now = new Date();
    const uid = generateUid();
    returnUser = await prisma.user.create({
      data: {
        uid,
        name: name ?? email,
        email,
        password: '',
        birthday: new Date(0),
        google_uid,
        photo_url: picture ?? null,
        nickname: name ?? email,
        created_time: now,
        updated_time: now,
        valid: 1,
      },
      select: SELECT_FIELDS,
    });
  }

  // 簽發 Access token（15 分鐘）
  const token = jwt.sign(
    {
      id: returnUser.id,
      name: returnUser.name,
      email: returnUser.email,
      img: returnUser.img,
      my_jam: returnUser.my_jam,
    },
    accessTokenSecret,
    { expiresIn: '15m' }
  );

  // Refresh token（7 天，HTTP-only cookie）
  const refreshToken = await createRefreshToken(returnUser.id);
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    status: 'success',
    token,
    user: {
      id: returnUser.id,
      name: returnUser.name,
      email: returnUser.email,
      img: returnUser.img,
      my_jam: returnUser.my_jam,
    },
  });
});

function generateUid() {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

export default router;
