import crypto from 'crypto';
import type { PrismaClient } from '#generated/prisma/client.js';
import type { IUserRepository } from './IUserRepository.js';
import type { User, UserPublic, NewUserInput, GoogleUserInput } from '#domain/auth/User.js';
import { generateHash } from '#db-helpers/password-hash.js';

const USER_PUBLIC_SELECT = {
  id: true,
  uid: true,
  name: true,
  email: true,
  img: true,
  my_jam: true,
  is_admin: true,
} as const;

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: number): Promise<User | null> {
    const row = await this.prisma.user.findFirst({ where: { id, valid: 1 } });
    return row ? toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findFirst({ where: { email, valid: 1 } });
    return row ? toDomain(row) : null;
  }

  async findByUid(uid: string): Promise<User | null> {
    const row = await this.prisma.user.findFirst({ where: { uid, valid: 1 } });
    return row ? toDomain(row) : null;
  }

  async findByGoogleUid(googleUid: string): Promise<UserPublic | null> {
    const row = await this.prisma.user.findFirst({
      where: { google_uid: googleUid },
      select: USER_PUBLIC_SELECT,
    });
    return row ? toPublic(row) : null;
  }

  async createUser(input: NewUserInput): Promise<UserPublic> {
    const uid = generateUid();
    const nickname = 'USER-' + uid;
    const hashedPassword = await generateHash(input.password);
    const now = new Date();

    const row = await this.prisma.user.create({
      data: {
        uid,
        name: input.name || nickname,
        email: input.email,
        password: hashedPassword,
        nickname,
        birthday: new Date('1990-01-01'),
        created_time: now,
        updated_time: now,
        valid: 1,
      },
      select: USER_PUBLIC_SELECT,
    });
    return toPublic(row);
  }

  async createGoogleUser(input: GoogleUserInput): Promise<UserPublic> {
    const uid = generateUid();
    const now = new Date();

    const row = await this.prisma.user.create({
      data: {
        uid,
        name: input.name ?? input.email,
        email: input.email,
        password: '',
        birthday: new Date(0),
        google_uid: input.googleUid,
        photo_url: input.photoUrl ?? null,
        nickname: input.name ?? input.email,
        created_time: now,
        updated_time: now,
        valid: 1,
      },
      select: USER_PUBLIC_SELECT,
    });
    return toPublic(row);
  }

  async grantWelcomeCoupon(userId: number): Promise<void> {
    await this.prisma.coupon.create({
      data: {
        user_id: userId,
        coupon_template_id: 1,
        created_time: new Date(),
      },
    });
  }
}

// ── Mapping helpers ────────────────────────────────────────────────────────────

function toDomain(row: {
  id: number;
  uid: string;
  name: string;
  email: string;
  password: string;
  nickname: string | null;
  phone: string | null;
  birthday: Date;
  img: string | null;
  google_uid: string | null;
  photo_url: string | null;
  my_jam: string | null;
  valid: number;
  is_admin: boolean;
  created_time: Date;
  updated_time: Date;
}): User {
  return {
    id: row.id,
    uid: row.uid,
    name: row.name,
    email: row.email,
    passwordHash: row.password,
    nickname: row.nickname,
    phone: row.phone,
    birthday: row.birthday,
    img: row.img,
    googleUid: row.google_uid,
    photoUrl: row.photo_url,
    myJam: row.my_jam,
    valid: row.valid,
    isAdmin: row.is_admin,
    createdTime: row.created_time,
    updatedTime: row.updated_time,
  };
}

function toPublic(row: {
  id: number;
  uid?: string;
  name: string;
  email: string;
  img: string | null;
  my_jam: string | null;
  is_admin: boolean;
}): UserPublic {
  return {
    id: row.id,
    uid: row.uid ?? '',
    name: row.name,
    email: row.email,
    img: row.img,
    myJam: row.my_jam,
    isAdmin: row.is_admin,
  };
}

function generateUid(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from(crypto.getRandomValues(new Uint8Array(12)))
    .map((b) => chars[b % chars.length])
    .join('');
}
