/**
 * Bootstrap → Tailwind CSS 自動遷移腳本
 * 掃描所有 JSX/TSX/JS/TS 檔案，將 Bootstrap class 替換為 Tailwind 等效 class
 */
import fs from 'fs/promises'
import path from 'path'
import fg from 'fast-glob'

// ============================================================
// Bootstrap 間距數字對映（Bootstrap *-N → Tailwind *-M）
// Bootstrap: 1=4px, 2=8px, 3=16px, 4=24px, 5=48px
// Tailwind:  1=4px, 2=8px, 4=16px, 6=24px, 12=48px
// ============================================================
const spacingNumMap = { 0: '0', 1: '1', 2: '2', 3: '4', 4: '6', 5: '12' }

// ============================================================
// Bootstrap 格線系統對映
// ============================================================
function generateColClasses() {
  const map = {}
  const breakpoints = ['', 'sm', 'md', 'lg', 'xl']
  const fractionMap = {
    1: '1/12',
    2: '1/6',
    3: '1/4',
    4: '1/3',
    5: '5/12',
    6: '1/2',
    7: '7/12',
    8: '2/3',
    9: '3/4',
    10: '5/6',
    11: '11/12',
    12: 'full',
  }
  for (const bp of breakpoints) {
    const prefix = bp ? `${bp}:` : ''
    const colKey = bp ? `col-${bp}-` : 'col-'
    for (const [n, frac] of Object.entries(fractionMap)) {
      map[`${colKey}${n}`] = `${prefix}w-${frac} px-3`
    }
    map[bp ? `col-${bp}` : 'col'] = `${prefix}flex-1 px-3`
    map[bp ? `col-${bp}-auto` : 'col-auto'] = `${prefix}w-auto px-3`
  }
  return map
}

// ============================================================
// 主要 class 對映表（長前綴優先排序，避免部分匹配）
// ============================================================
const classMap = {
  // --- Grid ---
  'container-fluid': 'w-full px-4',
  container: 'container mx-auto px-4',
  row: 'flex flex-wrap -mx-3',
  ...generateColClasses(),

  // --- Display ---
  'd-none': 'hidden',
  'd-block': 'block',
  'd-inline': 'inline',
  'd-inline-block': 'inline-block',
  'd-flex': 'flex',
  'd-inline-flex': 'inline-flex',
  'd-grid': 'grid',
  'd-table': 'table',
  'd-table-cell': 'table-cell',
  'd-sm-none': 'sm:hidden',
  'd-sm-block': 'sm:block',
  'd-sm-flex': 'sm:flex',
  'd-sm-inline': 'sm:inline',
  'd-sm-inline-block': 'sm:inline-block',
  'd-sm-inline-flex': 'sm:inline-flex',
  'd-sm-grid': 'sm:grid',
  'd-md-none': 'md:hidden',
  'd-md-block': 'md:block',
  'd-md-flex': 'md:flex',
  'd-md-inline': 'md:inline',
  'd-md-inline-flex': 'md:inline-flex',
  'd-lg-none': 'lg:hidden',
  'd-lg-block': 'lg:block',
  'd-lg-flex': 'lg:flex',
  'd-lg-inline': 'lg:inline',
  'd-xl-none': 'xl:hidden',
  'd-xl-flex': 'xl:flex',

  // --- Flexbox ---
  'flex-column': 'flex-col',
  'flex-column-reverse': 'flex-col-reverse',
  'flex-row-reverse': 'flex-row-reverse',
  'flex-fill': 'flex-1',
  'flex-grow-0': 'grow-0',
  'flex-grow-1': 'grow',
  'flex-shrink-0': 'shrink-0',
  'flex-shrink-1': 'shrink',
  'justify-content-start': 'justify-start',
  'justify-content-end': 'justify-end',
  'justify-content-center': 'justify-center',
  'justify-content-between': 'justify-between',
  'justify-content-around': 'justify-around',
  'justify-content-evenly': 'justify-evenly',
  'justify-content-sm-start': 'sm:justify-start',
  'justify-content-sm-end': 'sm:justify-end',
  'justify-content-sm-center': 'sm:justify-center',
  'justify-content-sm-between': 'sm:justify-between',
  'justify-content-md-start': 'md:justify-start',
  'justify-content-md-end': 'md:justify-end',
  'justify-content-md-center': 'md:justify-center',
  'justify-content-md-between': 'md:justify-between',
  'align-items-start': 'items-start',
  'align-items-end': 'items-end',
  'align-items-center': 'items-center',
  'align-items-baseline': 'items-baseline',
  'align-items-stretch': 'items-stretch',
  'align-items-sm-start': 'sm:items-start',
  'align-items-sm-end': 'sm:items-end',
  'align-items-sm-center': 'sm:items-center',
  'align-items-md-start': 'md:items-start',
  'align-items-md-center': 'md:items-center',
  'align-items-lg-start': 'lg:items-start',
  'align-items-lg-center': 'lg:items-center',
  'align-self-start': 'self-start',
  'align-self-end': 'self-end',
  'align-self-center': 'self-center',
  'align-self-baseline': 'self-baseline',
  'align-self-stretch': 'self-stretch',

  // --- Width / Height ---
  'w-100': 'w-full',
  'w-75': 'w-3/4',
  'w-50': 'w-1/2',
  'w-25': 'w-1/4',
  'w-auto': 'w-auto',
  'h-100': 'h-full',
  'h-75': 'h-3/4',
  'h-50': 'h-1/2',
  'h-25': 'h-1/4',
  'h-auto': 'h-auto',
  'mw-100': 'max-w-full',
  'mh-100': 'max-h-full',
  'vw-100': 'w-screen',
  'vh-100': 'h-screen',
  'min-vw-100': 'min-w-full',
  'min-vh-100': 'min-h-screen',

  // --- Object fit ---
  'object-fit-cover': 'object-cover',
  'object-fit-contain': 'object-contain',
  'object-fit-fill': 'object-fill',
  'object-fit-none': 'object-none',
  'object-fit-scale-down': 'object-scale-down',

  // --- Text alignment ---
  'text-start': 'text-left',
  'text-end': 'text-right',

  // --- Font weight ---
  'fw-thin': 'font-thin',
  'fw-light': 'font-light',
  'fw-normal': 'font-normal',
  'fw-medium': 'font-medium',
  'fw-semibold': 'font-semibold',
  'fw-bold': 'font-bold',
  'fw-bolder': 'font-extrabold',
  'fw-lighter': 'font-extralight',

  // --- Font style ---
  'fst-italic': 'italic',
  'fst-normal': 'not-italic',

  // --- Font size ---
  'fs-1': 'text-4xl',
  'fs-2': 'text-3xl',
  'fs-3': 'text-2xl',
  'fs-4': 'text-xl',
  'fs-5': 'text-lg',
  'fs-6': 'text-base',

  // --- Text transform ---
  'text-lowercase': 'lowercase',
  'text-uppercase': 'uppercase',
  'text-capitalize': 'capitalize',

  // --- Text wrap ---
  'text-wrap': 'whitespace-normal',
  'text-nowrap': 'whitespace-nowrap',
  'text-truncate': 'truncate',
  'text-break': 'break-words',

  // --- Text decoration ---
  'text-decoration-none': 'no-underline',
  'text-decoration-underline': 'underline',
  'text-decoration-line-through': 'line-through',

  // --- Text colors ---
  'text-primary': 'text-primary',
  'text-secondary': 'text-secondary',
  'text-success': 'text-green-600',
  'text-danger': 'text-red',
  'text-warning': 'text-yellow',
  'text-info': 'text-sky-500',
  'text-light': 'text-gray-100',
  'text-dark': 'text-dark',
  'text-muted': 'text-gray-400',
  'text-white': 'text-white',
  'text-black': 'text-black',

  // --- Background colors ---
  'bg-primary': 'bg-primary',
  'bg-secondary': 'bg-secondary',
  'bg-success': 'bg-green-500',
  'bg-danger': 'bg-red',
  'bg-warning': 'bg-yellow',
  'bg-info': 'bg-sky-400',
  'bg-light': 'bg-gray-100',
  'bg-dark': 'bg-dark',
  'bg-white': 'bg-white',
  'bg-transparent': 'bg-transparent',

  // --- Margin auto shortcuts ---
  'mx-auto': 'mx-auto',
  'ms-auto': 'ml-auto',
  'me-auto': 'mr-auto',
  'mt-auto': 'mt-auto',
  'mb-auto': 'mb-auto',
  'm-auto': 'mx-auto',

  // --- Border radius ---
  'rounded-0': 'rounded-none',
  'rounded-1': 'rounded-sm',
  'rounded-3': 'rounded-md',
  'rounded-4': 'rounded-xl',
  'rounded-5': 'rounded-3xl',
  'rounded-circle': 'rounded-full',
  'rounded-pill': 'rounded-full',
  'rounded-top': 'rounded-t',
  'rounded-bottom': 'rounded-b',
  'rounded-start': 'rounded-l',
  'rounded-end': 'rounded-r',

  // --- Border ---
  'border-0': 'border-0',
  'border-primary': 'border-primary',
  'border-secondary': 'border-secondary',
  'border-danger': 'border-red',
  'border-success': 'border-green-500',
  'border-white': 'border-white',
  'border-dark': 'border-dark',

  // --- Position ---
  'position-static': 'static',
  'position-relative': 'relative',
  'position-absolute': 'absolute',
  'position-fixed': 'fixed',
  'position-sticky': 'sticky',

  // --- Coordinates ---
  'top-0': 'top-0',
  'bottom-0': 'bottom-0',
  'start-0': 'left-0',
  'start-50': 'left-1/2',
  'start-100': 'left-full',
  'end-0': 'right-0',
  'end-50': 'right-1/2',
  'end-100': 'right-full',
  'translate-middle': '-translate-x-1/2 -translate-y-1/2',

  // --- Float ---
  'float-start': 'float-left',
  'float-end': 'float-right',
  'float-none': 'float-none',

  // --- Overflow ---
  'overflow-auto': 'overflow-auto',
  'overflow-hidden': 'overflow-hidden',
  'overflow-visible': 'overflow-visible',
  'overflow-scroll': 'overflow-scroll',
  'overflow-x-auto': 'overflow-x-auto',
  'overflow-y-auto': 'overflow-y-auto',
  'overflow-x-hidden': 'overflow-x-hidden',
  'overflow-y-hidden': 'overflow-y-hidden',

  // --- Shadow ---
  'shadow-none': 'shadow-none',
  'shadow-sm': 'shadow-sm',
  'shadow-lg': 'shadow-lg',

  // --- Visibility ---
  invisible: 'invisible',

  // --- Opacity ---
  'opacity-0': 'opacity-0',
  'opacity-25': 'opacity-25',
  'opacity-50': 'opacity-50',
  'opacity-75': 'opacity-75',
  'opacity-100': 'opacity-100',

  // --- Pointer events ---
  'pe-none': 'pointer-events-none',
  'pe-auto': 'pointer-events-auto',

  // --- User select ---
  'user-select-none': 'select-none',
  'user-select-auto': 'select-auto',
  'user-select-all': 'select-all',
}

// ============================================================
// 動態間距 class 產生（m-, p- 等所有前綴 × 數字 0-5）
// ============================================================
function generateSpacingClasses() {
  const map = {}
  const directions = ['', 't', 'b', 'x', 'y']
  const rtlDirs = { ms: 'ml', me: 'mr', ps: 'pl', pe: 'pr' }
  const physicalDirs = { ml: 'ml', mr: 'mr', pl: 'pl', pr: 'pr' }
  const breakpoints = ['', 'sm', 'md', 'lg', 'xl']

  const allPrefixes = [
    // padding / margin standard
    ...['p', 'm'].flatMap((s) => directions.map((d) => `${s}${d}`)),
    // RTL-aware
    ...Object.keys(rtlDirs),
    ...Object.keys(physicalDirs),
  ]

  for (const bsPfx of allPrefixes) {
    // Tailwind prefix: convert RTL to physical
    let twPfx = rtlDirs[bsPfx] ?? physicalDirs[bsPfx] ?? bsPfx
    for (const [bsN, twN] of Object.entries(spacingNumMap)) {
      // base (no breakpoint)
      map[`${bsPfx}-${bsN}`] = `${twPfx}-${twN}`
      // responsive
      for (const bp of breakpoints.slice(1)) {
        map[`${bsPfx}-${bp}-${bsN}`] = `${bp}:${twPfx}-${twN}`
      }
    }
    // auto
    if (
      bsPfx.startsWith('m') ||
      bsPfx.startsWith('ms') ||
      bsPfx.startsWith('me')
    ) {
      const autoTwPfx = rtlDirs[bsPfx] ?? bsPfx
      map[`${bsPfx}-auto`] = `${autoTwPfx}-auto`
      for (const bp of breakpoints.slice(1)) {
        map[`${bsPfx}-${bp}-auto`] = `${bp}:${autoTwPfx}-auto`
      }
    }
  }
  // gap
  for (const [bsN, twN] of Object.entries(spacingNumMap)) {
    map[`gap-${bsN}`] = `gap-${twN}`
    map[`gap-x-${bsN}`] = `gap-x-${twN}`
    map[`gap-y-${bsN}`] = `gap-y-${twN}`
    for (const bp of breakpoints.slice(1)) {
      map[`gap-${bp}-${bsN}`] = `${bp}:gap-${twN}`
    }
  }
  return map
}

// 合併所有對映（間距 class 優先，因為有更長前綴）
const fullMap = {
  ...generateSpacingClasses(),
  ...classMap,
}

// 按 class 名稱長度降序排列，確保長前綴優先匹配
const sortedEntries = Object.entries(fullMap).sort(
  ([a], [b]) => b.length - a.length,
)

// ============================================================
// 核心替換函式
// ============================================================
function replaceBootstrapClasses(content) {
  // 匹配 className 的各種寫法中的字串內容
  // 匹配: "class1 class2", 'class1 class2', `class1 ${expr} class2`
  return content.replace(
    /(?<=className\s*=\s*(?:\{[^}]*?)?)(['"`])([^'"`\n]+?)\1/g,
    (_match, quote, classStr) => {
      let modified = classStr
      for (const [bsClass, twClass] of sortedEntries) {
        // word boundary replacement: match standalone class names
        const regex = new RegExp(
          `(?<![\\w-])${escapeRegex(bsClass)}(?![\\w-])`,
          'g',
        )
        modified = modified.replace(regex, twClass)
      }
      return `${quote}${modified}${quote}`
    },
  )
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ============================================================
// 檔案處理
// ============================================================
async function processFile(filePath) {
  const original = await fs.readFile(filePath, 'utf8')
  const modified = replaceBootstrapClasses(original)
  if (modified !== original) {
    await fs.writeFile(filePath, modified, 'utf8')
    return true
  }
  return false
}

async function main() {
  const clientDir = path.resolve(import.meta.dirname, '..')

  const patterns = [
    'pages/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
  ]

  const files = await fg(patterns, {
    cwd: clientDir,
    absolute: true,
    ignore: ['node_modules/**', '.next/**', '**/*.module.*'],
  })

  console.log(`\n📂 找到 ${files.length} 個檔案待處理...\n`)

  let changed = 0
  let unchanged = 0

  for (const file of files) {
    try {
      const wasChanged = await processFile(file)
      const relPath = path.relative(clientDir, file)
      if (wasChanged) {
        console.log(`  ✅ ${relPath}`)
        changed++
      } else {
        unchanged++
      }
    } catch (err) {
      console.error(`  ❌ ${file}: ${err.message}`)
    }
  }

  console.log(
    `\n✨ 完成！已修改 ${changed} 個檔案，${unchanged} 個檔案無需修改。\n`,
  )
}

main().catch(console.error)
