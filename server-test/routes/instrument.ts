import express from 'express';
import prisma from '#configs/prisma.js';

const router = express.Router();

type ProductWithCategory = Awaited<
  ReturnType<typeof prisma.product.findMany>
>[number] & { instrumentCategory: { id: number; parent_id: number | null; name: string } | null };

function flattenInstrument(p: ProductWithCategory) {
  const { instrumentCategory, ...rest } = p;
  return { ...rest, category_name: instrumentCategory?.name ?? null };
}

// 取得所有樂器資料
// instrument?page=1&order=ASC&brandSelect=1&priceLow=&priceHigh=&score=all&sales=false&keyword=
router.get('/', async (req, res, _next) => {
  try {
    const page = Number(req.query.page) || 1;
    const dataPerpage = 20;
    const skip = (page - 1) * dataPerpage;

    const where: Parameters<typeof prisma.product.findMany>[0]['where'] = { type: 1 };

    if (Object.keys(req.query).length !== 0) {
      const brandSelectRaw = parseInt(String(req.query.brandSelect));
      if (!isNaN(brandSelectRaw)) where.brand_id = brandSelectRaw;

      const priceLow = parseInt(String(req.query.priceLow));
      const priceHigh = parseInt(String(req.query.priceHigh));
      if (!isNaN(priceLow) || !isNaN(priceHigh)) {
        where.price = {};
        if (!isNaN(priceLow)) where.price.gte = priceLow;
        if (!isNaN(priceHigh)) where.price.lte = priceHigh;
      }

      if (req.query.promotion === 'true') where.discount_state = 1;
    }

    const [total, instruments] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: { instrumentCategory: true },
        skip,
        take: dataPerpage,
      }),
    ]);

    const pageTotal = Math.ceil(total / dataPerpage);
    const finalData = (instruments as ProductWithCategory[]).map(flattenInstrument);

    res.status(200).json({ instrument: finalData, pageTotal, page });
  } catch (error) {
    console.error(error);
    res.status(400).send('發生錯誤');
  }
});

//instrument_category
router.get('/categories', async (req, res) => {
  try {
    const productCategory = await prisma.instrumentCategory.findMany({
      select: { id: true, parent_id: true, name: true },
    });
    res.json(productCategory);
  } catch (error) {
    console.error('發生錯誤：', error);
    res.json('發生錯誤');
  }
});

//特定分類的資料
router.get('/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const where: Parameters<typeof prisma.product.findMany>[0]['where'] = { type: 1 };

    if (category !== '' && category !== '0') {
      where.instrument_category_id = Number(category);
    }

    const instruments = await prisma.product.findMany({
      where,
      include: { instrumentCategory: true },
    });

    if (instruments.length > 0) {
      res.status(200).json((instruments as ProductWithCategory[]).map(flattenInstrument));
    } else {
      res.status(404).send({ message: '沒有找到相應的資訊' });
    }
  } catch (error) {
    console.error('發生錯誤：', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//獲得單筆樂器資料跟評論
router.get('/:id', async (req, res, _next) => {
  const puid = req.params.id;
  try {
    // 商品詳細資料
    const product = await prisma.product.findFirst({
      where: { puid },
      include: { instrumentCategory: true },
    });

    if (!product) {
      return res.status(400).send('發生錯誤');
    }

    const data = flattenInstrument(product as ProductWithCategory);

    // 評論資料
    const reviews = await prisma.productReview.findMany({
      where: { product_id: product.id },
      include: {
        user: { select: { uid: true, name: true, nickname: true, img: true } },
      },
    });
    const reviewData = reviews.map(({ user, ...review }) => ({
      ...review,
      uid: user.uid,
      name: user.name,
      nickname: user.nickname,
      img: user.img,
    }));

    // 你可能也喜歡
    const youmaylike = await prisma.product.findMany({
      where: {
        instrument_category_id: product.instrument_category_id ?? undefined,
        type: 1,
      },
      include: { instrumentCategory: true },
      take: 5,
    });

    res.status(200).json({
      data,
      reviewData,
      youmaylike: (youmaylike as ProductWithCategory[]).map(flattenInstrument),
    });
  } catch {
    res.status(400).send('發生錯誤');
  }
});

export default router;
