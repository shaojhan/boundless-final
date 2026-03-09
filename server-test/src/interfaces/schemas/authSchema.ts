import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('請輸入有效 Email'),
  password: z.string().min(1, '請輸入密碼'),
});

export const RegisterSchema = z.object({
  name: z.string().optional().default(''),
  email: z.string().email('請輸入有效 Email'),
  password: z
    .string()
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/, '密碼請由英數8~20位組成'),
  passwordCheck: z.string(),
}).refine((d) => d.password === d.passwordCheck, {
  message: '兩次密碼不一致',
  path: ['passwordCheck'],
});

export const GoogleLoginSchema = z.object({
  accessToken: z.string().min(1, '缺少 Google access token'),
});

export const OtpRequestSchema = z.object({
  email: z.string().email('請輸入有效 Email'),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
  password: z
    .string()
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/, '密碼請由英數8~20位組成'),
});
