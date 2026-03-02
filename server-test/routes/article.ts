import express from 'express';
import db from '#db';
import prisma from '#configs/prisma.js';
//上傳檔案
import { rename } from 'fs/promises';
import { dirname, resolve, extname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(dirname(fileURLToPath(import.meta.url)));
import multer from 'multer';
const upload = multer({ dest: resolve(__dirname, 'public') });

const router = express.Router();

// 文章列表
router.get('/', async (req, res) => {
  try {
    const [articleData] = await db.execute(
      'SELECT article.*, article_category.name AS category_name,article_comment.likes AS comment_likes, user.name AS user_name, user.img AS user_img, article_user.nickname AS article_author_name, article_user.img AS article_author_img FROM article JOIN article_category ON article.category_id = article_category.id LEFT JOIN article_comment ON article.id = article_comment.article_id LEFT JOIN user ON article_comment.user_id = user.id LEFT JOIN user AS article_user ON article.user_id = article_user.id ORDER BY article.id'
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

// comments 評論分享
router.get('/comments', async (req, res) => {
  try {
    const [articleData] = await db.execute(
      'SELECT article.*, article_category.name AS category_name,article_comment.likes AS comment_likes, user.name AS user_name, user.img AS user_img, article_user.name AS article_author_name, article_user.img AS article_author_img FROM article JOIN article_category ON article.category_id = article_category.id LEFT JOIN article_comment ON article.id = article_comment.article_id LEFT JOIN user ON article_comment.user_id = user.id LEFT JOIN user AS article_user ON article.user_id = article_user.id WHERE article.category_id = 1 ORDER BY article.id'
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

// Tech
router.get('/sharing', async (req, res) => {
  try {
    const [articleData] = await db.execute(
      'SELECT article.*, article_category.name AS category_name,article_comment.likes AS comment_likes, user.name AS user_name, user.img AS user_img, article_user.name AS article_author_name, article_user.img AS article_author_img FROM article JOIN article_category ON article.category_id = article_category.id LEFT JOIN article_comment ON article.id = article_comment.article_id LEFT JOIN user ON article_comment.user_id = user.id LEFT JOIN user AS article_user ON article.user_id = article_user.id WHERE article.category_id = 2 ORDER BY article.id'
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

router.get('/:auid', async (req, res, _next) => {
  const auid = req.params.auid;
  // 使用正确的参数名称
  const [data] = await db
    .execute(
      'SELECT article.*, article_category.name AS category_name, article_comment.content AS comment_content,article_comment.created_time AS comment_created_time,article_comment.likes AS comment_likes, user.name AS user_name, user.img AS user_img FROM article JOIN article_category ON article.category_id = article_category.id LEFT JOIN article_comment ON article.id = article_comment.article_id LEFT JOIN user ON article_comment.user_id = user.id WHERE article.auid = ?',
      [auid]
    )
    .catch(() => {
      return undefined;
    });
  if (data) {
    res.status(200).json(data);
  } else {
    res.status(400).send('发生错误');
  }
});

router.post('/upload', upload.single('myFile'), async (req, res) => {
  const newCover = Date.now() + extname(req.file.originalname);
  await rename(
    req.file.path,
    resolve(__dirname, 'public/article', newCover)
  ).catch((error) => console.error('更名失敗' + error));
  const { title, content, category_id, user_id } = req.body;
  const auid = generateUid();
  try {
    await prisma.article.create({
      data: {
        auid,
        title,
        content,
        category_id: parseInt(category_id),
        img: newCover,
        user_id: parseInt(user_id),
        state: 0,
      },
    });
    res.status(200).json({ status: 'success', auid });
  } catch (error) {
    res.status(409).json({ status: 'error', error });
  }
});

router.put('/edit/:auid', upload.none(), async (req, res) => {
  const { content } = req.body;
  const auid = req.params.auid;
  try {
    await prisma.article.updateMany({
      where: { auid },
      data: { content },
    });
    res.status(200).json({ status: 'success', auid });
  } catch (error) {
    res.status(500).json({ status: 'error', error });
  }
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
      //   回傳characters當中的隨機一值
      Code += characters.charAt(randomIndex);
    }
  } while (createdCodes.includes(Code));

  createdCodes.push(Code);
  createCodes += Code;
  return createCodes;
}

export default router;
