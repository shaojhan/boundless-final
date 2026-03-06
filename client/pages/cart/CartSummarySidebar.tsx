import styles from './info.module.scss'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils/formatPrice'

interface Props {
  calcInstrumentItems: () => number
  calcLessonItems: () => number
  calcTotalPrice: () => number
  calcTotalDiscount: () => number
}

export default function CartSummarySidebar({
  calcInstrumentItems,
  calcLessonItems,
  calcTotalPrice,
  calcTotalDiscount,
}: Props) {
  return (
    <div className="flex flex-col sticky" style={{ gap: 20, top: 110 }}>
      <div className={`${styles['total']} flex flex-col`} style={{ gap: 20 }}>
        <div className={`flex justify-between ${styles['carttext']}`}>
          <div>商品數量</div>
          <div>
            樂器*{calcInstrumentItems()} 課程*{calcLessonItems()}
          </div>
        </div>
        <div className={`flex justify-between ${styles['carttext']}`}>
          <div>原價合計</div>
          <div>NT ${formatPrice(calcTotalPrice())}</div>
        </div>
        <div
          className={`flex justify-between ${styles['carttext']} ${styles['discount']}`}
        >
          <div>折扣合計</div>
          <div>-NT ${formatPrice(calcTotalDiscount())}</div>
        </div>
        <div className={`flex justify-between ${styles['h3']}`}>
          <div>合計</div>
          <div>NT ${formatPrice(calcTotalPrice() - calcTotalDiscount())}</div>
        </div>
      </div>
      <div className={styles['cart-btn']}>
        <Link
          href="/cart/check"
          className="b-btn b-btn-body flex w-full h-full justify-center"
          style={{ padding: '14px 0' }}
        >
          回上一步
        </Link>
        <Link
          href="/cart/confirm"
          className="b-btn b-btn-primary flex w-full h-full justify-center"
          style={{ padding: '14px 0' }}
        >
          確認付款
        </Link>
      </div>
    </div>
  )
}
