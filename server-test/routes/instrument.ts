import express from 'express';
import db from '#db';
import prisma from '#configs/prisma.js';

const router = express.Router();

// 取得所有樂器資料
// instrument?page=1&order=ASC&brandSelect=1&priceLow=&priceHigh=&score=all&sales=false&keyword=
router.get('/', async (req, res, _next) => {
  // 取得所有樂器分類資料
  await db.execute(
    'SELECT `id`, `parent_id`, `name` FROM `instrument_category`'
  );

  const [instrument] = await db
    .execute(
      `SELECT product.*, instrument_category.name AS category_name 
  FROM product 
  JOIN instrument_category 
  ON product.instrument_category_id = instrument_category.id 
  WHERE type = 1`
    )
    .catch((error) => {
      console.error(error);
      return undefined;
    });

  let page = Number(req.query.page) || 1; // 目前頁碼
  let dataPerpage = 20; // 每頁 20 筆
  let offset = (page - 1) * dataPerpage; // 取得下一批資料
  let pageTotal = Math.ceil(instrument.length / dataPerpage); // 計算總頁數
  let pageString = ' LIMIT ' + offset + ',' + dataPerpage;

  let finalData;
  if (Object.keys(req.query).length !== 0) {
    // 所有篩選條件，預設條件: type=1(樂器)
    let sqlString =
      'SELECT product.*, instrument_category.name AS category_name FROM `product` JOIN instrument_category ON product.instrument_category_id = instrument_category.id WHERE `type` = 1';
    const brandSelect =
      req.query.brandSelect !== ''
        ? ' AND `brand_id` = ' + parseInt(String(req.query.brandSelect))
        : '';

    const priceLow =
      req.query.priceLow != '' && !isNaN(parseInt(String(req.query.priceLow)))
        ? ' AND `price` >= ' + parseInt(String(req.query.priceLow))
        : '';

    const priceHigh =
      req.query.priceHigh != '' && !isNaN(parseInt(String(req.query.priceHigh)))
        ? ' AND `price` <= ' + parseInt(String(req.query.priceHigh))
        : '';

    const score = '';
    // req.query.score !== 'all'
    // ? ' AND `score` = ' + parseInt(req.query.score)
    // : '';

    const promotion =
      req.query.promotion !== 'true' ? '' : ' AND `discount_state` = 1';

    sqlString += brandSelect + priceLow + priceHigh + score + promotion;
    const [instrument2] = await db.execute(sqlString).catch(() => {
      return [];
    });
    page = Number(req.query.page) || 1; // 目前頁碼
    dataPerpage = 20; // 每頁 20 筆
    offset = (page - 1) * dataPerpage; // 取得下一批資料
    if (instrument2) {
      pageTotal = Math.ceil(instrument2.length / dataPerpage); // 計算總頁數
    }
    pageString = ' LIMIT ' + offset + ',' + dataPerpage;

    sqlString += pageString;
    const [data] = await db.execute(sqlString).catch(() => {
      return [];
    });
    finalData = data;
  } else {
    // 沒有篩選條件
    const [data] = await db
      .execute(
        'SELECT product.*, instrument_category.name AS category_name FROM `product` JOIN instrument_category ON product.instrument_category_id = instrument_category.id  WHERE `type` = 1 LIMIT 0, 20'
      )
      .catch(() => {
        return undefined;
      });

    finalData = data;
  }
  if (finalData) {
    res.status(200).json({
      instrument: finalData,
      pageTotal,
      page,
    });
  } else {
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
    let query =
      'SELECT product.*, instrument_category.name AS category_name FROM `product` JOIN instrument_category ON product.instrument_category_id = instrument_category.id WHERE product.type = 1';
    let queryParams = [];

    // 如果 category 不是空字串或'0'，則增加類別過濾條件
    if (category !== '' && category !== '0') {
      query += ' AND product.instrument_category_id = ?';
      queryParams = [category];
    }

    const [instrument] = await db.execute(query, queryParams);

    if (instrument.length > 0) {
      res.status(200).json(instrument);
    } else {
      res.status(404).send({ message: '沒有找到相應的資訊' });
    }
  } catch (error) {
    console.error('發生錯誤：', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 檢索屬於特定 puid 的產品，並且通過左連接獲取與之相關聯的產品評論
// 檢索屬於特定 puid 的產品，並且通過左連接獲取與之相關聯的產品評論
//  router.get("/:id", async (req, res, next) => {
//   let puid = req.params.id;
//   let [data] = await db.execute(
//     "SELECT p.*, pr.*, ic.name AS category_name " +
//     "FROM `product` AS p " +
//     "LEFT JOIN `product_review` AS pr ON p.id = pr.product_id " +
//     "LEFT JOIN `instrument_category` AS ic ON p.instrument_category_id = ic.id " +
//     "WHERE p.`puid` = ?",
//     [puid]
//   )
//   )
//    .catch(() => {
//     return undefined;
//   });

//   if (data) {
//     res.status(200).json(data);
//   } else {
//     res.status(400).send("發生錯誤");
//   }
// });

//獲得單筆樂器資料跟評論
router.get('/:id', async (req, res, _next) => {
  const puid = req.params.id;
  try {
    // 商品詳細資料
    // 商品詳細資料
    const [rows] = await db.execute(
      'SELECT p.*, ic.name AS category_name ' +
        'FROM `product` AS p ' +
        'LEFT JOIN `instrument_category` AS ic ON p.instrument_category_id = ic.id ' +
        'WHERE p.`puid` = ?',
      [puid]
    );
    const data = rows[0];

    const [reviewData] = await db.execute(
      'SELECT `product_review`.*, `user`.uid, `user`.name, `user`.nickname, `user`.img FROM `product_review` JOIN `user` ON `product_review`.user_id = `user`.id WHERE `product_review`.product_id = ?',
      [(data as Record<string, unknown>).id]
    );

    const [youmaylike] = await db.execute(
      'SELECT p.*, instrument_category.name AS category_name FROM `product` AS p ' +
        'JOIN `instrument_category` ' +
        'ON p.`instrument_category_id` = instrument_category.id WHERE instrument_category.id =  (SELECT `instrument_category_id` FROM `product` WHERE `puid` = ?) LIMIT 0,5',
      [puid]
    );

    if (data && youmaylike) {
      res.status(200).json({ data, reviewData, youmaylike });
    } else {
      res.status(400).send('發生錯誤');
    }
  } catch {
    res.status(400).send('發生錯誤');
  }
});

// function App() {
//   const [selectedBrand, setSelectedBrand] = useState(null)

//   // Input Filter
//   const [query, setQuery] = useState("")
//   const handleInputChange = event => {
//     setQuery(event.target.value)
//   }
// }
// }

export default router;
