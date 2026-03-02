import path from 'path'
import { readFile, writeFile } from 'fs/promises'

export async function loadJson(pathname: string): Promise<unknown> {
  const data = await readFile(path.join(process.cwd(), pathname))
  return JSON.parse(data.toString())
}

export async function insertOneToFile(
  pathname: string,
  prop: string,
  obj: unknown,
): Promise<boolean> {
  const data = (await loadJson(pathname)) as Record<string, unknown[]>
  if (!data || !data[prop]) {
    console.error('something wrong')
    return false
  }
  data[prop].push(obj)

  try {
    await writeFile(path.join(process.cwd(), pathname), JSON.stringify(data))
    return true
  } catch (e) {
    console.error('something wrong:', e)
    return false
  }
}
