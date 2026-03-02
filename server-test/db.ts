import prisma from '#configs/prisma.js';
import { Prisma } from '#generated/prisma/client.ts';
import type { DbSelectResult } from './types/index.js';

// 將 ?-placeholder SQL + params 陣列轉為 Prisma.Sql（$queryRaw 安全版本）
function buildSql(sql: string, params: unknown[]): Prisma.Sql {
  const parts = sql.split('?');
  return Prisma.sql(parts as unknown as TemplateStringsArray, ...params);
}

const db = {
  execute: async <T = Record<string, unknown>>(
    sql: string,
    params: unknown[] = []
  ): Promise<DbSelectResult<T>> => {
    const type = sql.trim().toUpperCase();
    if (
      type.startsWith('SELECT') ||
      type.startsWith('SHOW') ||
      type.startsWith('WITH')
    ) {
      const rows = await prisma.$queryRaw<T[]>(buildSql(sql, params));
      return [rows] as DbSelectResult<T>;
    } else {
      const count = await prisma.$executeRaw(buildSql(sql, params));
      return [
        { affectedRows: count, insertId: 0 } as unknown as T[],
      ] as DbSelectResult<T>;
    }
  },
};

export default db;
