/**
 * DI Container — the ONLY place allowed to `new PrismaClient()`.
 * Wire up all Repositories and Services here.
 *
 * The shared PrismaClient instance (with MariaDB adapter) comes from
 * configs/prisma.ts to avoid duplicating the adapter config.
 *
 * Pattern:
 *   export const fooRepository = new PrismaFooRepository(prisma);
 *   export const fooService     = new FooService(fooRepository);
 */
import prisma from '../configs/prisma.ts';

export { prisma };

// ── Auth Context ──────────────────────────────────────────────────────────────
import { PrismaUserRepository } from './repository/auth/PrismaUserRepository.js';
import { PrismaRefreshTokenRepository } from './repository/auth/PrismaRefreshTokenRepository.js';
import { PrismaOtpRepository } from './repository/auth/PrismaOtpRepository.js';
import { AuthService } from './service/auth/AuthService.js';

export const userRepository = new PrismaUserRepository(prisma);
export const refreshTokenRepository = new PrismaRefreshTokenRepository(prisma);
export const otpRepository = new PrismaOtpRepository(prisma);
export const authService = new AuthService(userRepository, refreshTokenRepository, otpRepository);
