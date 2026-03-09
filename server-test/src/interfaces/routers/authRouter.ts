import express from 'express';
import transporter from '#configs/mail.js';
import type { AuthService, LoginPayload } from '../../service/auth/AuthService.js';
import { REFRESH_COOKIE_OPTIONS } from '../../service/auth/AuthService.js';
import { AuthError } from '../../domain/auth/AuthError.js';
import {
  LoginSchema,
  RegisterSchema,
  GoogleLoginSchema,
  OtpRequestSchema,
  ResetPasswordSchema,
} from '../schemas/authSchema.js';

const CLEAR_COOKIE_OPTIONS = { ...REFRESH_COOKIE_OPTIONS, maxAge: 0 };

export function createAuthRouter(authService: AuthService) {
  const router = express.Router();

  // ── POST /api/auth/login ─────────────────────────────────────────────────
  router.post('/login', async (req, res, next) => {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ status: 'error', message: parsed.error.issues[0].message });
    }
    try {
      const payload = await authService.login(parsed.data.email, parsed.data.password);
      res.cookie('refreshToken', payload.refreshToken, REFRESH_COOKIE_OPTIONS);
      return res.status(200).json({ status: 'success', ...serializePayload(payload) });
    } catch (err) {
      if (err instanceof AuthError) {
        return res.status(err.httpStatus).json({ status: 'error', message: err.message, code: err.code });
      }
      next(err);
    }
  });

  // ── POST /api/auth/register ──────────────────────────────────────────────
  router.post('/register', async (req, res, next) => {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ status: 'error', message: parsed.error.issues[0].message });
    }
    try {
      await authService.register(parsed.data.name, parsed.data.email, parsed.data.password);
      return res.status(201).json({ status: 'success', data: null });
    } catch (err) {
      if (err instanceof AuthError) {
        return res.status(err.httpStatus).json({ status: 'error', message: err.message });
      }
      next(err);
    }
  });

  // ── POST /api/auth/google ────────────────────────────────────────────────
  router.post('/google', async (req, res, next) => {
    const parsed = GoogleLoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ status: 'error', message: parsed.error.issues[0].message });
    }
    try {
      const payload = await authService.googleLogin(parsed.data.accessToken);
      res.cookie('refreshToken', payload.refreshToken, REFRESH_COOKIE_OPTIONS);
      return res.status(200).json({ status: 'success', ...serializePayload(payload) });
    } catch (err) {
      if (err instanceof AuthError) {
        return res.status(err.httpStatus).json({ status: 'error', message: err.message });
      }
      next(err);
    }
  });

  // ── POST /api/auth/refresh ───────────────────────────────────────────────
  router.post('/refresh', async (req, res, next) => {
    const incoming = req.cookies?.refreshToken as string | undefined;
    if (!incoming) {
      return res.status(401).json({ status: 'error', message: '未登入', code: 'NO_REFRESH_TOKEN' });
    }
    try {
      const payload = await authService.refresh(incoming);
      res.cookie('refreshToken', payload.refreshToken, REFRESH_COOKIE_OPTIONS);
      return res.status(200).json({ status: 'success', ...serializePayload(payload) });
    } catch (err) {
      if (err instanceof AuthError) {
        res.clearCookie('refreshToken', CLEAR_COOKIE_OPTIONS);
        return res.status(err.httpStatus).json({ status: 'error', message: err.message, code: err.code });
      }
      next(err);
    }
  });

  // ── POST /api/auth/logout ────────────────────────────────────────────────
  router.post('/logout', async (req, res) => {
    const { refreshToken } = req.cookies as { refreshToken?: string };
    await authService.logout(refreshToken);
    res.clearCookie('refreshToken', CLEAR_COOKIE_OPTIONS);
    return res.status(200).json({ status: 'success', message: '已登出' });
  });

  // ── POST /api/auth/otp ───────────────────────────────────────────────────
  router.post('/otp', async (req, res) => {
    const parsed = OtpRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.json({ status: 'error', message: '缺少必要資料' });
    }
    const token = await authService.requestOtp(parsed.data.email);
    if (!token) {
      return res.json({ status: 'error', message: 'Email錯誤或期間內重覆要求' });
    }
    const mailOptions = {
      from: `"boundless"<${process.env.SMTP_TO_EMAIL}>`,
      to: parsed.data.email,
      subject: '重新設定密碼',
      text: buildOtpMailText(token),
    };
    transporter.sendMail(mailOptions, (err) => {
      if (err) return res.json({ status: 'error', message: '發送電子郵件失敗' });
      return res.json({ status: 'success', data: null });
    });
  });

  // ── POST /api/auth/reset-password ────────────────────────────────────────
  router.post('/reset-password', async (req, res) => {
    const parsed = ResetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.json({ status: 'error', message: '缺少必要資料' });
    }
    const { email, token, password } = parsed.data;
    const ok = await authService.resetPassword(email, token, password);
    if (!ok) return res.json({ status: 'error', message: '修改密碼失敗' });
    return res.json({ status: 'success', data: null });
  });

  return router;
}

function serializePayload(payload: LoginPayload) {
  return {
    token: payload.token,
    user: {
      id: payload.user.id,
      uid: payload.user.uid,
      name: payload.user.name,
      email: payload.user.email,
      img: payload.user.img,
      my_jam: payload.user.myJam,
    },
  };
}

function buildOtpMailText(otpToken: string): string {
  return `親愛的boundless會員 您好，
在此通知重新設定密碼所需要的OTP(一次性驗證密碼)，
請在忘記密碼頁面的"6位數驗證碼"欄位中輸入以下的6位數字。
請注意該驗證碼將於寄送後30分鐘後到期，如您未提出申請，請忽略本信件，有任何問題歡迎洽詢boundless團隊:

${otpToken}

boundless 團隊 敬上`;
}
