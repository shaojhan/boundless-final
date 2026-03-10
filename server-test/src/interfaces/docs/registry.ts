import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import {
  LoginSchema,
  RegisterSchema,
  GoogleLoginSchema,
  OtpRequestSchema,
  ResetPasswordSchema,
} from '#interfaces/schemas/authSchema.js';
import {
  JamListQuerySchema,
  FormedJamListQuerySchema,
  JuidParamSchema,
  JuidUidParamSchema,
  UidParamSchema,
  CreateJamSchema,
  CreateApplySchema,
  UpdateJamFormSchema,
  JoinJamSchema,
  IdBodySchema,
  DecideApplySchema,
  DisbandSchema,
  QuitSchema,
  FormRightNowSchema,
  EditJamInfoSchema,
} from '#interfaces/schemas/jamSchema.js';
import { UpdateProfileSchema } from '#interfaces/schemas/userSchema.js';
import {
  CreateArticleSchema,
  UpdateArticleSchema,
  AuidParamSchema,
} from '#interfaces/schemas/articleSchema.js';
import {
  InstrumentQuerySchema,
  LessonQuerySchema,
  CategoryParamSchema,
} from '#interfaces/schemas/catalogSchema.js';

export const registry = new OpenAPIRegistry();

// ── Inline schemas (cart / coupon) ────────────────────────────────────────────
const CartCalculateSchema = z.object({
  cartdata: z.string(),
  lessonCUID: z.string().optional(),
  instrumentCUID: z.string().optional(),
});
const CartFormSchema = z.object({
  phone: z.string(),
  country: z.string(),
  township: z.string(),
  postcode: z.string(),
  address: z.string(),
  transportationstate: z.string(),
  cartdata: z.string(),
  LessonCUID: z.string().optional(),
  InstrumentCUID: z.string().optional(),
});
const CouponCreateSchema = z.object({
  user_id: z.number(),
  coupon_template_id: z.number(),
});
const CouponRedeemSchema = z.object({
  user_id: z.number(),
  coupon_code: z.string().min(1),
});

// ── Common response helpers ───────────────────────────────────────────────────
const OkResponse = { description: '成功' };
const ErrResponse = { description: '失敗（驗證錯誤或伺服器錯誤）' };

// ── Auth paths ────────────────────────────────────────────────────────────────
registry.registerPath({
  method: 'post', path: '/api/auth/login', tags: ['Auth'],
  summary: '登入',
  request: { body: { content: { 'application/json': { schema: LoginSchema } } } },
  responses: { 200: OkResponse, 400: ErrResponse },
});
registry.registerPath({
  method: 'post', path: '/api/auth/register', tags: ['Auth'],
  summary: '註冊',
  request: { body: { content: { 'application/json': { schema: RegisterSchema } } } },
  responses: { 200: OkResponse, 400: ErrResponse },
});
registry.registerPath({
  method: 'post', path: '/api/auth/google', tags: ['Auth'],
  summary: 'Google 登入',
  request: { body: { content: { 'application/json': { schema: GoogleLoginSchema } } } },
  responses: { 200: OkResponse, 400: ErrResponse },
});
registry.registerPath({
  method: 'post', path: '/api/auth/refresh', tags: ['Auth'],
  summary: '刷新 Access Token（Cookie refresh token）',
  responses: { 200: OkResponse, 401: ErrResponse },
});
registry.registerPath({
  method: 'post', path: '/api/auth/logout', tags: ['Auth'],
  summary: '登出',
  responses: { 200: OkResponse },
});
registry.registerPath({
  method: 'post', path: '/api/auth/otp', tags: ['Auth'],
  summary: '發送 OTP 驗證碼',
  request: { body: { content: { 'application/json': { schema: OtpRequestSchema } } } },
  responses: { 200: OkResponse, 400: ErrResponse },
});
registry.registerPath({
  method: 'post', path: '/api/auth/reset-password', tags: ['Auth'],
  summary: '重設密碼',
  request: { body: { content: { 'application/json': { schema: ResetPasswordSchema } } } },
  responses: { 200: OkResponse, 400: ErrResponse },
});

// ── Jam paths ─────────────────────────────────────────────────────────────────
registry.registerPath({
  method: 'get', path: '/api/jam/allJam', tags: ['Jam'],
  summary: '取得所有 Jam 列表',
  request: { query: JamListQuerySchema },
  responses: { 200: OkResponse },
});
registry.registerPath({
  method: 'get', path: '/api/jam/singleJam/{juid}', tags: ['Jam'],
  summary: '取得單一 Jam（不含成員資訊）',
  request: { params: JuidParamSchema },
  responses: { 200: OkResponse, 404: ErrResponse },
});
registry.registerPath({
  method: 'get', path: '/api/jam/singleJam/{juid}/{uid}', tags: ['Jam'],
  summary: '取得單一 Jam（含成員資訊）',
  request: { params: JuidUidParamSchema },
  responses: { 200: OkResponse, 404: ErrResponse },
});
registry.registerPath({
  method: 'get', path: '/api/jam/getMyApply/{uid}', tags: ['Jam'],
  summary: '取得我的申請列表',
  request: { params: UidParamSchema },
  responses: { 200: OkResponse },
});
registry.registerPath({
  method: 'get', path: '/api/jam/allFormedJam', tags: ['Jam'],
  summary: '取得所有已成團 Jam',
  request: { query: FormedJamListQuerySchema },
  responses: { 200: OkResponse },
});
registry.registerPath({
  method: 'get', path: '/api/jam/singleFormedJam/{juid}', tags: ['Jam'],
  summary: '取得單一已成團 Jam',
  request: { params: JuidParamSchema },
  responses: { 200: OkResponse, 404: ErrResponse },
});
registry.registerPath({
  method: 'post', path: '/api/jam/form', tags: ['Jam'],
  summary: '建立 Jam',
  request: { body: { content: { 'application/json': { schema: CreateJamSchema } } } },
  responses: { 200: OkResponse, 400: ErrResponse },
});
registry.registerPath({
  method: 'post', path: '/api/jam/apply', tags: ['Jam'],
  summary: '申請加入 Jam',
  request: { body: { content: { 'application/json': { schema: CreateApplySchema } } } },
  responses: { 200: OkResponse, 400: ErrResponse },
});
registry.registerPath({
  method: 'put', path: '/api/jam/updateForm', tags: ['Jam'],
  summary: '更新 Jam 資訊',
  request: { body: { content: { 'application/json': { schema: UpdateJamFormSchema } } } },
  responses: { 200: OkResponse, 400: ErrResponse },
});
registry.registerPath({
  method: 'put', path: '/api/jam/joinJam', tags: ['Jam'],
  summary: '確認加入 Jam',
  request: { body: { content: { 'application/json': { schema: JoinJamSchema } } } },
  responses: { 200: OkResponse, 400: ErrResponse },
});
registry.registerPath({
  method: 'put', path: '/api/jam/cancelApply', tags: ['Jam'],
  summary: '取消申請',
  request: { body: { content: { 'application/json': { schema: IdBodySchema } } } },
  responses: { 200: OkResponse },
});
registry.registerPath({
  method: 'put', path: '/api/jam/deleteApply', tags: ['Jam'],
  summary: '刪除申請（團長操作）',
  request: { body: { content: { 'application/json': { schema: IdBodySchema } } } },
  responses: { 200: OkResponse },
});
registry.registerPath({
  method: 'put', path: '/api/jam/decideApply', tags: ['Jam'],
  summary: '審核申請（通過/拒絕）',
  request: { body: { content: { 'application/json': { schema: DecideApplySchema } } } },
  responses: { 200: OkResponse, 400: ErrResponse },
});
registry.registerPath({
  method: 'put', path: '/api/jam/disband', tags: ['Jam'],
  summary: '解散 Jam',
  request: { body: { content: { 'application/json': { schema: DisbandSchema } } } },
  responses: { 200: OkResponse, 400: ErrResponse },
});
registry.registerPath({
  method: 'put', path: '/api/jam/quit', tags: ['Jam'],
  summary: '退出 Jam',
  request: { body: { content: { 'application/json': { schema: QuitSchema } } } },
  responses: { 200: OkResponse, 400: ErrResponse },
});
registry.registerPath({
  method: 'put', path: '/api/jam/formRightNow', tags: ['Jam'],
  summary: '立即成團',
  request: { body: { content: { 'application/json': { schema: FormRightNowSchema } } } },
  responses: { 200: OkResponse, 400: ErrResponse },
});
registry.registerPath({
  method: 'put', path: '/api/jam/editInfo', tags: ['Jam'],
  summary: '編輯 Jam 詳細資訊（含封面圖片 multipart/form-data）',
  request: { body: { content: { 'multipart/form-data': { schema: EditJamInfoSchema } } } },
  responses: { 200: OkResponse, 400: ErrResponse },
});

// ── User paths ────────────────────────────────────────────────────────────────
registry.registerPath({
  method: 'post', path: '/api/user/upload-avatar', tags: ['User'],
  summary: '上傳大頭貼（multipart/form-data）',
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: z.object({ avatar: z.any() }),
        },
      },
    },
  },
  responses: { 200: OkResponse, 400: ErrResponse },
});
registry.registerPath({
  method: 'get', path: '/api/user/user-homepage/{uid}', tags: ['User'],
  summary: '取得使用者首頁資訊',
  request: { params: z.object({ uid: z.string() }) },
  responses: { 200: OkResponse, 404: ErrResponse },
});
registry.registerPath({
  method: 'get', path: '/api/user/homepageArticle/{uid}', tags: ['User'],
  summary: '取得使用者首頁文章',
  request: { params: z.object({ uid: z.string() }) },
  responses: { 200: OkResponse },
});
registry.registerPath({
  method: 'get', path: '/api/user/MyArticle/{id}', tags: ['User'],
  summary: '取得我的文章列表（需登入）',
  request: { params: z.object({ id: z.string() }) },
  responses: { 200: OkResponse, 401: ErrResponse },
});
registry.registerPath({
  method: 'get', path: '/api/user/profile/{id}', tags: ['User'],
  summary: '取得個人資料（需登入）',
  request: { params: z.object({ id: z.string() }) },
  responses: { 200: OkResponse, 401: ErrResponse },
});
registry.registerPath({
  method: 'post', path: '/api/user/editProfile/{id}', tags: ['User'],
  summary: '編輯個人資料（需登入）',
  request: {
    params: z.object({ id: z.string() }),
    body: { content: { 'application/json': { schema: UpdateProfileSchema } } },
  },
  responses: { 200: OkResponse, 400: ErrResponse, 401: ErrResponse },
});
registry.registerPath({
  method: 'post', path: '/api/user/order/{id}', tags: ['User'],
  summary: '取得訂單列表（需登入）',
  request: { params: z.object({ id: z.string() }) },
  responses: { 200: OkResponse, 401: ErrResponse },
});
registry.registerPath({
  method: 'get', path: '/api/user/{id}', tags: ['User'],
  summary: '取得使用者基本資料（需登入）',
  request: { params: z.object({ id: z.string() }) },
  responses: { 200: OkResponse, 401: ErrResponse },
});

// ── Article paths ─────────────────────────────────────────────────────────────
registry.registerPath({
  method: 'get', path: '/api/article', tags: ['Article'],
  summary: '取得所有文章',
  responses: { 200: OkResponse },
});
registry.registerPath({
  method: 'get', path: '/api/article/comments', tags: ['Article'],
  summary: '取得文章留言',
  responses: { 200: OkResponse },
});
registry.registerPath({
  method: 'get', path: '/api/article/sharing', tags: ['Article'],
  summary: '取得分享文章',
  responses: { 200: OkResponse },
});
registry.registerPath({
  method: 'post', path: '/api/article/upload', tags: ['Article'],
  summary: '新增文章（含圖片 multipart/form-data）',
  request: { body: { content: { 'multipart/form-data': { schema: CreateArticleSchema } } } },
  responses: { 200: OkResponse, 400: ErrResponse },
});
registry.registerPath({
  method: 'put', path: '/api/article/edit/{auid}', tags: ['Article'],
  summary: '編輯文章',
  request: {
    params: AuidParamSchema,
    body: { content: { 'application/json': { schema: UpdateArticleSchema } } },
  },
  responses: { 200: OkResponse, 400: ErrResponse },
});
registry.registerPath({
  method: 'get', path: '/api/article/{auid}', tags: ['Article'],
  summary: '取得單篇文章',
  request: { params: AuidParamSchema },
  responses: { 200: OkResponse, 404: ErrResponse },
});

// ── Instrument paths ──────────────────────────────────────────────────────────
registry.registerPath({
  method: 'get', path: '/api/instrument', tags: ['Instrument'],
  summary: '取得樂器列表',
  request: { query: InstrumentQuerySchema },
  responses: { 200: OkResponse },
});
registry.registerPath({
  method: 'get', path: '/api/instrument/categories', tags: ['Instrument'],
  summary: '取得樂器分類',
  responses: { 200: OkResponse },
});
registry.registerPath({
  method: 'get', path: '/api/instrument/category/{category}', tags: ['Instrument'],
  summary: '取得特定分類樂器',
  request: { params: CategoryParamSchema, query: InstrumentQuerySchema },
  responses: { 200: OkResponse },
});
registry.registerPath({
  method: 'get', path: '/api/instrument/{id}', tags: ['Instrument'],
  summary: '取得單一樂器',
  request: { params: z.object({ id: z.string() }) },
  responses: { 200: OkResponse, 404: ErrResponse },
});

// ── Lesson paths ──────────────────────────────────────────────────────────────
registry.registerPath({
  method: 'get', path: '/api/lesson', tags: ['Lesson'],
  summary: '取得課程列表',
  request: { query: LessonQuerySchema },
  responses: { 200: OkResponse },
});
registry.registerPath({
  method: 'get', path: '/api/lesson/categories', tags: ['Lesson'],
  summary: '取得課程分類',
  responses: { 200: OkResponse },
});
registry.registerPath({
  method: 'get', path: '/api/lesson/category/{category}', tags: ['Lesson'],
  summary: '取得特定分類課程',
  request: { params: CategoryParamSchema, query: LessonQuerySchema },
  responses: { 200: OkResponse },
});
registry.registerPath({
  method: 'get', path: '/api/lesson/{id}', tags: ['Lesson'],
  summary: '取得單一課程',
  request: { params: z.object({ id: z.string() }) },
  responses: { 200: OkResponse, 404: ErrResponse },
});

// ── Cart paths ────────────────────────────────────────────────────────────────
registry.registerPath({
  method: 'post', path: '/api/cart/calculate', tags: ['Cart'],
  summary: '計算購物車金額（需登入）',
  request: { body: { content: { 'application/json': { schema: CartCalculateSchema } } } },
  responses: { 200: OkResponse, 400: ErrResponse, 401: ErrResponse },
});
registry.registerPath({
  method: 'post', path: '/api/cart/form', tags: ['Cart'],
  summary: '送出購物車訂單（需登入）',
  request: { body: { content: { 'application/json': { schema: CartFormSchema } } } },
  responses: { 200: OkResponse, 400: ErrResponse, 401: ErrResponse },
});

// ── Coupon paths ──────────────────────────────────────────────────────────────
registry.registerPath({
  method: 'get', path: '/api/coupon/FindAll/{user_id}', tags: ['Coupon'],
  summary: '取得使用者所有優惠券',
  request: { params: z.object({ user_id: z.string() }) },
  responses: { 200: OkResponse },
});
registry.registerPath({
  method: 'post', path: '/api/coupon/Create', tags: ['Coupon'],
  summary: '領取優惠券',
  request: { body: { content: { 'application/json': { schema: CouponCreateSchema } } } },
  responses: { 200: OkResponse, 400: ErrResponse },
});
registry.registerPath({
  method: 'post', path: '/api/coupon/Update', tags: ['Coupon'],
  summary: '更新優惠券狀態',
  responses: { 200: OkResponse },
});
registry.registerPath({
  method: 'post', path: '/api/coupon/Redeem', tags: ['Coupon'],
  summary: '兌換優惠券',
  request: { body: { content: { 'application/json': { schema: CouponRedeemSchema } } } },
  responses: { 200: OkResponse, 400: ErrResponse },
});

// ── Generate spec ─────────────────────────────────────────────────────────────
export function generateOpenApiSpec() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: { title: 'Boundless API', version: '1.0.0', description: 'Boundless 音樂平台 API 文件' },
    servers: [{ url: 'http://localhost:3005', description: '本地開發' }],
  });
}
