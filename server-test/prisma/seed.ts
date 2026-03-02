import 'dotenv/config';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../configs/prisma.js';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── 小型參考資料表（直接使用 Prisma 型別 API）────────────────────────────

const genres = [
  { id: 1, name: '流行' },
  { id: 2, name: '民謠' },
  { id: 3, name: '搖滾' },
  { id: 4, name: 'AOR' },
  { id: 5, name: '龐克' },
  { id: 6, name: '另類' },
  { id: 7, name: '金屬' },
  { id: 8, name: 'indie' },
  { id: 9, name: '嘻哈' },
  { id: 10, name: '雷鬼' },
  { id: 11, name: '放克' },
  { id: 12, name: 'R&B' },
  { id: 13, name: '靈魂' },
  { id: 14, name: '藍調' },
  { id: 15, name: '爵士' },
  { id: 16, name: '拉丁' },
  { id: 17, name: '世界音樂' },
  { id: 18, name: '電子' },
  { id: 19, name: '環境音樂' },
  { id: 20, name: '古典' },
];

const players = [
  { id: 1, name: '人聲' },
  { id: 2, name: '木吉他' },
  { id: 3, name: '電吉他' },
  { id: 4, name: '貝斯' },
  { id: 5, name: '電貝斯' },
  { id: 6, name: '鍵盤' },
  { id: 7, name: '木箱鼓' },
  { id: 8, name: '爵士鼓' },
  { id: 9, name: '打擊樂' },
  { id: 10, name: '長笛' },
  { id: 11, name: '薩克斯風' },
  { id: 12, name: '小號' },
  { id: 13, name: '長號' },
  { id: 14, name: '上低音號' },
  { id: 15, name: '小提琴' },
  { id: 16, name: '中提琴' },
  { id: 17, name: '大提琴' },
  { id: 18, name: '合成器' },
];

const lessonCategories = [
  { id: 1, name: '歌唱技巧', valid: 1 },
  { id: 2, name: '樂器演奏', valid: 1 },
  { id: 3, name: '音樂理論', valid: 1 },
  { id: 4, name: '詞曲創作', valid: 1 },
  { id: 5, name: '軟體操作', valid: 1 },
];

const articleCategories = [
  { id: 1, name: '樂評' },
  { id: 2, name: '技術' },
];

const brands = [
  { id: 1, name: 'YAMAHA', valid: 1 },
  { id: 2, name: 'Roland', valid: 1 },
  { id: 3, name: 'Ibanez', valid: 1 },
  { id: 4, name: 'Fender', valid: 1 },
  { id: 5, name: 'Zildjian', valid: 1 },
  { id: 6, name: 'Paiste', valid: 1 },
  { id: 7, name: 'Jupiter', valid: 1 },
  { id: 8, name: 'LienViolins', valid: 1 },
  { id: 9, name: 'David Lien', valid: 1 },
  { id: 10, name: 'Orange', valid: 1 },
  { id: 11, name: '其他', valid: 1 },
];

const instrumentCategories = [
  { id: 1, parent_id: 0, name: '吉他' },
  { id: 2, parent_id: 0, name: '貝斯' },
  { id: 3, parent_id: 0, name: '鍵盤樂器' },
  { id: 4, parent_id: 0, name: '打擊樂器' },
  { id: 5, parent_id: 0, name: '管樂器' },
  { id: 6, parent_id: 0, name: '弓弦樂器' },
  { id: 7, parent_id: 0, name: '音響設備' },
  { id: 8, parent_id: 1, name: '木吉他' },
  { id: 9, parent_id: 1, name: '電吉他' },
  { id: 10, parent_id: 2, name: '木貝斯' },
  { id: 11, parent_id: 2, name: '電貝斯' },
  { id: 12, parent_id: 3, name: '直立式鋼琴' },
  { id: 13, parent_id: 3, name: '平台式鋼琴' },
  { id: 14, parent_id: 3, name: '數位鋼琴' },
  { id: 15, parent_id: 4, name: '傳統鼓' },
  { id: 16, parent_id: 4, name: '電子鼓' },
  { id: 17, parent_id: 4, name: '銅鈸' },
  { id: 18, parent_id: 5, name: '長笛' },
  { id: 19, parent_id: 5, name: '薩克斯風' },
  { id: 20, parent_id: 5, name: '小號' },
  { id: 21, parent_id: 5, name: '長號' },
  { id: 22, parent_id: 5, name: '上低音號' },
  { id: 23, parent_id: 6, name: '大提琴' },
  { id: 24, parent_id: 6, name: '中提琴' },
  { id: 25, parent_id: 6, name: '小提琴' },
  { id: 26, parent_id: 7, name: '音箱頭' },
  { id: 27, parent_id: 7, name: '箱體' },
  { id: 28, parent_id: 7, name: 'Combo音箱' },
];

// ─── 大型資料表（內容龐大，從 seed.sql 用 raw query 載入）─────────────────
// 依照 FK 相依順序排列
const LARGE_TABLES = [
  'teacher_info',
  'user',
  'product',
  'coupon_template',
  'coupon',
  'article',
  'article_comment',
  'article_comment_like',
  'jam',
  'jam_apply',
  'order_total',
  'order_item',
  'product_review',
  'product_review_like',
];

// ─── Seed 主程式 ──────────────────────────────────────────────────────────

const seed = async () => {
  // ── 小型參考資料表 ──────────────────────────────────────────────────────
  console.log('載入參考資料表...');

  await prisma.genre.createMany({ data: genres, skipDuplicates: true });
  console.log(`✓ genre (${genres.length} 筆)`);

  await prisma.player.createMany({ data: players, skipDuplicates: true });
  console.log(`✓ player (${players.length} 筆)`);

  await prisma.lessonCategory.createMany({
    data: lessonCategories,
    skipDuplicates: true,
  });
  console.log(`✓ lesson_category (${lessonCategories.length} 筆)`);

  await prisma.articleCategory.createMany({
    data: articleCategories,
    skipDuplicates: true,
  });
  console.log(`✓ article_category (${articleCategories.length} 筆)`);

  await prisma.brand.createMany({ data: brands, skipDuplicates: true });
  console.log(`✓ brand (${brands.length} 筆)`);

  await prisma.instrumentCategory.createMany({
    data: instrumentCategories,
    skipDuplicates: true,
  });
  console.log(`✓ instrument_category (${instrumentCategories.length} 筆)`);

  // ── 大型資料表 ──────────────────────────────────────────────────────────
  console.log('\n載入大型資料表...');

  const sql = readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
  const regex = /^INSERT INTO `(\w+)`[\s\S]+?;$/gm;

  // 解析 SQL 並按 LARGE_TABLES 順序執行
  const stmtMap = new Map<string, string[]>();
  for (const match of sql.matchAll(regex)) {
    const table = match[0].match(/INSERT INTO `(\w+)`/)?.[1];
    if (!table || !LARGE_TABLES.includes(table)) continue;
    if (!stmtMap.has(table)) stmtMap.set(table, []);
    stmtMap.get(table)!.push(match[0]);
  }

  let success = 0;
  let failed = 0;

  for (const table of LARGE_TABLES) {
    const stmts = stmtMap.get(table) ?? [];
    for (const stmt of stmts) {
      // 將零值日期替換成合法最小值，避免 MySQL 嚴格模式報錯
      // 不用 NULL 是因為部分欄位為 NOT NULL
      const normalized = stmt
        .replace(/'0000-00-00 00:00:00'/g, "'1970-01-01 00:00:01'")
        .replace(/'0000-00-00'/g, "'1970-01-01'");
      try {
        await prisma.$executeRawUnsafe(normalized);
        console.log(`✓ ${table}`);
        success++;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`✗ ${table}: ${message}`);
        failed++;
      }
    }
  }

  // ── 初始測試帳號 ────────────────────────────────────────────────────────
  console.log('\n新增測試帳號...');

  const hashedPassword = await bcrypt.hash('test1234', 10);
  await prisma.user.upsert({
    where: { id: 116 },
    update: { password: hashedPassword },
    create: {
      id: 116,
      uid: 'test00000001',
      name: '測試帳號',
      email: 'test@test.com',
      password: hashedPassword,
      birthday: new Date('1990-01-01'),
      created_time: new Date(),
      updated_time: new Date(),
      valid: 1,
    },
  });
  console.log('✓ 測試帳號 test@test.com / test1234');

  await prisma.$disconnect();
  console.log(`\n完成：成功 ${success} 筆，失敗 ${failed} 筆`);
};

seed();
