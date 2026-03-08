import express from 'express';
import prisma from '#configs/prisma.js';

const router = express.Router();

/* GET home page. */
router.get('/', async (req, res) => {
  const rows = await prisma.product.findMany({
    where: { lessonCategory: { isNot: null } },
    select: { img: true, puid: true, lessonCategory: { select: { name: true } } },
    orderBy: { sales: 'asc' },
    take: 4,
  });
  const data = rows.map((r) => ({
    img: r.img,
    puid: r.puid,
    lesson_category_name: r.lessonCategory!.name,
  }));
  if (data.length > 0) {
    res.json({ status: 'success', data });
  }
});

export default router;
