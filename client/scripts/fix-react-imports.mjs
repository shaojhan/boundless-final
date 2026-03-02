/**
 * Fix missing React hook imports introduced by migration scripts.
 * Finds JS files that use useState/useEffect/useRef without importing them.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pkg from 'fast-glob'
const { glob } = pkg

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CLIENT = path.resolve(__dirname, '..')

const HOOKS = [
  'useState',
  'useEffect',
  'useRef',
  'useCallback',
  'useMemo',
  'useContext',
  'useReducer',
]

const files = await glob(['pages/**/*.js', 'components/**/*.js'], {
  cwd: CLIENT,
  ignore: ['pages/coupon/切版/**'],
})

let totalFixed = 0

for (const rel of files) {
  const fullPath = path.join(CLIENT, rel)
  let src = fs.readFileSync(fullPath, 'utf8')

  // Strip import lines to get non-import code
  const nonImport = src.replace(/^import\s[^\n]+\n/gm, '')

  // Find which hooks are used but not imported
  const missingHooks = HOOKS.filter((hook) => {
    const isUsed = new RegExp(`\\b${hook}\\(`).test(nonImport)
    const isImported = new RegExp(
      `import\\s*\\{[^}]*\\b${hook}\\b[^}]*\\}\\s*from\\s*['"]react['"]`,
    ).test(src)
    return isUsed && !isImported
  })

  if (missingHooks.length === 0) continue

  // Check if there's already a React import we can amend
  const reactImportMatch = src.match(
    /^import\s*\{([^}]*)\}\s*from\s*['"]react['"]/m,
  )
  if (reactImportMatch) {
    // Add missing hooks to existing import
    const existing = reactImportMatch[1]
      .split(',')
      .map((h) => h.trim())
      .filter(Boolean)
    const combined = [...new Set([...existing, ...missingHooks])].sort()
    const newImport = `import { ${combined.join(', ')} } from 'react'`
    src = src.replace(/^import\s*\{[^}]*\}\s*from\s*['"]react['"]/m, newImport)
  } else {
    // No React import — add a new one after the first import line
    const firstImportEnd = src.indexOf('\n') + 1
    src =
      src.slice(0, firstImportEnd) +
      `import { ${missingHooks.join(', ')} } from 'react'\n` +
      src.slice(firstImportEnd)
  }

  fs.writeFileSync(fullPath, src, 'utf8')
  totalFixed++
  console.log(`✓ fixed [${missingHooks.join(', ')}]  ${rel}`)
}

console.log(`\n── ${totalFixed} files fixed ──`)
