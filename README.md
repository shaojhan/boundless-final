# Boundless Final

Boundless Final 是一個前後端分離的音樂社群平台專案，包含：

- 前端：`client/`（Next.js + React）
- 後端：`server-test/`（Express + Prisma + MySQL/MariaDB）

主要功能涵蓋樂器商城、課程、組團、文章、購物車、優惠券、會員中心與登入驗證。

## 1. 技術棧

### Frontend (`client`)

- Next.js `16.1.6`
- React `19.2.x`
- TypeScript `5.9.x`
- Tailwind CSS `4.2.x` + Sass
- Redux Toolkit
- Firebase（Google OAuth）

### Backend (`server-test`)

- Express `5.2.x`
- Prisma `7.4.x`（`@prisma/adapter-mariadb`）
- MySQL / MariaDB（`mysql2`）
- JWT、bcrypt
- Nodemailer、OTPAuth
- Multer（檔案上傳）

## 2. 專案結構

```text
boundless-final/
├── client/                  # Next.js 前端
│   ├── pages/
│   ├── components/
│   ├── hooks/
│   ├── store/
│   └── styles/
├── server-test/             # Express 後端
│   ├── routes/
│   ├── configs/
│   ├── prisma/
│   ├── controller/
│   ├── db-helpers/
│   └── bin/www
└── README.md
```

## 3. 環境需求

- Node.js：建議 `>= 20`（目前開發環境為 Node `22.x`）
- npm：建議 `>= 10`
- MySQL / MariaDB：需可連線並可建立 schema

## 4. 快速開始（本機）

請開兩個 terminal 分別跑前後端。

### Step 1. 安裝依賴

```bash
cd client
npm install

cd ../server-test
npm install
```

### Step 2. 設定環境變數

#### `client/.env.local`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3005
```

#### `server-test/.env`

```env
# Prisma migration / CLI 用
DATABASE_URL="mysql://USER:PASSWORD@127.0.0.1:3306/boundless_final"

# Server
PORT=3005
NODE_ENV=development

# Runtime DB 連線（給 Prisma adapter 使用）
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=boundless_final
DB_USERNAME=USER
DB_PASSWORD=PASSWORD

# Auth
ACCESS_TOKEN_SECRET=replace_with_secure_random_string
OTP_SECRET=replace_with_secure_random_string

# Mail (Gmail SMTP)
SMTP_TO_EMAIL=your_email@gmail.com
SMTP_TO_PASSWORD=your_gmail_app_password
```

### Step 3. 初始化資料庫

```bash
cd server-test
npx prisma migrate dev
npx prisma generate
npm run seed
```

### Step 4. 啟動服務

Terminal A（後端）：

```bash
cd server-test
npm run dev
```

Terminal B（前端）：

```bash
cd client
npm run dev
```

預設網址：

- 前端：http://localhost:3000
- 後端：http://localhost:3005

## 5. 常用指令

### `client`

```bash
npm run dev       # 開發模式
npm run lint      # ESLint
npm run build     # Production build (webpack)
npm run start     # 啟動 production server
```

### `server-test`

```bash
npm run dev       # nodemon + tsx
npm run start     # 同 dev（目前設定）
npm run lint      # ESLint
npm run seed      # 執行 prisma/seed.ts
npm run backup    # 資料庫備份腳本
```

## 6. API 路由前綴

後端主要路由掛在 `app.ts`：

- `/api/jam`
- `/api/instrument`
- `/api/lesson`
- `/api/coupon`
- `/api/user`
- `/api/article`
- `/api/google-login`
- `/api/cart`
- `/api/reset-password`
- `/api/order`
- `/api/users`
- `/api/auth`

## 7. 升級與相容性注意事項（2026-03）

- 前端 `next` 穩定版目前為 `16.1.6`，`build` 指令固定使用 `webpack`：
  - `next build --webpack`
  - 原因：目前此專案在 Turbopack 路徑會有卡住情況
- 前端已升級到 Tailwind CSS v4：
  - PostCSS 需使用 `@tailwindcss/postcss`
  - `styles/globals.scss` 使用 `@config` + `@import 'tailwindcss'`
- 後端已升級到 Express 5 / Multer 2：
  - Optional path 參數請使用 Express 5 相容語法（例如 `'/x/:id{/:uid}'`）
- 後端 ESLint 已升級到 v10：
  - 使用 `server-test/eslint.config.mjs`（flat config）
  - plugin 由 `eslint-plugin-node` 改為 `eslint-plugin-n`

## 8. 常見問題（Troubleshooting）

### 1) 前端打不到 API

- 確認 `client/.env.local` 的 `NEXT_PUBLIC_API_BASE_URL` 正確
- 確認後端 `PORT` 與前端設定一致（建議都用 `3005`）
- 後端 CORS 白名單目前允許：
  - `http://localhost:3000`
  - `http://localhost:3001`
  - `http://localhost:3005`

### 2) Prisma 連線失敗

- 檢查 `DATABASE_URL`
- 檢查 `DB_HOST/DB_PORT/DB_DATABASE/DB_USERNAME/DB_PASSWORD`
- 確認資料庫服務已啟動且可連線

### 3) 啟動時出現 SMTP 連線錯誤

- 若未設定 Gmail App Password，會出現：
  - `ERROR - 無法連線至SMTP伺服器`
- 可先補上 `SMTP_TO_EMAIL` / `SMTP_TO_PASSWORD`，或暫時避開需要寄信的流程

## 9. 開發建議流程

```bash
# 1) 開分支
git checkout -b feat/your-feature

# 2) 開發 + 驗證
# client: npm run lint && npm run build
# server-test: npm run lint && npm run dev

# 3) commit
git add .
git commit -m "feat: your change"
```

---

如需更細節的子系統說明，請參考：

- `client/README.md`
- `server-test/README.md`
