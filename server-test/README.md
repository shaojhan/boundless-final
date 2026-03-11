# Boundless 後端

音樂人社群平台的後端專案，提供 RESTful API，涵蓋樂器商城、線上課程、組樂隊、音樂文章及金流整合。

## 技術棧

| 類別 | 技術 |
|------|------|
| 框架 | Express.js 5 |
| ORM | Prisma 7（`@prisma/adapter-mariadb`） |
| 資料庫 | MySQL / MariaDB |
| 語言 | TypeScript（全部 `.ts`，`tsx` runner） |
| 認證 | JWT（access token 存記憶體，refresh token 存 DB + HTTP-only cookie） |
| Google OAuth | Firebase / Google |
| 金流 | 綠界 ECPay |
| 信件 | Nodemailer（開發用 MailHog `localhost:1025`） |
| 其他 | OTPAuth（OTP）、Multer（檔案上傳）、Zod（schema 驗證） |

## 架構：DDD 四層

```
server-test/
├── src/
│   ├── domain/                    # 業務實體與規則（純 TypeScript）
│   │   ├── auth/                  # User, Otp, RefreshToken, AuthError
│   │   ├── catalog/               # Product, Category
│   │   ├── commerce/              # Cart, Coupon
│   │   ├── article/               # Article, ArticleComment
│   │   ├── jam/                   # Jam
│   │   └── user/                  # UserProfile
│   ├── repository/                # Repository 介面 + Prisma 實作
│   │   ├── auth/
│   │   ├── catalog/
│   │   ├── commerce/
│   │   ├── article/
│   │   ├── jam/
│   │   └── user/
│   ├── service/                   # 業務邏輯
│   │   ├── auth/    AuthService
│   │   ├── catalog/ InstrumentService, LessonService
│   │   ├── commerce/ CartService, CouponService
│   │   ├── article/ ArticleService
│   │   ├── jam/     JamService
│   │   └── user/    UserService
│   ├── interfaces/
│   │   ├── routers/               # Express 路由（DDD 主路由）
│   │   ├── schemas/               # Zod 輸入驗證
│   │   └── docs/                  # Swagger / OpenAPI 產生器
│   └── container.ts               # DI 容器（唯一 new PrismaClient() 的地方）
├── routes/                        # 舊路由（僅 ecpay、google-login 保留）
│   ├── ecpay-order.ts
│   ├── ecpay-users.ts
│   ├── google-login.ts
│   └── reset-password.ts
├── middleware/                    # checkToken 等共用中介
├── configs/
│   ├── prisma.ts                  # PrismaClient + MariaDB adapter
│   ├── mail.ts                    # Nodemailer transporter
│   └── otp.ts
├── db-helpers/                    # bcrypt hash helper
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── generated/                     # Prisma 產生的 Client（git ignore）
├── tests/                         # 測試（Vitest）
│   ├── setup.ts
│   ├── unit/
│   │   ├── domain/
│   │   ├── repository/
│   │   ├── service/
│   │   └── interfaces/
│   ├── integration/
│   │   └── api/                   # HTTP 層測試（service mocked）
│   └── e2e/                       # E2E 測試（真實 DB）
└── app.ts
```

## 環境設定

在 `server-test/` 根目錄建立 `.env`：

```env
DATABASE_URL="mysql://USER:PASSWORD@127.0.0.1:3306/boundless_final"

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

# Mail（開發用 MailHog，生產環境改為 SMTP）
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_FROM=no-reply@boundless.local
```

> **開發信件**：預設使用 [MailHog](https://github.com/mailhog/MailHog)（`localhost:1025` 收信、`localhost:8025` Web UI）。
> 生產環境請改為真實 SMTP 設定並更新 `configs/mail.ts`。

## 啟動方式

```bash
# 安裝套件
npm install

# 套用所有 pending migrations（初次或 CI/CD 用）
npx prisma migrate deploy

# 開發時建立新 migration（互動式）
npx prisma migrate dev

# 產生 Prisma Client
npx prisma generate

# 載入初始資料
npm run seed

# 開發模式（預設 port 3005，nodemon + tsx）
npm run dev
```

> **注意**：請勿使用 `prisma db push`，會與 migration 歷史產生 DDL drift。

## API 路由一覽

| 路由前綴 | 說明 |
|----------|------|
| `GET/POST /api/auth` | 登入、註冊、refresh、logout、OTP、重設密碼 |
| `GET /api/instrument` | 樂器商品列表、分類、詳細 |
| `GET /api/lesson` | 課程列表、分類、詳細 |
| `GET/POST /api/jam` | 組樂隊列表、發布、申請、編輯 |
| `GET/POST /api/article` | 文章列表、詳細、留言、按讚 |
| `GET/POST /api/user` | 個人資料、收藏、通知、上傳頭像 |
| `POST /api/cart` | 購物車價格試算、訂單送出 |
| `GET/POST /api/coupon` | 優惠券查詢、兌換、建立、使用 |
| `POST /api/order` | 綠界金流訂單建立與回呼 |
| `GET /api/google-login` | Google OAuth 登入 |
| `POST /api/reset-password` | 忘記密碼（舊路由，已被 `/api/auth/otp` 取代） |

Swagger UI 於開發環境可透過 `http://localhost:3005/docs` 查看。

## 測試

使用 **Vitest** + **supertest**（共 3 層）：

```bash
# 執行全部測試
npm test

# 監看模式
npm run test:watch

# 只跑 E2E
npx vitest run tests/e2e/
```

### 測試結構

| 層級 | 路徑 | 說明 |
|------|------|------|
| Unit — Domain | `tests/unit/domain/` | 業務實體邏輯，純記憶體，無 DB |
| Unit — Repository | `tests/unit/repository/` | Prisma repo 方法，mock PrismaClient |
| Unit — Service | `tests/unit/service/` | 業務邏輯，mock repository |
| Unit — Interfaces | `tests/unit/interfaces/` | schema 驗證、error handler |
| Integration | `tests/integration/api/` | HTTP 端點測試，mock service |
| **E2E** | `tests/e2e/` | 真實 app + 真實 DB，僅 mock mail |

### E2E 測試覆蓋

| 檔案 | 端點 | 重點 |
|------|------|------|
| `auth.e2e.test.ts` | `/api/auth` | register → login → refresh → logout → token 撤銷 |
| `catalog.e2e.test.ts` | `/api/instrument`, `/api/lesson` | 列表、分類、分頁、邊界條件（無需 auth） |
| `cart.e2e.test.ts` | `/api/cart` | JWT 驗證、價格試算、訂單寫入 DB 驗證 |

E2E 測試在 `afterAll` 自動清除 user、refreshToken、coupon、orderItem、orderTotal。

## NPM Scripts

| 指令 | 說明 |
|------|------|
| `npm run dev` | nodemon + tsx 啟動開發伺服器 |
| `npm run lint` | ESLint（flat config，`eslint.config.mjs`） |
| `npm test` | Vitest 單次執行 |
| `npm run test:watch` | Vitest 監看模式 |
| `npm run seed` | 執行 `prisma/seed.ts` 載入初始資料 |
| `npm run backup` | 資料庫備份腳本 |
