# Boundless 後端

音樂人社群平台的後端專案，提供 RESTful API，涵蓋樂器商城、線上課程、組樂隊、音樂文章及金流整合。

## 技術棧

- **框架**：Express.js
- **ORM**：Prisma 7（MariaDB adapter）
- **資料庫**：MySQL / MariaDB
- **認證**：JWT、Google OAuth
- **金流**：綠界 ECPay
- **其他**：Nodemailer（寄信）、OTPAuth（OTP 驗證）、Multer（檔案上傳）、Formidable

## 專案結構

```
server-test/
├── routes/             # API 路由
│   ├── index.js
│   ├── user.js         # 會員管理
│   ├── instrument.js   # 樂器商城
│   ├── lesson.js       # 線上課程
│   ├── jam.js          # 組樂隊
│   ├── article.js      # 音樂文章
│   ├── cart.js         # 購物車
│   ├── coupon.js       # 優惠券
│   ├── ecpay-order.js  # 綠界訂單
│   ├── ecpay-users.js  # 綠界會員
│   ├── google-login.js # Google 登入
│   └── reset-password.js
├── controller/         # 業務邏輯
├── prisma/
│   ├── schema.prisma   # 資料庫 schema
│   └── migrations/     # 資料庫 migration
├── configs/
│   └── prisma.js       # Prisma Client 設定
├── db-helpers/         # 資料庫工具函式
├── cli/
│   └── db-init.js      # 資料庫 seed 腳本
├── generated/          # Prisma 產生的 Client
├── db.js               # 資料庫連線封裝
├── app.js
└── prisma.config.ts
```

## 環境設定

在 `server-test/` 根目錄建立 `.env`：

```env
DATABASE_URL="mysql://USER:PASSWORD@127.0.0.1:3306/boundless_final"

PORT=3005
NODE_ENV=development
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=boundless_final
DB_USERNAME=USER
DB_PASSWORD=PASSWORD

ACCESS_TOKEN_SECRET=your_jwt_secret

SMTP_TO_EMAIL=your_email@gmail.com
SMTP_TO_PASSWORD=your_app_password
OTP_SECRET=your_otp_secret
```

## 啟動方式

```bash
# 安裝套件
npm install

# 建立資料表（初次或 schema 異動時執行）
npx prisma migrate dev

# 載入初始資料
npm run seed

# 開發模式（預設 port 3005）
npm run dev
```

## API 路由一覽

| 路由前綴 | 說明 |
|----------|------|
| `/user` | 會員註冊、登入、個人資料、收藏、通知 |
| `/instrument` | 樂器商品列表、詳細、分類、篩選 |
| `/lesson` | 課程列表、詳細、購買 |
| `/jam` | 組樂隊列表、發布、申請 |
| `/article` | 文章列表、詳細、留言、按讚 |
| `/cart` | 購物車管理 |
| `/coupon` | 優惠券查詢與套用 |
| `/ecpay-order` | 綠界金流訂單建立與回呼 |
| `/ecpay-users` | 綠界會員金流 |
| `/google-login` | Google OAuth 登入 |
| `/reset-password` | 忘記密碼、OTP 驗證、重設密碼 |

## NPM Scripts

| 指令 | 說明 |
|------|------|
| `npm run dev` | 以 nodemon + tsx 啟動開發伺服器 |
| `npm run seed` | 執行 `cli/db-init.js` 載入初始資料 |
| `npm run backup` | 執行資料庫備份 |
