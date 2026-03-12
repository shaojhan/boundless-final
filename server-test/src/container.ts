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
import prisma from '#configs/prisma.js';

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

// ── User Context ───────────────────────────────────────────────────────────────
import { PrismaUserProfileRepository } from './repository/user/PrismaUserProfileRepository.js';
import { UserService } from './service/user/UserService.js';

export const userProfileRepository = new PrismaUserProfileRepository(prisma);
export const userService = new UserService(userProfileRepository);

// ── Recommendation Context ─────────────────────────────────────────────────────
import { PrismaRecommendationRepository } from './repository/recommendation/PrismaRecommendationRepository.js';
import { RecommendationService } from './service/recommendation/RecommendationService.js';

export const recommendationRepository = new PrismaRecommendationRepository(prisma);
export const recommendationService = new RecommendationService(recommendationRepository);

// ── Commerce Context ────────────────────────────────────────────────────────────
import { PrismaCartRepository } from './repository/commerce/PrismaCartRepository.js';
import { PrismaCouponRepository } from './repository/commerce/PrismaCouponRepository.js';
import { CartService } from './service/commerce/CartService.js';
import { CouponService } from './service/commerce/CouponService.js';

export const cartRepository = new PrismaCartRepository(prisma);
export const couponRepository = new PrismaCouponRepository(prisma);
export const cartService = new CartService(cartRepository);
export const couponService = new CouponService(couponRepository);
