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

// ── Repositories ──────────────────────────────────────────────────────────────
// import { PrismaUserRepository } from './repository/user/PrismaUserRepository.ts';
// export const userRepository = new PrismaUserRepository(prisma);

// ── Services ──────────────────────────────────────────────────────────────────
// import { UserService } from './service/user/UserService.ts';
// export const userService = new UserService(userRepository);
