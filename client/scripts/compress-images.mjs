/**
 * Batch compress images in public/instrument/
 * - jpg/jpeg: quality 80
 * - png: quality 80 (png compression)
 * - webp/avif: skip (already optimized)
 *
 * Usage: node scripts/compress-images.mjs
 */

import sharp from 'sharp'
import { readdir, rename, stat, unlink } from 'fs/promises'
import { join, extname } from 'path'

const TARGET_DIR = new URL('../public/instrument', import.meta.url).pathname
const QUALITY = 80

async function* walkDir(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      yield* walkDir(fullPath)
    } else {
      yield fullPath
    }
  }
}

async function compressImage(filePath) {
  const ext = extname(filePath).toLowerCase()

  if (ext === '.jpg' || ext === '.jpeg') {
    await sharp(filePath)
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toFile(filePath + '.tmp')
  } else if (ext === '.png') {
    await sharp(filePath)
      .png({ quality: QUALITY, compressionLevel: 9 })
      .toFile(filePath + '.tmp')
  } else {
    return null // skip webp, avif, etc.
  }

  // replace original with compressed version
  const before = (await stat(filePath)).size
  await rename(filePath + '.tmp', filePath)
  const after = (await stat(filePath)).size
  return { before, after }
}

async function main() {
  let totalBefore = 0
  let totalAfter = 0
  let processed = 0
  let skipped = 0
  let errors = 0

  console.log(`Scanning ${TARGET_DIR}...`)

  for await (const filePath of walkDir(TARGET_DIR)) {
    const ext = extname(filePath).toLowerCase()
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
      skipped++
      continue
    }

    try {
      const result = await compressImage(filePath)
      if (result) {
        totalBefore += result.before
        totalAfter += result.after
        processed++
        const savedPct = (
          ((result.before - result.after) / result.before) *
          100
        ).toFixed(1)
        console.log(
          `✓ ${filePath.replace(TARGET_DIR, '')}  ${(result.before / 1024).toFixed(0)}KB → ${(result.after / 1024).toFixed(0)}KB (-${savedPct}%)`,
        )
      }
    } catch (err) {
      console.error(`✗ ${filePath}: ${err.message}`)
      // clean up .tmp if it exists
      await unlink(filePath + '.tmp').catch(() => {})
      errors++
    }
  }

  const totalSaved = totalBefore - totalAfter
  console.log('\n========== Summary ==========')
  console.log(`Processed : ${processed} files`)
  console.log(`Skipped   : ${skipped} files (webp/avif/other)`)
  console.log(`Errors    : ${errors} files`)
  console.log(`Before    : ${(totalBefore / 1024 / 1024).toFixed(1)} MB`)
  console.log(`After     : ${(totalAfter / 1024 / 1024).toFixed(1)} MB`)
  console.log(
    `Saved     : ${(totalSaved / 1024 / 1024).toFixed(1)} MB (${((totalSaved / totalBefore) * 100).toFixed(1)}%)`,
  )
}

main().catch(console.error)
