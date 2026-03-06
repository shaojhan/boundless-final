import express from 'express';
import prisma from '#configs/prisma.js';
import transporter from '#configs/mail.js';
import { checkToken } from '../middleware/checkToken.js';

const router = express.Router();

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
  userId: number, // integer user.id from verified JWT — NOT client-supplied uid
  lessonCUID: string | null,
  instrumentCUID: string | null
) {
  // 1. Fetch real prices from DB for all product IDs
  const productIds = cartEntries.map((v) => v.id);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, price: true, type: true },
  });

  const productMap = new Map<number, ProductRow>(
    products.map((p) => [p.id, p as ProductRow])
  );

  // 2. Calculate totals by type; validate qty is a positive integer
  let lessonTotal = 0;
  let instrumentTotal = 0;

  for (const entry of cartEntries) {
    const product = productMap.get(entry.id);
    if (!product) continue;
    // Server-side qty validation: must be a positive integer
    const qty = Math.trunc(Number(entry.qty));
    if (!Number.isFinite(qty) || qty < 1) {
      throw Object.assign(new Error(`商品數量不合法：product ${entry.id}`), {
        statusCode: 400,
      });
    }
    if (product.type === 2) {
      // lesson: qty is always 1
      lessonTotal += product.price;
    } else {
      // instrument
      instrumentTotal += product.price * qty;
    }
  }

  // 3. Calculate discounts (validate coupon belongs to user and is valid)
  const calcDiscount = async (
    cuid: string | null,
    subtotal: number
  ): Promise<number> => {
    if (!cuid || cuid === 'null' || cuid === 'undefined') return 0;
    const templateId = parseInt(cuid);
    if (isNaN(templateId)) return 0;

    // Check user owns a valid coupon for this template (uses integer userId — fixes uid/id bug)
    const coupon = await prisma.coupon.findFirst({
      where: {
        coupon_template_id: templateId,
        user_id: userId,
        valid: 1,
      },
    });
    if (!coupon) return 0;

    const template = await prisma.couponTemplate.findFirst({
      where: { id: templateId, valid: 1 },
    });
    if (!template) return 0;

    // Validate minimum purchase requirement
    if (template.requirement !== null && subtotal < template.requirement)
      return 0;

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
  const instrumentDiscount = await calcDiscount(
    instrumentCUID,
    instrumentTotal
  );

  const totalPrice = lessonTotal + instrumentTotal;
  const totalDiscount = lessonDiscount + instrumentDiscount;
  const finalPayment = totalPrice - totalDiscount;

  return {
    lessonTotal,
    instrumentTotal,
    lessonDiscount,
    instrumentDiscount,
    totalPrice,
    totalDiscount,
    finalPayment,
  };
}

// ── POST /cart/calculate — preview endpoint ──────────────────────────────────

router.post('/calculate', checkToken, async (req, res) => {
  const { cartdata, lessonCUID, instrumentCUID } = req.body as {
    cartdata: string;
    lessonCUID?: string;
    instrumentCUID?: string;
  };

  if (!cartdata) {
    res.status(400).json({ status: 'error', message: 'cartdata is required' });
    return;
  }

  // Use integer id from verified JWT — never trust client-supplied uid
  const userId = req.decoded.id;

  try {
    const cartEntries: CartEntry[] = JSON.parse(cartdata);
    const result = await calcServerPrice(
      cartEntries,
      userId,
      lessonCUID ?? null,
      instrumentCUID ?? null
    );
    res.status(200).json({ status: 'success', ...result });
  } catch (error: unknown) {
    const statusCode = (error as { statusCode?: number }).statusCode ?? 500;
    res
      .status(statusCode)
      .json({ status: 'error', message: (error as Error).message });
  }
});

// ── POST /cart/form — order submission ───────────────────────────────────────

router.post('/form', checkToken, async (req, res) => {
  const ouid = generateOuid();

  const {
    phone,
    country,
    township,
    postcode,
    address,
    transportationstate,
    cartdata,
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
    LessonCUID?: string;
    InstrumentCUID?: string;
  };

  // Use identity from verified JWT — never trust client-supplied uid
  const userId = req.decoded.id; // integer id, for coupon/DB lookups
  const userUid = req.decoded.uid; // string uid, for order_total.user_id

  const cartEntries: CartEntry[] = JSON.parse(cartdata);

  try {
    // Server-side price calculation — never trust client-sent amounts
    const { finalPayment, totalDiscount } = await calcServerPrice(
      cartEntries,
      userId,
      LessonCUID ?? null,
      InstrumentCUID ?? null
    );

    // All writes in one atomic transaction — prevents partial order state on failure
    await prisma.$transaction(async (tx) => {
      const orderTotalRecord = await tx.orderTotal.create({
        data: {
          user_id: userUid,
          payment: finalPayment,
          transportation_state: transportationstate,
          phone,
          discount: totalDiscount,
          postcode: parseInt(postcode),
          country,
          township,
          address,
          created_time: new Date(),
          ouid,
        },
      });

      await tx.orderItem.createMany({
        data: cartEntries.map((v) => ({
          order_id: orderTotalRecord.id,
          product_id: v.id,
          quantity: Math.trunc(Number(v.qty)),
          ouid,
        })),
      });

      // Invalidate used coupons inside the transaction
      if (LessonCUID && LessonCUID !== 'null') {
        await tx.coupon.updateMany({
          where: { coupon_template_id: parseInt(LessonCUID), user_id: userId },
          data: { valid: 0 },
        });
      }
      if (InstrumentCUID && InstrumentCUID !== 'null') {
        await tx.coupon.updateMany({
          where: {
            coupon_template_id: parseInt(InstrumentCUID),
            user_id: userId,
          },
          data: { valid: 0 },
        });
      }
    });

    res.status(200).json({ status: 'success' });

    // 訂單確認信（fire-and-forget，不阻塞回應）
    void (async () => {
      try {
        const user = await prisma.user.findFirst({
          where: { uid: userUid },
          select: { email: true, nickname: true },
        });
        if (!user?.email) return;

        const productIds = cartEntries.map((v) => v.id);
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true, price: true },
        });
        const productMap = new Map(products.map((p) => [p.id, p]));

        const itemRows = cartEntries
          .map((entry) => {
            const p = productMap.get(entry.id);
            const name = p?.name ?? '商品';
            const unitPrice = Number(p?.price ?? 0);
            const subtotal = unitPrice * Math.trunc(Number(entry.qty));
            return `
              <tr>
                <td style="padding:8px 12px;border-bottom:1px solid #eee;">${name}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${entry.qty}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">$${unitPrice.toLocaleString()}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">$${subtotal.toLocaleString()}</td>
              </tr>`;
          })
          .join('');

        const orderDate = new Date().toLocaleDateString('zh-TW');
        const html = `
          <div style="font-family:'Noto Sans TC',sans-serif;max-width:600px;margin:0 auto;color:#1d1d1d;">
            <div style="background:#124365;padding:24px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:24px;">Boundless</h1>
            </div>
            <div style="padding:24px;">
              <h2 style="color:#124365;">訂單確認通知</h2>
              <p>親愛的 ${user.nickname ?? user.email} 您好，</p>
              <p>感謝您的購買！您的訂單已成功建立，以下是您的訂單明細：</p>
              <table style="width:100%;border-collapse:collapse;margin:16px 0;">
                <thead>
                  <tr style="background:#f0f5fa;">
                    <th style="padding:10px 12px;text-align:left;color:#124365;">商品名稱</th>
                    <th style="padding:10px 12px;text-align:center;color:#124365;">數量</th>
                    <th style="padding:10px 12px;text-align:right;color:#124365;">單價</th>
                    <th style="padding:10px 12px;text-align:right;color:#124365;">小計</th>
                  </tr>
                </thead>
                <tbody>${itemRows}</tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="padding:10px 12px;text-align:right;font-weight:bold;color:#124365;">合計</td>
                    <td style="padding:10px 12px;text-align:right;font-weight:bold;color:#124365;">$${finalPayment.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
              <div style="background:#f8fafc;border-radius:8px;padding:16px;margin-top:16px;">
                <p style="margin:4px 0;"><strong>訂單日期：</strong>${orderDate}</p>
                <p style="margin:4px 0;"><strong>付款方式：</strong>信用卡</p>
                ${address ? `<p style="margin:4px 0;"><strong>配送地址：</strong>${postcode} ${country}${township}${address}</p>` : ''}
              </div>
              <p style="margin-top:24px;">如有任何問題，請聯繫 Boundless 客服團隊。</p>
              <p style="color:#888;font-size:12px;">此為系統自動發送信件，請勿直接回覆。</p>
            </div>
            <div style="background:#f0f5fa;padding:16px;text-align:center;color:#888;font-size:12px;">
              © Boundless 音樂平台
            </div>
          </div>`;

        await transporter.sendMail({
          from: `"Boundless" <${process.env.SMTP_TO_EMAIL}>`,
          to: user.email,
          subject: '【Boundless】訂單確認通知',
          html,
        });
      } catch (err) {
        console.error('訂單確認信發送失敗:', err);
      }
    })();
  } catch (error: unknown) {
    const statusCode = (error as { statusCode?: number }).statusCode ?? 500;
    res
      .status(statusCode)
      .json({ status: 'error', message: (error as Error).message });
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
