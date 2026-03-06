import express from 'express';
import jwt from 'jsonwebtoken';
import 'dotenv/config.js';
import db from '../db.js';
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
  const [rows] = await db.execute('SELECT * FROM user WHERE google_uid = ?;', [
    google_uid,
  ]);

  let returnUser: {
    id: number;
    name: string;
    email: string;
    img?: string;
    my_jam?: number;
  };

  if (rows.length > 0) {
    // 已存在 → 直接取得資料
    const dbUser = rows[0];
    returnUser = {
      id: dbUser.id as number,
      name: dbUser.name as string,
      email: dbUser.email as string,
      img: dbUser.img as string | undefined,
      my_jam: dbUser.my_jam as number | undefined,
    };
  } else {
    // 不存在 → 建立新使用者
    const currentTime = new Date();
    const taipeiTime = new Date(currentTime.getTime() + 8 * 60 * 60 * 1000);
    const createdTime = taipeiTime.toISOString().slice(0, 19).replace('T', ' ');

    await db.execute(
      'INSERT INTO user (name, email, google_uid, photo_url, nickname, created_time, valid) VALUES (?, ?, ?, ?, ?, ?, 1);',
      [
        name ?? email,
        email,
        google_uid,
        picture ?? null,
        name ?? email,
        createdTime,
      ]
    );

    const [lastRow] = await db.execute(
      'SELECT LAST_INSERT_ID() AS inserted_id'
    );
    const lastId = lastRow[0].inserted_id;

    const [newRow] = await db.execute(
      'SELECT id, name, email, img, my_jam FROM user WHERE id = ?;',
      [lastId]
    );
    returnUser = {
      id: newRow[0].id as number,
      name: newRow[0].name as string,
      email: newRow[0].email as string,
      img: newRow[0].img as string | undefined,
      my_jam: newRow[0].my_jam as number | undefined,
    };
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

export default router;
