import express from 'express';
import prisma from '#configs/prisma.js';

const router = express.Router();

type ProductWithIncludes = Awaited<
  ReturnType<
    typeof prisma.product.findMany<{
      include: { reviews: true; teacher: true; lessonCategory: true };
    }>
  >
>[number];

function computeReviewStats(reviews: { stars: number }[]) {
  const review_count = reviews.length;
  const average_rating =
    review_count > 0
      ? reviews.reduce((acc, r) => acc + r.stars, 0) / review_count
      : null;
  return { review_count, average_rating };
}

function flattenLesson(p: ProductWithIncludes) {
  const { reviews, teacher, lessonCategory, ...rest } = p;
  return {
    ...rest,
    lesson_category_name: lessonCategory?.name ?? null,
    teacher_name: teacher?.name ?? null,
    teacher_img: teacher?.img ?? null,
    teacher_info: teacher?.info ?? null,
    ...computeReviewStats(reviews),
  };
}

router.get('/', async (req, res) => {
  try {
    const { priceLow, priceHigh } = req.query;
    const where: Parameters<typeof prisma.product.findMany>[0]['where'] = {
      type: 2,
    };

    if (priceLow && priceHigh) {
      where.price = { gte: Number(priceLow), lte: Number(priceHigh) };
    }

    const products = await prisma.product.findMany({
      where,
      include: { reviews: true, teacher: true, lessonCategory: true },
      orderBy: { id: 'asc' },
    });

    if (products.length === 0) {
      return res.status(404).json({ message: '沒有找到相應的資訊' });
    }

    res.status(200).json(products.map(flattenLesson));
  } catch (error) {
    console.error('發生錯誤：', error);
    res.status(500).json({ error: '發生錯誤' });
  }
});

//lesson_category
router.get('/categories', async (_req, res) => {
  try {
    const lessonCategories = await prisma.lessonCategory.findMany();
    res.status(200).json(lessonCategories);
  } catch (error) {
    console.error('發生錯誤：', error);
    res.status(500).json('Internal server error');
  }
});

//特定分類的資料
router.get('/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const where: Parameters<typeof prisma.product.findMany>[0]['where'] = {
      type: 2,
    };

    if (category !== '' && category !== '0') {
      where.lesson_category_id = Number(category);
    }

    const products = await prisma.product.findMany({
      where,
      include: { reviews: true, teacher: true, lessonCategory: true },
    });

    if (products.length === 0) {
      return res.status(404).send({ message: '没有找到相应的信息' });
    }

    res.status(200).json(products.map(flattenLesson));
  } catch (error) {
    console.error('发生错误：', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 獲得單筆課程資料＋review
router.get('/:id', async (req, res, _next) => {
  const luid = req.params.id;
  try {
    // 課程詳細資料
    const product = await prisma.product.findFirst({
      where: { puid: luid },
      include: { reviews: true, lessonCategory: true },
    });

    if (!product) {
      return res.status(404).send('沒有找到相應的資訊');
    }

    const { reviews, lessonCategory, ...rest } = product;
    const data = [
      {
        ...rest,
        lesson_category_name: lessonCategory?.name ?? null,
        ...computeReviewStats(reviews),
      },
    ];

    // 評論資料（含 user 資訊）
    const reviewRows = await prisma.productReview.findMany({
      where: { product_id: product.id },
      include: { user: true },
    });
    const product_review = reviewRows.map(({ user, ...review }) => ({
      ...review,
      ...user,
    }));

    // 你也可能喜歡（同分類、有評論、有老師）
    const youwilllike_raw = await prisma.product.findMany({
      where: {
        lesson_category_id: product.lesson_category_id ?? undefined,
        type: 2,
        reviews: { some: {} },
        teacher: { isNot: null },
      },
      include: { reviews: true, teacher: true },
    });
    const youwilllike = youwilllike_raw.map(({ reviews, teacher, ...p }) => ({
      ...p,
      teacher_name: teacher?.name ?? null,
      ...computeReviewStats(reviews),
    }));

    res.status(200).json({ data, product_review, youwilllike });
  } catch (error) {
    console.error('發生錯誤:', error);
    res.status(500).send('Internal server error');
  }
});

export default router;
