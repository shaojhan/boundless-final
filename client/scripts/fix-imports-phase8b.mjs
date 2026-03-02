/**
 * Fix missing hook imports introduced by the v2 migration script bug.
 * Adds useMenuToggle / useFilterToggle imports where the hook is used but not imported.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CLIENT = path.resolve(__dirname, '..')

function read(rel) {
  return fs.readFileSync(path.join(CLIENT, rel), 'utf8')
}
function write(rel, src) {
  fs.writeFileSync(path.join(CLIENT, rel), src, 'utf8')
}

/** Safely add a named import if not already in an import declaration */
function ensureImport(src, hookName, hookPath) {
  // Already properly imported?
  if (new RegExp(`import\\s*\\{[^}]*${hookName}[^}]*\\}\\s*from`).test(src))
    return src
  // Not imported — add after last import line
  const lastImportIdx = src.lastIndexOf('\nimport ')
  const endOfLastImport =
    lastImportIdx === -1 ? 0 : src.indexOf('\n', lastImportIdx + 1)
  const insertAt = endOfLastImport + 1
  return (
    src.slice(0, insertAt) +
    `import { ${hookName} } from '${hookPath}'\n` +
    src.slice(insertAt)
  )
}

const MENU_TOGGLE_FILES = [
  'pages/cart/confirm.js',
  'pages/cart/info.js',
  'pages/cart/check.js',
  'pages/instrument/[category]/[puid].js',
  'pages/lesson/[category]/[luid].js',
  'pages/lesson/index.js',
  'pages/instrument/index.js',
  'pages/article/article-list/index.js',
  'pages/article/article-list/sharing.js',
  'pages/article/article-list/comments.js',
  'pages/article/article-list/[auid].js',
  'pages/coupon/couponAdd.js',
  'pages/user/user-homepage/[uid].js',
  'pages/user/user-order.js',
  'pages/user/user-info-edit.js',
  'pages/user/user-favorite.js',
  'pages/user/user-notify.js',
  'pages/user/user-lesson.js',
  'pages/user/user-jam.js',
  'pages/user/user-article.js',
  'pages/user/user-info.js',
  'pages/user/user-coupon.js',
  'pages/article/article-list/article-publish.js',
  'pages/user/user-template.js',
  'pages/jam/recruit-list/form.js',
  'pages/jam/jam-list/edit.js',
  'pages/jam/recruit-list/[juid].js',
  'pages/jam/recruit-list/edit.js',
  'pages/jam/jam-list/[juid].js',
  'pages/article/article-edit/[auid].js',
  'pages/jam/jam-list/index.js',
  'pages/jam/recruit-list/index.js',
  'pages/jam/Q&A.js',
  'pages/index.js',
]

const JAM_FILTER_FILES = [
  'pages/jam/jam-list/index.js',
  'pages/jam/recruit-list/index.js',
]

let count = 0

for (const rel of MENU_TOGGLE_FILES) {
  const fullPath = path.join(CLIENT, rel)
  if (!fs.existsSync(fullPath)) continue
  let src = read(rel)
  if (!/\buseMenuToggle\b/.test(src)) continue // not used — skip
  const fixed = ensureImport(src, 'useMenuToggle', '@/hooks/useMenuToggle')
  if (fixed === src) {
    console.log(`[ok already] ${rel}`)
    continue
  }
  write(rel, fixed)
  count++
  console.log(`✓ added useMenuToggle import  ${rel}`)
}

for (const rel of JAM_FILTER_FILES) {
  const fullPath = path.join(CLIENT, rel)
  if (!fs.existsSync(fullPath)) continue
  let src = read(rel)
  if (!/\buseFilterToggle\b/.test(src)) continue
  const fixed = ensureImport(src, 'useFilterToggle', '@/hooks/useFilterToggle')
  if (fixed === src) {
    console.log(`[ok already] ${rel}`)
    continue
  }
  write(rel, fixed)
  count++
  console.log(`✓ added useFilterToggle import  ${rel}`)
}

console.log(`\n── ${count} imports added ──`)
