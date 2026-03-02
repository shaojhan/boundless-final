# Boundless 前端

音樂人社群平台的前端專案，涵蓋樂器商城、線上課程、組樂隊、音樂文章等功能。

## 技術棧

- **框架**：Next.js 16 + React 19
- **樣式**：Bootstrap 5、Sass
- **HTTP**：Axios
- **編輯器**：Tiptap（富文字編輯）
- **第三方登入**：Firebase（Google OAuth）
- **UI 工具**：SweetAlert2、React Hot Toast、react-paginate、Lottie

## 專案結構

```
client/
├── pages/
│   ├── index.js            # 首頁
│   ├── login.js            # 登入
│   ├── register.js         # 註冊
│   ├── forget-password.js  # 忘記密碼
│   ├── instrument/         # 樂器商城
│   ├── lesson/             # 線上課程
│   ├── jam/                # 組樂隊
│   ├── article/            # 音樂文章
│   ├── cart/               # 購物車
│   ├── coupon/             # 優惠券
│   └── user/               # 會員中心
├── components/             # 共用元件
├── hooks/                  # 自定義 Hook
├── services/               # API 呼叫
├── styles/                 # 全域樣式
├── assets/                 # 靜態資源
└── utils/                  # 工具函式
```

## 主要功能

| 功能 | 說明 |
|------|------|
| 樂器商城 | 商品列表（篩選、排序、分頁）、商品詳細、加入購物車 |
| 線上課程 | 課程列表、課程詳細、購買課程 |
| 組樂隊 | 招募列表、發布招募、申請加入 |
| 音樂文章 | 文章列表、富文字編輯、文章留言 |
| 購物車 | 商品管理、套用優惠券、綠界結帳 |
| 會員中心 | 個人資料、訂單記錄、收藏、課程、樂隊、通知 |
| 帳號 | 電子郵件註冊／登入、Google 登入、忘記密碼 |

## 環境設定

在 `client/` 根目錄建立 `.env.local`：

```env
NEXT_PUBLIC_API_URL=http://localhost:3005
```

## 啟動方式

```bash
# 安裝套件
npm install

# 開發模式（預設 port 3000）
npm run dev

# 建置
npm run build

# 正式模式
npm start
```

## 注意事項

- 前端預設連線至後端 `http://localhost:3005`，請確認後端已啟動
- Google 登入需在 Firebase Console 設定授權網域
