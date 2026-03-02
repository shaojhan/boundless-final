/**
 * 格式化價格為本地化字串
 * @example formatPrice(1500) → "1,500"
 * @example formatPrice(null) → ""
 */
export function formatPrice(price: number | null | undefined): string {
  if (price == null) return ''
  return price.toLocaleString()
}
