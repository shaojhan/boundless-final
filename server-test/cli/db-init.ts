// !! 注意: 此檔案並不是 express 執行時用，只用於載入初始資料，指令為 `npm run seed`
import 'dotenv/config';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../configs/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlPath = path.resolve(__dirname, '../prisma/seed.sql');
const sql = readFileSync(sqlPath, 'utf-8');

// 用 regex 直接擷取每段 INSERT INTO ... ; 語句
// 避免因注釋行或多行 VALUES 導致 split 方式漏抓
const regex = /^INSERT INTO[\s\S]+?;$/gm;
const statements = [...sql.matchAll(regex)].map((m) => m[0].trim());

console.log(`找到 ${statements.length} 筆 INSERT 語句，開始載入...`);

// 關閉嚴格模式，允許 0000-00-00 等非標準日期值
await prisma.$executeRawUnsafe("SET sql_mode = 'NO_ENGINE_SUBSTITUTION'");

let success = 0;
let failed = 0;

for (const stmt of statements) {
  try {
    await prisma.$executeRawUnsafe(stmt);
    const table = stmt.match(/INSERT INTO `?(\w+)`?/i)?.[1] ?? '?';
    console.log(`✓ ${table}`);
    success++;
  } catch (err) {
    const table = stmt.match(/INSERT INTO `?(\w+)`?/i)?.[1] ?? '?';
    console.error(`✗ ${table}: ${err.message}`);
    failed++;
  }
}

await prisma.$disconnect();
console.log(`\n完成：成功 ${success} 筆，失敗 ${failed} 筆`);
