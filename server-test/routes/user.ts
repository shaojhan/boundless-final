import express from 'express';
import prisma from '#configs/prisma.js';
import multer from 'multer';
import { dirname, resolve, extname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
import { fetchArticles, flattenArticleList } from '../lib/article-flatten.js';

//token相關
import jwt from 'jsonwebtoken';
import 'dotenv/config.js';
import { generateHash, compareHash } from '#db-helpers/password-hash.js';
import {
  createRefreshToken,
  deleteRefreshToken,
} from '#db-helpers/refresh-token.js';
import { checkToken } from '../middleware/checkToken.js';

const router = express.Router();
const upload = multer();

//在外部設定時間戳記 當作上傳檔案時的中介 以免檔名跟資料庫的名稱不同
const setTimestamp = (req, res, next) => {
  req.timestamp = Date.now();
  next(); // 调用 next() 将控制传递给下一个中间件或路由处理程序
};

//上傳檔案-----------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, resolve(__dirname, '../public/user'));
  },
  filename: function (req, file, cb) {
    const newName =
      'avatar_user00' + req.timestamp + extname(file.originalname);
    cb(null, newName);
  },
});
const uploadTest = multer({ storage: storage });
//此路由為在使用者編輯頁時 上傳頭像使用
router.post(
  '/upload1',
  setTimestamp,
  checkToken,
  uploadTest.single('myFile'),
  async (req, res) => {
    const id = parseInt(req.body.name);

    // 只允許修改自己的頭像
    if (req.decoded.id !== id) {
      return res
        .status(403)
        .json({ status: 'error', message: '無權限修改此頭像' });
    }

    const newName = 'avatar_user00' + req.timestamp + '.jpg';

    await prisma.user.update({
      where: { id },
      data: { img: newName },
    });

    res.redirect('http://localhost:3000/user/user-info-edit');
  }
);

// 動態路由來到個人首頁（公開資料，無需驗證）
router.get('/user-homepage/:uid', async (req, res) => {
  const uid = req.params.uid as string;
  try {
    const user = await prisma.user.findFirst({
      where: { uid, valid: 1 },
      select: {
        email: true,
        nickname: true,
        phone: true,
        birthday: true,
        genre_like: true,
        play_instrument: true,
        info: true,
        gender: true,
        privacy: true,
        my_jam: true,
        photo_url: true,
        img: true,
      },
    });

    if (!user) {
      return res.json('沒有找到相應的資訊');
    }

    const jam = user.my_jam
      ? await prisma.jam.findUnique({
          where: { juid: user.my_jam },
          select: { state: true, name: true },
        })
      : null;

    const result = {
      ...user,
      my_jamState: jam?.state ?? null,
      my_jam: jam?.name ?? null,
    };
    res.json(result);
  } catch (error) {
    console.error('發生錯誤：', error);
    res.json('發生錯誤');
  }
});

// 個人首頁 獲得該使用者發布之文章
router.get('/homepageArticle/:uid', async (req, res) => {
  const uid = req.params.uid as string;

  const userRow = await prisma.user.findFirst({
    where: { uid, valid: 1 },
    select: { id: true },
  });
  const userID = userRow?.id;

  try {
    const articles = await fetchArticles({ userId: userID });
    const articleData = flattenArticleList(articles, true);
    if (articleData) {
      res.json(articleData);
    } else {
      res.json('沒有找到相應的資訊');
    }
  } catch (error) {
    console.error('發生錯誤：', error);
    res.json('發生錯誤' + error);
  }
});

// 我的文章頁 獲得該使用者發布之文章
router.get('/MyArticle/:id', async (req, res) => {
  // The user id is already the user.id — no need to re-query
  const userID = parseInt(req.params.id as string);

  try {
    const articles = await fetchArticles({ userId: userID });
    const articleData = flattenArticleList(articles, true);
    if (articleData) {
      res.json(articleData);
    } else {
      res.json('沒有找到相應的資訊');
    }
  } catch (error) {
    console.error('發生錯誤：', error);
    res.json('發生錯誤' + error);
  }
});

//登入
router.post('/login', upload.none(), async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findFirst({
    where: { email, valid: 1 },
  });
  if (user && (await compareHash(password, user.password))) {
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    const token = jwt.sign(
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

    const refreshToken = await createRefreshToken(user.id);
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
        id: user.id,
        uid: user.uid,
        name: user.name,
        email: user.email,
        img: user.img,
        my_jam: user.my_jam,
      },
    });
  } else {
    return res.status(400).json({
      status: 'error',
      message: '使用者帳號或密碼錯誤。',
    });
  }
});

router.post('/logout', checkToken, async (req, res) => {
  const { refreshToken } = req.cookies;
  if (refreshToken) {
    await deleteRefreshToken(refreshToken);
  }
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth',
  });
  return res.status(200).json({ status: 'success', message: '已登出' });
});

router.post('/status', checkToken, async (req, res) => {
  return res.status(200).json({
    status: 'ok',
    user: req.decoded,
  });
});

// GET - 得到單筆會員資料（JOIN jam 取得 my_jam 名稱）
router.get('/:id', checkToken, async function (req, res) {
  const id = parseInt(req.params.id as string);

  // IDOR 防護：只允許使用者存取自己的資料
  if (req.decoded.id !== id) {
    return res
      .status(403)
      .json({ status: 'error', message: '無權限存取此資料' });
  }

  const user = await prisma.user.findFirst({
    where: { id, valid: 1 },
    select: {
      id: true,
      uid: true,
      name: true,
      email: true,
      nickname: true,
      phone: true,
      birthday: true,
      postcode: true,
      country: true,
      township: true,
      address: true,
      genre_like: true,
      play_instrument: true,
      info: true,
      gender: true,
      privacy: true,
      google_uid: true,
      my_jam: true,
      photo_url: true,
      my_lesson: true,
      img: true,
    },
  });

  const jam = user?.my_jam
    ? await prisma.jam.findUnique({
        where: { juid: user.my_jam },
        select: { state: true, name: true },
      })
    : null;

  const resUser = user
    ? {
        ...user,
        my_jamState: jam?.state ?? null,
        my_jamname: jam?.name ?? null,
      }
    : null;

  return res.json(resUser);
});

// GET - 得到單筆會員資料（不含密碼）
router.get('/profile/:id', checkToken, async function (req, res) {
  const id = parseInt(req.params.id as string);

  // IDOR 防護：只允許使用者存取自己的資料
  if (req.decoded.id !== id) {
    return res
      .status(403)
      .json({ status: 'error', message: '無權限存取此資料' });
  }

  const resUser = await prisma.user.findFirst({
    where: { id, valid: 1 },
    omit: { password: true },
  });
  return res.json(resUser);
});

//會員更新資訊
router.post('/editProfile/:id', checkToken, async function (req, res) {
  const id = parseInt(req.params.id as string);

  // IDOR 防護：只允許使用者修改自己的資料
  if (req.decoded.id !== id) {
    return res
      .status(403)
      .json({ status: 'error', message: '無權限修改此資料' });
  }

  const {
    email,
    name,
    phone,
    postcode,
    country,
    township,
    address,
    birthday,
    genre_like,
    play_instrument,
    info,
    gender,
    nickname,
    privacy,
  } = req.body;

  const result = await prisma.user.update({
    where: { id },
    data: {
      email,
      name,
      phone,
      postcode: postcode ? parseInt(postcode) : null,
      country,
      township,
      address,
      birthday: birthday ? new Date(birthday) : undefined,
      genre_like,
      play_instrument,
      info,
      gender,
      nickname,
      privacy,
    },
  });

  return res.json({ status: 'success', data: { result } });
});

//該使用者查詢訂單
router.post('/order/:id', checkToken, async function (req, res) {
  const id = parseInt(req.params.id as string);

  // IDOR 防護：只允許使用者存取自己的訂單
  if (req.decoded.id !== id) {
    return res
      .status(403)
      .json({ status: 'error', message: '無權限存取此訂單' });
  }

  const userRow = await prisma.user.findFirst({
    where: { id, valid: 1 },
    select: { uid: true },
  });
  const UID = userRow?.uid;

  const orders = await prisma.orderTotal.findMany({
    where: { user_id: UID },
    include: { orderItems: { include: { product: true } } },
  });

  // Flatten to match original response: array of arrays (one per order)
  // Each item merges product + order_item + order_total fields (later overrides earlier)
  const productResult = orders
    .filter((o) => o.orderItems.length > 0)
    .map((o) =>
      o.orderItems.map((oi) => {
        const { product, ...oiFields } = oi;
        const { orderItems: _orderItems, ...orderFields } = o;
        return { ...product, ...oiFields, ...orderFields };
      })
    );

  return res.json({ status: 'success', data: { productResult } });
});

// 註冊
router.post('/', async (req, res) => {
  const uuid = generateUid();

  const currentTime = new Date();
  const taipeiTime = new Date(currentTime.getTime() + 8 * 60 * 60 * 1000);
  const YYYYMMDDTime = taipeiTime.toISOString().slice(0, 19).replace('T', ' ');

  const newUser = req.body;

  if (!newUser.email || !newUser.password || !newUser.passwordCheck) {
    return res.json({ status: 'error', message: '缺少必要資料' });
  }

  if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/.test(newUser.password)) {
    return res.json({ status: 'error 3', message: '密碼請由英數8~20位組成' });
  }

  const uNickname = 'USER-' + uuid;

  // 檢查 email 是否已存在
  const existing = await prisma.user.findFirst({
    where: { email: newUser.email },
  });
  if (existing) {
    return res.json({ status: 'error 2', message: '該帳號已存在' });
  }

  // 建立新會員
  const hashedPassword = await generateHash(newUser.password);
  const created = await prisma.user.create({
    data: {
      uid: uuid,
      name: newUser.name || uNickname,
      email: newUser.email,
      password: hashedPassword,
      nickname: uNickname,
      birthday: new Date('1990-01-01'),
      created_time: new Date(YYYYMMDDTime),
      updated_time: new Date(YYYYMMDDTime),
      valid: 1,
    },
  });

  // 發放新會員優惠券
  await prisma.coupon.create({
    data: {
      user_id: created.id,
      coupon_template_id: 1,
      created_time: new Date(YYYYMMDDTime),
    },
  });

  return res.status(201).json({ status: 'success', data: null });
});

function generateUid() {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const codeLength = 12;
  const createdCodes = [];
  let createCodes = '';

  let Code = '';
  do {
    Code = '';
    for (let i = 0; i < codeLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      Code += characters.charAt(randomIndex);
    }
  } while (createdCodes.includes(Code));

  createdCodes.push(Code);
  createCodes += Code;
  return createCodes;
}

export default router;
