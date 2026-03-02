/**
 * Phase 8b migration: Replace repeated useState/useEffect patterns with shared hooks.
 *
 * - useFilterToggle: replaces filterVisible + document.addEventListener click-outside
 * - useMenuToggle:   replaces showMenu + showSidebar useState boilerplate
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CLIENT = path.resolve(__dirname, '..')

// ────────────────────────────────────────────────────────────
// File lists
// ────────────────────────────────────────────────────────────

const FILTER_TOGGLE_FILES = [
  'pages/cart/confirm.js',
  'pages/cart/check.js',
  'pages/instrument/[category]/[puid].js',
  'pages/lesson/[category]/[luid].js',
  'pages/lesson/index.js',
  'pages/instrument/index.js',
  'pages/article/article-list/[auid].js',
  'pages/user/user-homepage/[uid].js',
  'pages/user/user-order.js',
  'pages/user/user-info-edit.js',
  'pages/user/user-favorite.js',
  'pages/user/user-notify.js',
  'pages/user/user-lesson.js',
  'pages/user/user-article.js',
  'pages/user/user-info.js',
  'pages/user/user-coupon.js',
  'pages/article/article-list/article-publish.js',
  'pages/user/user-template.js',
  'pages/jam/jam-list/index.js',
  'pages/jam/recruit-list/index.js',
  'pages/article/article-edit/[auid].js',
]

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

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function readFile(relPath) {
  return fs.readFileSync(path.join(CLIENT, relPath), 'utf8')
}

function writeFile(relPath, content) {
  fs.writeFileSync(path.join(CLIENT, relPath), content, 'utf8')
}

function fileExists(relPath) {
  return fs.existsSync(path.join(CLIENT, relPath))
}

/**
 * Adds a named import to an existing import line, or adds a new import statement.
 * e.g. addHookImport(src, 'useFilterToggle', '@/hooks/useFilterToggle')
 */
function addHookImport(src, hookName, hookPath) {
  // Already imported?
  if (
    src.includes(`{ ${hookName}`) ||
    src.includes(`, ${hookName}`) ||
    src.includes(`${hookName} }`)
  ) {
    return src
  }
  // Add a new import before the first non-import line (after all existing imports)
  const importLine = `import { ${hookName} } from '${hookPath}'`
  // Insert after last import
  const lastImportIdx = src.lastIndexOf('\nimport ')
  if (lastImportIdx === -1) {
    return importLine + '\n' + src
  }
  const endOfLastImport = src.indexOf('\n', lastImportIdx + 1)
  return (
    src.slice(0, endOfLastImport + 1) +
    importLine +
    '\n' +
    src.slice(endOfLastImport + 1)
  )
}

// ────────────────────────────────────────────────────────────
// useFilterToggle migration
// ────────────────────────────────────────────────────────────

/**
 * Removes the filterVisible useState + useEffect click-outside + stopPropagation + onshow block.
 * Replaces with: const { filterVisible, setFilterVisible, onshow, stopPropagation } = useFilterToggle()
 */
function migrateFilterToggle(src) {
  // Match the block:
  //   const [filterVisible, setFilterVisible] = useState(false)
  //   useEffect(() => {
  //     document.addEventListener('click', (e?) => {
  //       setFilterVisible(false)
  //     }) // optional comment
  //   }, []) // optional comment
  //   // optional comment line(s)
  //   const stopPropagation = (e) => {
  //     e.stopPropagation()
  //   }
  //   // optional comment line(s)
  //   const onshow = (e) => {
  //     stopPropagation(e)
  //     setFilterVisible(!filterVisible)
  //   }

  const pattern = new RegExp(
    // filterVisible useState
    /[ \t]*const \[filterVisible, setFilterVisible\] = useState\(false\)\n/
      .source +
      // useEffect block
      /[ \t]*useEffect\(\(\) => \{\n/.source +
      /[ \t]*document\.addEventListener\('click', \(?(?:e)?\)? => \{\n/.source +
      /[ \t]*setFilterVisible\(false\)\n/.source +
      /[ \t]*\}\)[^\n]*\n/.source + // closing }) with optional comment
      /[ \t]*\}, \[\]\)[^\n]*\n/.source + // }, []) with optional comment
      // optional comment lines before stopPropagation
      /(?:[ \t]*\/\/[^\n]*\n)*/.source +
      // stopPropagation handler
      /[ \t]*const stopPropagation = \(e\) => \{\n/.source +
      /[ \t]*e\.stopPropagation\(\)\n/.source +
      /[ \t]*\}\n/.source +
      // optional comment lines before onshow
      /(?:[ \t]*\/\/[^\n]*\n)*/.source +
      // onshow handler
      /[ \t]*const onshow = \(e\) => \{\n/.source +
      /[ \t]*stopPropagation\(e\)\n/.source +
      /[ \t]*setFilterVisible\(!filterVisible\)\n/.source +
      /[ \t]*\}\n/.source,
    'g',
  )

  const replacement =
    '  const { filterVisible, setFilterVisible, onshow, stopPropagation } = useFilterToggle()\n'

  const newSrc = src.replace(pattern, replacement)
  if (newSrc === src) return { src, changed: false }
  return { src: newSrc, changed: true }
}

// ────────────────────────────────────────────────────────────
// useMenuToggle migration
// ────────────────────────────────────────────────────────────

/**
 * Removes showMenu + showSidebar useState boilerplate.
 * Replaces with: const { showMenu, menuMbToggle, showSidebar, sidebarToggle } = useMenuToggle()
 */
function migrateMenuToggle(src) {
  // Match:
  //   const [showMenu, setShowMenu] = useState(false)
  //   const menuMbToggle = () => {
  //     setShowMenu(!showMenu)
  //   }
  //   const [showSidebar, setShowSidebar] = useState(false)
  //   const sidebarToggle = () => {
  //     setShowSidebar(!showSidebar)
  //   }

  const pattern = new RegExp(
    /[ \t]*const \[showMenu, setShowMenu\] = useState\(false\)\n/.source +
      /[ \t]*const menuMbToggle = \(\) => \{\n/.source +
      /[ \t]*setShowMenu\(!showMenu\)\n/.source +
      /[ \t]*\}\n/.source +
      /[ \t]*const \[showSidebar, setShowSidebar\] = useState\(false\)\n/
        .source +
      /[ \t]*const sidebarToggle = \(\) => \{\n/.source +
      /[ \t]*setShowSidebar\(!showSidebar\)\n/.source +
      /[ \t]*\}\n/.source,
    'g',
  )

  const replacement =
    '  const { showMenu, menuMbToggle, showSidebar, sidebarToggle } = useMenuToggle()\n'

  const newSrc = src.replace(pattern, replacement)
  if (newSrc === src) return { src, changed: false }
  return { src: newSrc, changed: true }
}

// ────────────────────────────────────────────────────────────
// Remove unused useState/useEffect imports
// ────────────────────────────────────────────────────────────

function removeUnusedReactImports(src) {
  // After migration, if useState or useEffect are no longer used, remove from import
  // Count occurrences outside imports
  const nonImportSrc = src.replace(/^import\s[^;]+;?\n/gm, '')
  const needsUseState = /\buseState\b/.test(nonImportSrc)
  const needsUseEffect = /\buseEffect\b/.test(nonImportSrc)

  let result = src
  // Remove useState from react import if no longer needed
  if (!needsUseState) {
    result = result
      .replace(/,\s*useState/, '')
      .replace(/useState,\s*/, '')
      .replace(/\{ useState \}/, '{}')
  }
  // Remove useEffect from react import if no longer needed
  if (!needsUseEffect) {
    result = result
      .replace(/,\s*useEffect/, '')
      .replace(/useEffect,\s*/, '')
      .replace(/\{ useEffect \}/, '{}')
  }
  // Clean up empty imports: import {} from 'react' → remove or keep 'react'
  result = result.replace(/import \{\s*\} from 'react'\n?/g, '')
  return result
}

// ────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────

let filterCount = 0
let menuCount = 0
const skipped = []

// Process filterVisible files
for (const rel of FILTER_TOGGLE_FILES) {
  if (!fileExists(rel)) {
    skipped.push(`[SKIP not found] ${rel}`)
    continue
  }
  let src = readFile(rel)
  const { src: migrated, changed } = migrateFilterToggle(src)
  if (!changed) {
    skipped.push(`[SKIP no match] ${rel}`)
    continue
  }
  let result = addHookImport(
    migrated,
    'useFilterToggle',
    '@/hooks/useFilterToggle',
  )
  result = removeUnusedReactImports(result)
  writeFile(rel, result)
  filterCount++
  console.log(`✓ useFilterToggle  ${rel}`)
}

// Process showMenu files
for (const rel of MENU_TOGGLE_FILES) {
  if (!fileExists(rel)) {
    skipped.push(`[SKIP not found] ${rel}`)
    continue
  }
  let src = readFile(rel)
  const { src: migrated, changed } = migrateMenuToggle(src)
  if (!changed) {
    skipped.push(`[SKIP no match] ${rel}`)
    continue
  }
  let result = addHookImport(migrated, 'useMenuToggle', '@/hooks/useMenuToggle')
  result = removeUnusedReactImports(result)
  writeFile(rel, result)
  menuCount++
  console.log(`✓ useMenuToggle    ${rel}`)
}

console.log('\n──────────────────────────────────────')
console.log(`useFilterToggle: ${filterCount} files migrated`)
console.log(`useMenuToggle:   ${menuCount} files migrated`)
if (skipped.length) {
  console.log('\nSkipped:')
  skipped.forEach((s) => console.log(' ', s))
}
