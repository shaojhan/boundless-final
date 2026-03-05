import express from 'express';
import prisma from '#configs/prisma.js';
import multer from 'multer';

const router = express.Router();
const upload = multer();

// ── Shared price calculation logic ──────────────────────────────────────────

interface CartEntry {
  id: number;
  qty: number;
}

interface ProductRow {
  id: number;
  price: number;
  type: number; // 1=instrument, 2=lesson
}


async function calcServerPrice(
  cartEntries: CartEntry[],
  uid: string,
  lessonCUID: string | null,
  instrumentCUID: string | null,
) {
  // 1. Fetch real prices from DB for all product IDs
  const productIds = cartEntries.map((v) => v.id);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, price: true, type: true },
  });

  const productMap = new Map<number, ProductRow>(
    products.map((p) => [p.id, p as ProductRow]),
  );

  // 2. Calculate totals by type
  let lessonTotal = 0;
  let instrumentTotal = 0;

  for (const entry of cartEntries) {
    const product = productMap.get(entry.id);
    if (!product) continue;
    if (product.type === 2) {
      // lesson: qty is always 1
      lessonTotal += product.price;
    } else {
      // instrument
      instrumentTotal += product.price * entry.qty;
    }
  }

  // 3. Calculate discounts (validate coupon belongs to user and is valid)
  const calcDiscount = async (
    cuid: string | null,
    subtotal: number,
  ): Promise<number> => {
    if (!cuid || cuid === 'null' || cuid === 'undefined') return 0;
    const templateId = parseInt(cuid);
    if (isNaN(templateId)) return 0;

    // Check user owns a valid coupon for this template
    const coupon = await prisma.coupon.findFirst({
      where: {
        coupon_template_id: templateId,
        user_id: parseInt(uid),
        valid: 1,
      },
    });
    if (!coupon) return 0;

    const template = await prisma.couponTemplate.findFirst({
      where: { id: templateId, valid: 1 },
    });
    if (!template) return 0;

    // Validate minimum purchase requirement
    if (template.requirement !== null && subtotal < template.requirement) return 0;

    const discount = Number(template.discount);
    if (template.type === 1) {
      // Fixed amount — cap at subtotal
      return Math.min(discount, subtotal);
    } else {
      // Percentage (e.g. 0.9 means 90% of price → 10% off)
      return Math.round(subtotal * (1 - discount));
    }
  };

  const lessonDiscount = await calcDiscount(lessonCUID, lessonTotal);
  const instrumentDiscount = await calcDiscount(instrumentCUID, instrumentTotal);

  const totalPrice = lessonTotal + instrumentTotal;
  const totalDiscount = lessonDiscount + instrumentDiscount;
  const finalPayment = totalPrice - totalDiscount;

  return { lessonTotal, instrumentTotal, lessonDiscount, instrumentDiscount, totalPrice, totalDiscount, finalPayment };
}

// ── POST /cart/calculate — preview endpoint ──────────────────────────────────

router.post('/calculate', upload.none(), async (req, res) => {
  const { cartdata, uid, lessonCUID, instrumentCUID } = req.body as {
    cartdata: string;
    uid: string;
    lessonCUID?: string;
    instrumentCUID?: string;
  };

  if (!cartdata || !uid) {
    res.status(400).json({ status: 'error', message: 'cartdata and uid are required' });
    return;
  }

  try {
    const cartEntries: CartEntry[] = JSON.parse(cartdata);
    const result = await calcServerPrice(cartEntries, uid, lessonCUID ?? null, instrumentCUID ?? null);
    res.status(200).json({ status: 'success', ...result });
  } catch (error) {
    res.status(500).json({ status: 'error', error });
  }
});

// ── POST /cart/form — order submission ───────────────────────────────────────

router.post('/form', upload.none(), async (req, res) => {
  const ouid = generateOuid();

  const {
    phone,
    country,
    township,
    postcode,
    address,
    transportationstate,
    cartdata,
    uid,
    LessonCUID,
    InstrumentCUID,
  } = req.body as {
    phone: string;
    country: string;
    township: string;
    postcode: string;
    address: string;
    transportationstate: string;
    cartdata: string;
    uid: string;
    LessonCUID?: string;
    InstrumentCUID?: string;
  };

  const cartEntries: CartEntry[] = JSON.parse(cartdata);

  try {
    // Server-side price calculation — never trust client-sent amounts
    const { finalPayment, totalDiscount } = await calcServerPrice(
      cartEntries,
      uid,
      LessonCUID ?? null,
      InstrumentCUID ?? null,
    );

    const orderTotalRecord = await prisma.orderTotal.create({
      data: {
        user_id: uid,
        payment: finalPayment,
        transportation_state: transportationstate,
        phone,
        discount: totalDiscount,
        postcode: parseInt(postcode),
        country: township, // preserving original field mapping
        township: country, // preserving original field mapping
        address,
        created_time: new Date(),
        ouid,
      },
    });

    await prisma.orderItem.createMany({
      data: cartEntries.map((v) => ({
        order_id: orderTotalRecord.id,
        product_id: v.id,
        quantity: v.qty,
        ouid,
      })),
    });

    // Invalidate used coupons (scoped to the user to avoid affecting others)
    const userId = parseInt(uid);
    if (LessonCUID && LessonCUID !== 'null') {
      await prisma.coupon.updateMany({
        where: { coupon_template_id: parseInt(LessonCUID), user_id: userId },
        data: { valid: 0 },
      });
    }
    if (InstrumentCUID && InstrumentCUID !== 'null') {
      await prisma.coupon.updateMany({
        where: { coupon_template_id: parseInt(InstrumentCUID), user_id: userId },
        data: { valid: 0 },
      });
    }

    res.status(200).json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ status: 'error', error });
  }
});

function generateOuid() {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const codeLength = 12;
  const createdCodes: string[] = [];

  let Code = '';
  do {
    Code = '';
    for (let i = 0; i < codeLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      Code += characters.charAt(randomIndex);
    }
  } while (createdCodes.includes(Code));

  createdCodes.push(Code);
  return Code;
}

export default router;
