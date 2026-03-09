import transporter from '#configs/mail.js';
import type { ICartRepository } from '../../repository/commerce/ICartRepository.js';
import type {
  CartEntry,
  OrderInput,
  PriceResult,
} from '../../domain/commerce/Cart.js';

function generateOuid(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export class CartService {
  constructor(private readonly repo: ICartRepository) {}

  // ── Price calculation (business logic) ──────────────────────────────────────

  async calcPrice(
    cartEntries: CartEntry[],
    userId: number,
    lessonCUID: string | null,
    instrumentCUID: string | null
  ): Promise<PriceResult> {
    const ids = cartEntries.map((e) => e.id);
    const products = await this.repo.findProductPrices(ids);
    const productMap = new Map(products.map((p) => [p.id, p]));

    let lessonTotal = 0;
    let instrumentTotal = 0;

    for (const entry of cartEntries) {
      const product = productMap.get(entry.id);
      if (!product) continue;
      const qty = Math.trunc(Number(entry.qty));
      if (!Number.isFinite(qty) || qty < 1) {
        throw Object.assign(new Error(`商品數量不合法：product ${entry.id}`), { statusCode: 400 });
      }
      if (product.type === 2) {
        lessonTotal += product.price;
      } else {
        instrumentTotal += product.price * qty;
      }
    }

    const lessonDiscount = await this.calcDiscount(userId, lessonCUID, lessonTotal);
    const instrumentDiscount = await this.calcDiscount(userId, instrumentCUID, instrumentTotal);

    const totalPrice = lessonTotal + instrumentTotal;
    const totalDiscount = lessonDiscount + instrumentDiscount;
    return {
      lessonTotal,
      instrumentTotal,
      lessonDiscount,
      instrumentDiscount,
      totalPrice,
      totalDiscount,
      finalPayment: totalPrice - totalDiscount,
    };
  }

  private async calcDiscount(
    userId: number,
    cuid: string | null,
    subtotal: number
  ): Promise<number> {
    if (!cuid || cuid === 'null' || cuid === 'undefined') return 0;
    const templateId = parseInt(cuid);
    if (isNaN(templateId)) return 0;

    const coupon = await this.repo.findValidCoupon(userId, templateId);
    if (!coupon) return 0;

    const template = await this.repo.findCouponTemplate(templateId);
    if (!template) return 0;

    if (template.requirement !== null && subtotal < template.requirement) return 0;

    const discount = template.discount;
    if (template.type === 1) {
      return Math.min(discount, subtotal);
    } else {
      return Math.round(subtotal * (1 - discount));
    }
  }

  // ── Order submission ─────────────────────────────────────────────────────────

  async submitOrder(orderInput: OrderInput): Promise<void> {
    const priceResult = await this.calcPrice(
      orderInput.cartEntries,
      orderInput.userId,
      orderInput.lessonCUID,
      orderInput.instrumentCUID
    );

    const ouid = generateOuid();
    await this.repo.createOrderTransaction(orderInput, priceResult, ouid);

    // Fire-and-forget order confirmation email
    void this.sendOrderEmail(orderInput, priceResult).catch((err) =>
      console.error('訂單確認信發送失敗:', err)
    );
  }

  private async sendOrderEmail(
    orderInput: OrderInput,
    priceResult: PriceResult
  ): Promise<void> {
    const user = await this.repo.findUserByUid(orderInput.userUid);
    if (!user?.email) return;

    const ids = orderInput.cartEntries.map((e) => e.id);
    const products = await this.repo.findProductsInfo(ids);
    const productMap = new Map(products.map((p) => [p.id, p]));

    const itemRows = orderInput.cartEntries
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

    const { address, postcode, country, township } = orderInput;
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
                <td style="padding:10px 12px;text-align:right;font-weight:bold;color:#124365;">$${priceResult.finalPayment.toLocaleString()}</td>
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
  }
}
