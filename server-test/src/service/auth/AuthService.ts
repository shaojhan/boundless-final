import jwt from 'jsonwebtoken';
import 'dotenv/config.js';
import { compareHash, generateHash } from '#db-helpers/password-hash.js';
import type { IUserRepository } from '#repository/auth/IUserRepository.js';
import type { IRefreshTokenRepository } from '#repository/auth/IRefreshTokenRepository.js';
import type { IOtpRepository } from '#repository/auth/IOtpRepository.js';
import type { UserPublic } from '#domain/auth/User.js';
import { AuthError } from '#domain/auth/AuthError.js';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const ACCESS_TOKEN_TTL = '15m';

export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export interface LoginPayload {
  token: string;
  refreshToken: string;
  user: UserPublic;
}

export class AuthService {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly tokenRepo: IRefreshTokenRepository,
    private readonly otpRepo: IOtpRepository,
  ) {}

  // ── Login ──────────────────────────────────────────────────────────────────

  async login(email: string, password: string): Promise<LoginPayload> {
    const user = await this.userRepo.findByEmail(email);
    if (!user || !(await compareHash(password, user.passwordHash))) {
      throw new AuthError('使用者帳號或密碼錯誤。', 'INVALID_CREDENTIALS', 400);
    }

    const pub = toPublic(user);
    const token = signAccessToken(pub);
    const refreshToken = await this.tokenRepo.create(user.id);
    return { token, refreshToken, user: pub };
  }

  // ── Register ───────────────────────────────────────────────────────────────

  async register(name: string, email: string, password: string): Promise<void> {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) {
      throw new AuthError('該帳號已存在', 'EMAIL_EXISTS', 400);
    }

    const created = await this.userRepo.createUser({ name, email, password });
    await this.userRepo.grantWelcomeCoupon(created.id);
  }

  // ── Google Login ───────────────────────────────────────────────────────────

  async googleLogin(accessToken: string): Promise<LoginPayload> {
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userInfoRes.ok) {
      throw new AuthError('Google token 無效', 'INVALID_GOOGLE_TOKEN', 401);
    }

    const { sub: googleUid, email, name, picture } = (await userInfoRes.json()) as {
      sub: string;
      email: string;
      name: string;
      picture?: string;
    };

    if (!googleUid || !email) {
      throw new AuthError('Google 使用者資料不完整', 'INCOMPLETE_GOOGLE_USER', 401);
    }

    let pub = await this.userRepo.findByGoogleUid(googleUid);
    if (!pub) {
      pub = await this.userRepo.createGoogleUser({ googleUid, email, name, photoUrl: picture });
    }

    const token = signAccessToken(pub);
    const refreshToken = await this.tokenRepo.create(pub.id);
    return { token, refreshToken, user: pub };
  }

  // ── Refresh Token ──────────────────────────────────────────────────────────

  async refresh(incomingRefreshToken: string): Promise<LoginPayload> {
    const found = await this.tokenRepo.findValid(incomingRefreshToken);
    if (!found) {
      throw new AuthError('登入已過期，請重新登入', 'INVALID_REFRESH_TOKEN', 401);
    }

    const user = await this.userRepo.findById(found.userId);
    if (!user) {
      await this.tokenRepo.delete(incomingRefreshToken);
      throw new AuthError('使用者不存在', 'USER_NOT_FOUND', 401);
    }

    // Token rotation
    await this.tokenRepo.delete(incomingRefreshToken);
    const pub = toPublic(user);
    const token = signAccessToken(pub);
    const refreshToken = await this.tokenRepo.create(user.id);
    return { token, refreshToken, user: pub };
  }

  // ── Logout ─────────────────────────────────────────────────────────────────

  async logout(refreshToken: string | undefined): Promise<void> {
    if (refreshToken) {
      await this.tokenRepo.delete(refreshToken);
    }
  }

  // ── OTP (password reset) ───────────────────────────────────────────────────

  async requestOtp(email: string): Promise<string | null> {
    return this.otpRepo.createOrRefresh(email);
  }

  async resetPassword(email: string, token: string, password: string): Promise<boolean> {
    const hash = await generateHash(password);
    const userId = await this.otpRepo.updatePassword(email, token, hash);
    if (!userId) return false;
    await this.tokenRepo.deleteByUserId(userId);
    return true;
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function signAccessToken(user: UserPublic): string {
  return jwt.sign(
    {
      id: user.id,
      uid: user.uid,
      name: user.name,
      email: user.email,
      img: user.img,
      my_jam: user.myJam,
      isAdmin: user.isAdmin,
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL },
  );
}

function toPublic(user: {
  id: number;
  uid: string;
  name: string;
  email: string;
  img: string | null;
  myJam: string | null;
  isAdmin: boolean;
}): UserPublic {
  return {
    id: user.id,
    uid: user.uid,
    name: user.name,
    email: user.email,
    img: user.img,
    myJam: user.myJam,
    isAdmin: user.isAdmin,
  };
}
