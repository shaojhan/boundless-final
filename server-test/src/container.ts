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

// ── Catalog Context ────────────────────────────────────────────────────────────
import { PrismaProductRepository } from './repository/catalog/PrismaProductRepository.js';
import { InstrumentService } from './service/catalog/InstrumentService.js';
import { LessonService } from './service/catalog/LessonService.js';

export const productRepository = new PrismaProductRepository(prisma);
export const instrumentService = new InstrumentService(productRepository);
export const lessonService = new LessonService(productRepository);

// ── Article Context ────────────────────────────────────────────────────────────
import { PrismaArticleRepository } from './repository/article/PrismaArticleRepository.js';
import { ArticleService } from './service/article/ArticleService.js';

export const articleRepository = new PrismaArticleRepository(prisma);
export const articleService = new ArticleService(articleRepository);

// ── Jam Context ────────────────────────────────────────────────────────────────
import { PrismaJamRepository } from './repository/jam/PrismaJamRepository.js';
import { JamService } from './service/jam/JamService.js';

export const jamRepository = new PrismaJamRepository(prisma);
export const jamService = new JamService(jamRepository);
