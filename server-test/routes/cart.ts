import express from 'express';
import prisma from '#configs/prisma.js';
import multer from 'multer';

const router = express.Router();
const upload = multer();

router.post('/form', upload.none(), async (req, res) => {
  const ouid = generateOuid();

  const {
    phone,
    country,
    township,
    postcode,
    address,
    totaldiscount,
    payment,
    transportationstate,
    cartdata,
    uid,
    LessonCUID,
    InstrumentCUID,
  } = req.body;

  const newCartData: { id: number; qty: number }[] = JSON.parse(cartdata);

  try {
    const orderTotalRecord = await prisma.orderTotal.create({
      data: {
        user_id: uid,
        payment: parseInt(payment),
        transportation_state: transportationstate,
        phone,
        discount: parseInt(totaldiscount),
        postcode: parseInt(postcode),
        country: township, // preserving original field mapping
        township: country, // preserving original field mapping
        address,
        created_time: new Date(),
        ouid,
      },
    });

    await prisma.orderItem.createMany({
      data: newCartData.map((v) => ({
        order_id: orderTotalRecord.id,
        product_id: v.id,
        quantity: v.qty,
        ouid,
      })),
    });

    if (LessonCUID && LessonCUID !== 'null') {
      await prisma.coupon.updateMany({
        where: { coupon_template_id: parseInt(LessonCUID) },
        data: { valid: 0 },
      });
    }
    if (InstrumentCUID && InstrumentCUID !== 'null') {
      await prisma.coupon.updateMany({
        where: { coupon_template_id: parseInt(InstrumentCUID) },
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
