# Boundless Final

Boundless Final 是一個前後端分離的音樂社群平台，包含：

- 前端：`client/`（Next.js + React）
- 後端：`server-test/`（Express + Prisma + MySQL/MariaDB，DDD 架構）

主要功能涵蓋樂器商城、課程、組團、文章、購物車、優惠券、會員中心與登入驗證。

## 1. 技術棧

### Frontend (`client`)

- Next.js `16.1.6`
- React `19.2.x`
- TypeScript `5.9.x`（strict: false，全面 `.ts/.tsx`）
- Tailwind CSS `4.2.x` + Sass
- Redux Toolkit（access token 存記憶體）
- Firebase（Google OAuth）

### Backend (`server-test`)

- Express `5.2.x`
- Prisma `7.x`（`@prisma/adapter-mariadb`）
- MySQL / MariaDB（`mysql2`）
- TypeScript（全部 `.ts`，`tsx` runner）
- JWT（access token 存記憶體，refresh token 存 DB + HTTP-only cookie）
- Nodemailer（開發用 MailHog）、OTPAuth、Multer、Zod
- **DDD 四層架構**：domain / repository / service / interfaces

### Testing (`server-test`)

- Vitest `4.x` + supertest
- Unit（domain / repository / service）、Integration（HTTP layer）、**E2E（真實 DB）**

## 2. 專案結構

```text
boundless-final/
├── client/                  # Next.js 前端
│   ├── pages/               # Next.js pages（全部 .tsx）
│   ├── components/          # React 元件
│   ├── hooks/               # 共用 hooks（useAvatarImage, useFilterToggle…）
│   ├── lib/                 # api-client, utils
│   ├── store/               # Redux Toolkit slices
│   ├── configs/             # API base URL 等設定
│   └── styles/
├── server-test/             # Express 後端（DDD）
│   ├── src/
│   │   ├── domain/          # 業務實體
│   │   ├── repository/      # Repository 介面 + Prisma 實作
│   │   ├── service/         # 業務邏輯
│   │   ├── interfaces/      # Express routers + Zod schemas + Swagger
│   │   └── container.ts     # DI 容器
│   ├── routes/              # 保留的舊路由（ecpay, google-login）
│   ├── middleware/
│   ├── configs/             # prisma, mail, otp
│   ├── db-helpers/
│   ├── prisma/              # schema + migrations + seed
│   ├── tests/               # Vitest（unit / integration / e2e）
│   └── app.ts
└── README.md
```

## 3. 環境需求

- Node.js：建議 `>= 20`（開發環境為 Node `22.x`）
- npm：建議 `>= 10`
- MySQL / MariaDB：需可連線並可建立 schema
- [MailHog](https://github.com/mailhog/MailHog)（開發用，預設 `localhost:1025`）

## 4. 快速開始（本機）

請開兩個 terminal 分別跑前後端。

### Step 1. 安裝依賴

```bash
cd client && npm install
cd ../server-test && npm install
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

# Runtime DB 連線（給 Prisma MariaDB adapter 使用）
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=boundless_final
DB_USERNAME=USER
DB_PASSWORD=PASSWORD

# Auth
ACCESS_TOKEN_SECRET=replace_with_secure_random_string
OTP_SECRET=replace_with_secure_random_string

# Mail（開發：MailHog）
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_FROM=no-reply@boundless.local
```

### Step 3. 初始化資料庫

```bash
cd server-test
npx prisma migrate deploy   # 套用所有 migrations
npx prisma generate         # 產生 Prisma Client
npm run seed                # 載入初始資料
```

### Step 4. 啟動服務

Terminal A（後端）：

```bash
cd server-test && npm run dev
```

Terminal B（前端）：

```bash
cd client && npm run dev
```

預設網址：

- 前端：http://localhost:3000
- 後端：http://localhost:3005
- Swagger：http://localhost:3005/docs
- MailHog：http://localhost:8025

## 5. 測試

```bash
cd server-test

# 執行全部測試（unit + integration + e2e）
npm test

# 只跑 E2E（需 DB 連線）
npx vitest run tests/e2e/

# 監看模式
npm run test:watch
```

| 層級 | 說明 |
|------|------|
| Unit | domain 實體、repository（mock DB）、service（mock repo） |
| Integration | HTTP 端點路由與 schema 驗證，service 以 `vi.fn()` mock |
| **E2E** | 真實 Express app + 真實 DB，驗證完整流程；`afterAll` 清除測試資料 |

## 6. 常用指令

### `client`

```bash
npm run dev        # 開發模式
npm run lint       # ESLint
npm run build      # Production build（--webpack）
npm run start      # 啟動 production server
```

### `server-test`

```bash
npm run dev        # nodemon + tsx
npm run lint       # ESLint（flat config）
npm test           # Vitest 單次執行
npm run seed       # 載入初始資料
npm run backup     # 資料庫備份
```

## 7. API 路由前綴

| 路由 | 說明 |
|------|------|
| `/api/auth` | 登入、註冊、refresh、logout、OTP、重設密碼 |
| `/api/instrument` | 樂器商品 |
| `/api/lesson` | 課程 |
| `/api/jam` | 組樂隊 |
| `/api/article` | 文章 |
| `/api/user` | 會員中心 |
| `/api/cart` | 購物車 |
| `/api/coupon` | 優惠券 |
| `/api/order` | 綠界金流 |
| `/api/google-login` | Google OAuth |
| `/api/reset-password` | 忘記密碼（舊路由） |

## 8. 升級與相容性注意事項（2026-03）

- 前端 `next build` 固定使用 `--webpack`（Turbopack 在此專案有卡住情況）
- 前端已升級 Tailwind CSS v4：PostCSS 使用 `@tailwindcss/postcss`
- 後端已升級 Express 5 / Multer 2
- 後端 ESLint 已升級 v10（flat config，`eslint.config.mjs`）
- **Prisma**：請使用 `migrate deploy`（CI）或 `migrate dev`（本機），**禁用** `db push`

## 9. 常見問題

### 前端打不到 API

- 確認 `client/.env.local` 的 `NEXT_PUBLIC_API_BASE_URL` 正確
- 後端 CORS 白名單：`localhost:3000`、`localhost:3001`、`localhost:3005`

### Prisma 連線失敗

- 檢查 `DB_HOST/DB_PORT/DB_DATABASE/DB_USERNAME/DB_PASSWORD`
- 確認資料庫服務已啟動

### SMTP / 寄信錯誤

- 開發環境請確認 MailHog 已啟動（`localhost:1025`）
- E2E 測試自動 mock mail，不需實際連線

---

詳細說明請參考：

- [client/README.md](client/README.md)
- [server-test/README.md](server-test/README.md)
