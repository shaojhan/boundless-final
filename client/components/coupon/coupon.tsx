import styles from '@/components/coupon/coupon.module.scss'

function toFold(discount: number): string {
  const v = discount * 10
  return v % 10 === 0 ? `${v / 10}折` : `${v}折`
}

export default function Coupon({
  id: _id,
  name,
  type,
  kind,
  discount,
  valid,
  limit_time,
  created_time: _created_time,
  className: _className,
}: {
  id?: number
  name?: string
  type?: number
  kind?: number
  discount?: number
  valid?: number | boolean
  limit_time?: string
  created_time?: string
  className?: string
}) {
  const isValid = Boolean(valid)
  const kindLabel = kind === 2 ? '課程' : '樂器'
  const discountText =
    type === 1
      ? `NT$${discount ?? 0}`
      : toFold(discount ?? 0)
  const discountSub = type === 1 ? '折抵' : '優惠'

  let leftClass = styles.lesson
  if (!isValid) leftClass = styles.expired
  else if (kind === 1) leftClass = styles.instrument

  return (
    <div className={`${styles.couponCard} ${!isValid ? styles.expired : ''}`}>
      {/* 左色條 */}
      <div className={`${styles.couponLeft} ${leftClass}`}>
        <span className={styles.couponKind}>{kindLabel}</span>
        <span className={styles.couponDiscount}>{discountText}</span>
        <span className={styles.couponDiscountLabel}>{discountSub}</span>
      </div>
      {/* 右內容 */}
      <div className={styles.couponRight}>
        <div className={styles.couponName}>{name ?? '優惠券'}</div>
        <div className={styles.couponExpiry}>到期日：{limit_time ?? '—'}</div>
        <span className={`${styles.couponBadge} ${isValid ? styles.valid : styles.used}`}>
          {isValid ? '未使用' : '已使用'}
        </span>
      </div>
    </div>
  )
}
