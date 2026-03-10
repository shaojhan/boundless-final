import type { PrismaClient } from '#generated/prisma/client.js';
import type { IOtpRepository } from './IOtpRepository.js';
import { generateToken } from '#configs/otp.js';

export class PrismaOtpRepository implements IOtpRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createOrRefresh(
    email: string,
    expMinutes = 30,
    cooldownSeconds = 60,
  ): Promise<string | null> {
    const user = await this.prisma.user.findFirst({
      where: { email },
      select: { id: true },
    });
    if (!user) return null;

    const existing = await this.prisma.otp.findFirst({ where: { email } });
    const expMs = expMinutes * 60 * 1000;
    const cooldownMs = cooldownSeconds * 1000;

    if (existing) {
      const createdAt = Number(existing.exp_timestamp) - expMs;
      const withinCooldown = Date.now() - createdAt < cooldownMs;
      if (withinCooldown) return null; // too soon

      // refresh
      const token = generateToken();
      const exp_timestamp = BigInt(Date.now() + expMs);
      await this.prisma.otp.update({
        where: { id: existing.id },
        data: { token, exp_timestamp, updated_at: new Date() },
      });
      return token;
    }

    // create new
    const token = generateToken();
    const exp_timestamp = BigInt(Date.now() + expMs);
    await this.prisma.otp.create({
      data: {
        user_id: user.id,
        email,
        token,
        exp_timestamp,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    return token;
  }

  async updatePassword(
    email: string,
    token: string,
    newPasswordHash: string,
  ): Promise<number | null> {
    const otp = await this.prisma.otp.findFirst({ where: { email, token } });
    if (!otp) return null;
    if (Date.now() > Number(otp.exp_timestamp)) return null;

    await this.prisma.user.updateMany({
      where: { id: otp.user_id },
      data: { password: newPasswordHash },
    });
    await this.prisma.otp.delete({ where: { id: otp.id } });
    return otp.user_id;
  }
}
