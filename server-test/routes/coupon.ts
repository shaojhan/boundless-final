import express from 'express';
import Coupon from '#controller/coupon.js';

const router = express.Router();

// #region????
// //取得coupon資料-升降冪：ID、價格/百分比、日期排序
// #endregion

// 處理 GET 請求，路徑為 /public/coupon/FindAll
router.get('/FindAll/:user_id', async (req, res) => {
  try {
    const param = req.params.user_id;
    // 創建 Coupon 控制器的實例
    const obj = new Coupon();
    // 呼叫 Coupon 控制器中的 FindAll 方法來查詢所有優惠券
    const result = await obj.FindAll(parseInt(param));
    // 將查詢結果以 JSON 格式返回給客戶端
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    // 如果發生錯誤，返回 500 狀態碼和錯誤訊息
    res.status(500).json(err.message);
  }
});

// create
router.post('/Create', async (req, res) => {
  try {
    const param = req.body;
    // 前端給後端1. user_id，  2. coupon_template_id
    // {
    //   user_id: "";
    //   coupon_template_id: "";
    // }

    const obj = new Coupon();
    obj.user_id = param.user_id;
    obj.coupon_template_id = param.coupon_template_id;

    const result = await obj.Create();

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

router.post('/Update', async (req, res) => {
  try {
    // 從請求的 body 中獲取 id 參數
    const param = req.body.id;
    const obj = new Coupon();
    // 設置 Coupon 控制器的實例的 id 屬性為從請求中獲取的 id
    obj.id = param;
    // 呼叫 Coupon 控制器中的 Update 方法來刪除指定的優惠券
    // @ts-expect-error — Coupon class inherits from Coupon_template which has Update()
    const result = await obj.Update();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 用折扣碼兌換優惠券
router.post('/Redeem', async (req, res) => {
  try {
    const { user_id, coupon_code } = req.body as {
      user_id: number;
      coupon_code: string;
    };
    if (!user_id || !coupon_code) {
      res.status(400).json({ success: false, message: '缺少必要參數' });
      return;
    }
    const obj = new Coupon();
    const result = await obj.Redeem(user_id, coupon_code.trim().toUpperCase());
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
});

// --- 計算折價結果 --- 購物車已套用coupon.json????

// router.post('/CalcDiscount', async (req, res) => {
//   try {
//     const param = req.body;
//     // {
//     //  template_id: 1, (我要折哪個模板),
//     //  data:
//     //   [
//     //     {
//     //       id: product_id,
//     //       qty: 1,
//     //     },
//     //   ]
//     // }
//     const obj = new Coupon();

//     res.status(200).json(discount);
//   } catch (err) {
//     res.status(500).json(err.message);
//   }
// });

// router.post('/CalcProduct')
// router.post('/CalcLesson');

export default router;
