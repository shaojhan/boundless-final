import express from 'express';
import prisma from '#configs/prisma.js';
import { fetchArticles, flattenArticleList } from '../lib/article-flatten.js';
//上傳檔案
import { rename } from 'fs/promises';
import { dirname, resolve, extname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(dirname(fileURLToPath(import.meta.url)));
import multer from 'multer';
const upload = multer({ dest: resolve(__dirname, 'public') });

const router = express.Router();

// 文章列表
router.get('/', async (_req, res) => {
  try {
    const articles = await fetchArticles();
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

// comments 評論分享
router.get('/comments', async (_req, res) => {
  try {
    const articles = await fetchArticles({ categoryId: 1 });
    const articleData = flattenArticleList(articles, false);
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
router.get('/sharing', async (_req, res) => {
  try {
    const articles = await fetchArticles({ categoryId: 2 });
    const articleData = flattenArticleList(articles, false);
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
  const article = await prisma.article
    .findFirst({
      where: { auid },
      include: {
        category: true,
        comments: {
          include: { commenter: { select: { name: true, img: true } } },
        },
      },
    })
    .catch(() => undefined);

  if (!article) {
    return res.status(400).send('发生错误');
  }

  const { category, comments, ...articleFields } = article;
  const base = { ...articleFields, category_name: category.name };

  if (comments.length === 0) {
    return res.status(200).json([
      {
        ...base,
        comment_content: null,
        comment_created_time: null,
        comment_likes: null,
        user_name: null,
        user_img: null,
      },
    ]);
  }

  const data = comments.map((c) => ({
    ...base,
    comment_content: c.content,
    comment_created_time: c.created_time,
    comment_likes: c.likes,
    user_name: c.commenter.name,
    user_img: c.commenter.img,
  }));

  res.status(200).json(data);
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
  const auid = req.params.auid as string;
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
      Code += characters.charAt(randomIndex);
    }
  } while (createdCodes.includes(Code));

  createdCodes.push(Code);
  createCodes += Code;
  return createCodes;
}

export default router;
