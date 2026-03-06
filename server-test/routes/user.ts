import express from 'express';
import db from '#db';
import prisma from '#configs/prisma.js';
import multer from 'multer';
import { dirname, resolve, extname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

//token相關
import jwt from 'jsonwebtoken';
import 'dotenv/config.js';
import { generateHash, compareHash } from '#db-helpers/password-hash.js';
import {
  createRefreshToken,
  deleteRefreshToken,
} from '#db-helpers/refresh-token.js';

// 從環境檔抓取secretKey(token加密用)
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

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
  uploadTest.single('myFile'),
  async (req, res) => {
    const id = parseInt(req.body.name);
    const newName = 'avatar_user00' + req.timestamp + '.jpg';

    await prisma.user.update({
      where: { id },
      data: { img: newName },
    });

    res.redirect('http://localhost:3000/user/user-info-edit');
  }
);

//GET 測試 - 得到所有會員資料
router.get('/', async (req, res, _next) => {
  try {
    const userData = await prisma.user.findMany({
      where: { valid: 1 },
    });
    res.json(userData);
  } catch (error) {
    console.error('發生錯誤：', error);
    res.json('發生錯誤');
  }
});

// 動態路由來到個人首頁
router.get('/user-homepage/:uid', async (req, res) => {
  const uid = req.params.uid;
  try {
    const [userHomePageData] = await db.execute(
      'SELECT email, nickname, phone, birthday , genre_like , play_instrument , info, gender , privacy , j.state AS my_jamState, j.name AS my_jam , photo_url , img FROM `user` u LEFT JOIN `jam` j ON CONVERT(j.juid USING utf8mb4) = CONVERT(u.my_jam USING utf8mb4) WHERE u.uid = ? AND u.valid = 1',
      [uid]
    );

    const result = userHomePageData[0];
    if (userHomePageData) {
      res.json(result);
    } else {
      res.json('沒有找到相應的資訊');
    }
  } catch (error) {
    console.error('發生錯誤：', error);
    res.json('發生錯誤');
  }
});

// 個人首頁 獲得該使用者發布之文章
router.get('/homepageArticle/:uid', async (req, res) => {
  const uid = req.params.uid;

  const [userIDResult] = await db.execute(
    'SELECT * FROM `user` WHERE `uid` = ? AND `valid` = 1',
    [uid]
  );
  let userID;
  if (userIDResult) {
    userID = userIDResult[0].id;
  }
  try {
    const [articleData] = await db.execute(
      'SELECT article.*, article_category.name AS category_name,article_comment.likes AS comment_likes, user.name AS user_name, user.img AS user_img, article_user.nickname AS article_author_name, article_user.img AS article_author_img FROM article JOIN article_category ON article.category_id = article_category.id LEFT JOIN article_comment ON article.id = article_comment.article_id LEFT JOIN user ON article_comment.user_id = user.id LEFT JOIN user AS article_user ON article.user_id = article_user.id  WHERE article.user_id = ? ORDER BY article.id',
      [userID]
    );
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
  const id = req.params.id;

  const [userIDResult] = await db.execute(
    'SELECT * FROM `user` WHERE `id` = ? AND `valid` = 1',
    [id]
  );
  let userID;
  if (userIDResult) {
    userID = userIDResult[0].id;
  }
  try {
    const [articleData] = await db.execute(
      'SELECT article.*, article_category.name AS category_name,article_comment.likes AS comment_likes, user.name AS user_name, user.img AS user_img, article_user.nickname AS article_author_name, article_user.img AS article_author_img FROM article JOIN article_category ON article.category_id = article_category.id LEFT JOIN article_comment ON article.id = article_comment.article_id LEFT JOIN user ON article_comment.user_id = user.id LEFT JOIN user AS article_user ON article.user_id = article_user.id  WHERE article.user_id = ? ORDER BY article.id',
      [userID]
    );
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
  const id = req.params.id;

  const [singerUser] = await db.execute(
    'SELECT u.id, uid, u.name , email, nickname, phone, birthday, postcode, country, township, address, genre_like, play_instrument , info, gender , privacy, google_uid, j.state AS my_jamState, j.name AS my_jamname, my_jam , photo_url, my_lesson, img FROM `user` u LEFT JOIN `jam` j ON CONVERT(j.juid USING utf8mb4) = CONVERT(u.my_jam USING utf8mb4) WHERE u.id = ? AND u.valid = 1',
    [id]
  );

  const resUser = singerUser[0];
  return res.json(resUser);
});

// GET - 得到單筆會員資料 全部資料版本含密碼
router.get('/profile/:id', checkToken, async function (req, res) {
  const id = parseInt(req.params.id);
  const resUser = await prisma.user.findFirst({
    where: { id, valid: 1 },
  });
  return res.json(resUser);
});

//會員更新資訊
router.post('/editProfile/:id', checkToken, async function (req, res) {
  const id = parseInt(req.params.id);
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
router.post('/order/:id', async function (req, res) {
  const id = req.params.id;

  const [userUIDResult] = await db.execute(
    'SELECT `uid` FROM `user` WHERE `id` = ? AND `valid` = 1',
    [id]
  );
  let UID;
  if (userUIDResult) {
    UID = userUIDResult[0].uid;
  }

  const [orderResult] = await db.execute(
    `SELECT * FROM order_total WHERE user_id = ?;`,
    [UID]
  );

  const productResult = [];

  if (orderResult.length > 0) {
    for (const order of orderResult) {
      const orderId = order.ouid;

      const [result] = await db.execute(
        'SELECT  p.* , oi.* , ot.* FROM `order_item` oi LEFT JOIN `product` p ON CONVERT(p.id USING utf8mb4) = CONVERT(oi.product_id USING utf8mb4) LEFT JOIN `order_total` ot ON CONVERT(ot.ouid USING utf8mb4) = CONVERT(oi.ouid USING utf8mb4) WHERE oi.ouid = ?;',
        [orderId]
      );
      if (result.length > 0) {
        productResult.push(result);
      }
    }
  }

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

//檢查token 當作中介使用
function checkToken(req, res, next) {
  let token = req.get('Authorization');

  if (token && token.indexOf('Bearer ') === 0) {
    token = token.slice(7);
    jwt.verify(token, accessTokenSecret, (err, decoded) => {
      if (err) {
        const message =
          err.name === 'TokenExpiredError'
            ? '登入已逾時，請重新整理頁面。'
            : '登入驗證失效，請重新登入。';
        return res
          .status(401)
          .json({ status: 'error', message, code: err.name });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.status(401).json({
      status: 'error',
      message: '無登入驗證資料，請重新登入。',
      code: 'NO_TOKEN',
    });
  }
}

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
