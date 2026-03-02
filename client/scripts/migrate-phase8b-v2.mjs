/**
 * Phase 8b migration v2: Fix remaining files that didn't match in v1.
 *
 * Handles variant patterns (blank lines, extra comments, shared useEffect, showMenu-only).
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CLIENT = path.resolve(__dirname, '..')

function readFile(rel) {
  return fs.readFileSync(path.join(CLIENT, rel), 'utf8')
}
function writeFile(rel, content) {
  fs.writeFileSync(path.join(CLIENT, rel), content, 'utf8')
}
function fileExists(rel) {
  return fs.existsSync(path.join(CLIENT, rel))
}

function addHookImport(src, hookName, hookPath) {
  if (src.includes(hookName)) return src
  const lastImportIdx = src.lastIndexOf('\nimport ')
  if (lastImportIdx === -1)
    return `import { ${hookName} } from '${hookPath}'\n` + src
  const endOfLastImport = src.indexOf('\n', lastImportIdx + 1)
  return (
    src.slice(0, endOfLastImport + 1) +
    `import { ${hookName} } from '${hookPath}'\n` +
    src.slice(endOfLastImport + 1)
  )
}

function removeUnusedReactImports(src) {
  const nonImportSrc = src.replace(/^import\s[^;]+;?\n/gm, '')
  const needsUseState = /\buseState\b/.test(nonImportSrc)
  const needsUseEffect = /\buseEffect\b/.test(nonImportSrc)
  let result = src
  if (!needsUseState)
    result = result.replace(/,\s*useState/, '').replace(/useState,\s*/, '')
  if (!needsUseEffect)
    result = result.replace(/,\s*useEffect/, '').replace(/useEffect,\s*/, '')
  result = result.replace(/import \{\s*\} from 'react'\n?/g, '')
  return result
}

let changed = 0

// ────────────────────────────────────────────────────────────
// 1. filterToggle with blank line before useEffect (lesson/index.js, user-coupon.js)
// ────────────────────────────────────────────────────────────

const _FILTER_BLANK_LINE_FILES = [
  'pages/lesson/index.js',
  'pages/user/user-coupon.js',
  'pages/jam/recruit-list/index.js', // will be handled separately below
]

// Pattern: optional blank line between useState and useEffect,
//          optional blank line after }, [])
const filterPatternFlexible = new RegExp(
  /[ \t]*const \[filterVisible, setFilterVisible\] = useState\(false\)\n/
    .source +
    /(?:\n)?/.source + // optional blank line
    /[ \t]*useEffect\(\(\) => \{\n/.source +
    /[ \t]*document\.addEventListener\('click', \(?(?:e)?\)? => \{\n/.source +
    /[ \t]*setFilterVisible\(false\)\n/.source +
    /[ \t]*\}\)[^\n]*\n/.source +
    /[ \t]*\}, \[\]\)[^\n]*\n/.source +
    /(?:\n)?/.source + // optional blank line
    /(?:[ \t]*\/\/[^\n]*\n)*/.source +
    /[ \t]*const stopPropagation = \(e\) => \{\n/.source +
    /[ \t]*e\.stopPropagation\(\)\n/.source +
    /[ \t]*\}\n/.source +
    /(?:[ \t]*\/\/[^\n]*\n)*/.source +
    /[ \t]*const onshow = \(e\) => \{\n/.source +
    /[ \t]*stopPropagation\(e\)\n/.source +
    /[ \t]*setFilterVisible\(!filterVisible\)\n/.source +
    /[ \t]*\}\n/.source,
  'g',
)

for (const rel of ['pages/lesson/index.js', 'pages/user/user-coupon.js']) {
  if (!fileExists(rel)) continue
  let src = readFile(rel)
  if (src.includes('useFilterToggle')) {
    console.log(`[already done] ${rel}`)
    continue
  }
  const newSrc = src.replace(
    filterPatternFlexible,
    '  const { filterVisible, setFilterVisible, onshow, stopPropagation } = useFilterToggle()\n',
  )
  if (newSrc === src) {
    console.log(`[still no match] ${rel}`)
    continue
  }
  let result = addHookImport(
    newSrc,
    'useFilterToggle',
    '@/hooks/useFilterToggle',
  )
  result = removeUnusedReactImports(result)
  writeFile(rel, result)
  changed++
  console.log(`✓ useFilterToggle (flexible)  ${rel}`)
}

// ────────────────────────────────────────────────────────────
// 2. jam-list/index.js + recruit-list/index.js
//    Special: filterVisible is inside a shared useEffect.
//    Strategy: remove only the standalone useState + stopPropagation + onshow,
//    add useFilterToggle() which re-registers a separate click listener.
//    The existing useEffect stays but loses the document.addEventListener line.
// ────────────────────────────────────────────────────────────

const JAM_FILTER_FILES = [
  'pages/jam/jam-list/index.js',
  'pages/jam/recruit-list/index.js',
]

// Remove: const [filterVisible, setFilterVisible] = useState(false)\n  //comment\n  useEffect(() => {\n    ...\n    document.addEventListener...\n  }, [])\n
// Keep the rest of the useEffect content but drop the document.addEventListener inside it.
// Then also remove standalone stopPropagation + onshow handlers.

function migrateJamFilterToggle(src) {
  // Step 1: Remove document.addEventListener line inside the useEffect
  src = src.replace(
    /[ \t]*document\.addEventListener\('click', \(\) => \{\n[ \t]*setFilterVisible\(false\)\n[ \t]*\}\)\n/g,
    '',
  )

  // Step 2: Remove standalone useState for filterVisible (it's now managed by the hook)
  src = src.replace(
    /[ \t]*const \[filterVisible, setFilterVisible\] = useState\(false\)\n/,
    '',
  )

  // Step 3: Remove stopPropagation handler
  src = src.replace(
    /[ \t]*\/\/ 阻止事件冒泡造成篩選表單關閉\n[ \t]*const stopPropagation = \(e\) => \{\n[ \t]*e\.stopPropagation\(\)\n[ \t]*\}\n/,
    '',
  )

  // Step 4: Remove onshow handler
  src = src.replace(
    /[ \t]*\/\/ 顯示表單\n[ \t]*const onshow = \(e\) => \{\n[ \t]*stopPropagation\(e\)\n[ \t]*setFilterVisible\(!filterVisible\)\n[ \t]*\}\n/,
    '',
  )

  // Step 5: Add hook call — insert before the showMenu block
  src = src.replace(
    /( *)(const \[showMenu, setShowMenu\] = useState\(false\))/,
    '$1const { filterVisible, setFilterVisible, onshow, stopPropagation } = useFilterToggle()\n$1$2',
  )

  return src
}

for (const rel of JAM_FILTER_FILES) {
  if (!fileExists(rel)) continue
  let src = readFile(rel)
  if (src.includes('useFilterToggle')) {
    console.log(`[already done] ${rel}`)
    continue
  }
  let result = migrateJamFilterToggle(src)
  result = addHookImport(result, 'useFilterToggle', '@/hooks/useFilterToggle')
  result = removeUnusedReactImports(result)
  writeFile(rel, result)
  changed++
  console.log(`✓ useFilterToggle (jam special) ${rel}`)
}

// ────────────────────────────────────────────────────────────
// 3. useMenuToggle — flexible regex (allows optional comment/blank between blocks)
// ────────────────────────────────────────────────────────────

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

// Pattern with both showMenu + showSidebar, allowing optional comment/blank lines between
const menuBothPattern = new RegExp(
  /[ \t]*const \[showMenu, setShowMenu\] = useState\(false\)\n/.source +
    /[ \t]*const menuMbToggle = \(\) => \{\n/.source +
    /[ \t]*setShowMenu\(!showMenu\)\n/.source +
    /[ \t]*\}\n/.source +
    /(?:[ \t]*\/\/[^\n]*\n|[ \t]*\n)*/.source + // optional blank/comment lines
    /[ \t]*const \[showSidebar, setShowSidebar\] = useState\(false\)\n/.source +
    /[ \t]*const sidebarToggle = \(\) => \{\n/.source +
    /[ \t]*setShowSidebar\(!showSidebar\)\n/.source +
    /[ \t]*\}\n/.source,
  'g',
)

// Pattern for showMenu only (no showSidebar — e.g. cart/info.js)
const menuOnlyPattern = new RegExp(
  /[ \t]*const \[showMenu, setShowMenu\] = useState\(false\)\n/.source +
    /[ \t]*const menuMbToggle = \(\) => \{\n/.source +
    /[ \t]*setShowMenu\(!showMenu\)\n/.source +
    /[ \t]*\}\n/.source,
  'g',
)

for (const rel of MENU_TOGGLE_FILES) {
  if (!fileExists(rel)) continue
  let src = readFile(rel)
  if (src.includes('useMenuToggle')) {
    console.log(`[already done] ${rel}`)
    continue
  }

  const hasBoth = /const \[showSidebar, setShowSidebar\]/.test(src)

  let newSrc
  if (hasBoth) {
    newSrc = src.replace(
      menuBothPattern,
      '  const { showMenu, menuMbToggle, showSidebar, sidebarToggle } = useMenuToggle()\n',
    )
  } else {
    // showMenu only — destructure just those two
    newSrc = src.replace(
      menuOnlyPattern,
      '  const { showMenu, menuMbToggle } = useMenuToggle()\n',
    )
  }

  if (newSrc === src) {
    console.log(`[still no match] ${rel}`)
    continue
  }
  let result = addHookImport(newSrc, 'useMenuToggle', '@/hooks/useMenuToggle')
  result = removeUnusedReactImports(result)
  writeFile(rel, result)
  changed++
  console.log(`✓ useMenuToggle    ${rel}`)
}

console.log(`\n── Total: ${changed} files migrated ──`)
