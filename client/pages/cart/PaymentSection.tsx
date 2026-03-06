import styles from './info.module.scss'
import Image from 'next/image'
import { FiMinus } from 'react-icons/fi'

interface Props {
  selected: string
  onSelect: (value: string) => void
  sendOrder: () => void
}

export default function PaymentSection({
  selected,
  onSelect,
  sendOrder,
}: Props) {
  return (
    <div
      className={`${styles['cart-instrument']} ${styles['credit-card-info']}`}
    >
      <div className={styles['cart-title']}>付款資訊</div>
      <div className={styles['payment-info-group']}>
        <div className={styles['paymethods']}>
          <div className={styles['paymethod-item']}>
            <input
              type="radio"
              id="transfer"
              value="transfer"
              name="paymethods"
              onChange={() => onSelect('transfer')}
              checked={selected === 'transfer'}
            />
            <label htmlFor="transfer">轉帳匯款</label>
          </div>

          <div className={styles['paymethod-item']}>
            <input
              type="radio"
              id="credit-card"
              value="credit-card"
              name="paymethods"
              onChange={() => onSelect('credit-card')}
              checked={selected === 'credit-card'}
            />
            <label htmlFor="credit-card">信用卡</label>
            <div className={styles['credit-card-pic']}>
              <div
                className={`${styles['credit-card-pic-item']} ${styles['mastercard']}`}
              >
                <Image src="/cart/mastercard.svg" fill alt="" />
              </div>
              <div
                className={`${styles['credit-card-pic-item']} ${styles['mnp']}`}
              >
                <Image src="/cart/mnp.svg" fill alt="" />
              </div>
              <div
                className={`${styles['credit-card-pic-item']} ${styles['visa']}`}
              >
                <Image src="/cart/visa.svg" fill alt="" />
              </div>
            </div>
          </div>

          <div className={styles['paymethod-item']}>
            <input
              type="radio"
              id="mobliepayment"
              value="mobliepayment"
              name="paymethods"
              onChange={() => onSelect('mobliepayment')}
              checked={selected === 'mobliepayment'}
            />
            <label htmlFor="mobliepayment">行動支付</label>
            <div className={styles['credit-card-pic']}>
              <div
                className={styles['mobilepayment-pic-item']}
                style={{ backgroundColor: 'green' }}
              >
                <Image src="/cart/ecpay_logo_w.svg" fill alt="" />
              </div>
            </div>
            <div className={styles['credit-card-pic']}>
              <div className={styles['mobilepayment-pic-item']}>
                <Image src="/cart/linepay.svg" fill alt="" />
              </div>
            </div>
          </div>
        </div>

        <div>
          <hr />
        </div>

        {selected === 'credit-card' && (
          <>
            <div className="flex flex-wrap -mx-3 g-3 items-center">
              <label
                htmlFor="name"
                className={`${styles['col-form-label']} sm:w-1/6 px-6 w-1/4 px-6 ${styles['h6']}`}
              >
                持卡人姓名
              </label>
              <div className="sm:w-1/2 px-6 w-7/12 px-6">
                <input
                  type="text"
                  className={`w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${styles['credit-card-input']}`}
                  id="name"
                  placeholder="Ex:HSIANG-AN, YANG"
                />
              </div>
            </div>
            <div className="flex flex-wrap -mx-3 g-3 items-center">
              <label
                htmlFor="credit-card-number"
                className={`${styles['col-form-label']} sm:w-1/6 px-6 w-1/4 px-6 ${styles['h6']}`}
              >
                信用卡卡號
              </label>
              <div className={styles['creditcard']} style={{ width: '5rem' }}>
                <input
                  type="text"
                  className={`w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${styles['credit-card-input']}`}
                  id="credit-card-number"
                  maxLength={4}
                  style={{ textAlign: 'center' }}
                />
              </div>
              <div className={`w-auto ${styles['minussign']}`}>
                <FiMinus />
              </div>
              <div className={styles['creditcard']} style={{ width: '5rem' }}>
                <input
                  type="text"
                  className={`w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${styles['credit-card-input']}`}
                  id="credit-card-number"
                  maxLength={4}
                  style={{ textAlign: 'center' }}
                />
              </div>
              <div className={`w-auto ${styles['minussign']}`}>
                <FiMinus />
              </div>
              <div className={styles['creditcard']} style={{ width: '5rem' }}>
                <input
                  type="text"
                  className={`w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${styles['credit-card-input']}`}
                  id="credit-card-number"
                  maxLength={4}
                  style={{ textAlign: 'center' }}
                />
              </div>
              <div className={`w-auto ${styles['minussign']}`}>
                <FiMinus />
              </div>
              <div className={styles['creditcard']} style={{ width: '5rem' }}>
                <input
                  type="text"
                  className={`w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${styles['credit-card-input']}`}
                  id="credit-card-number"
                  maxLength={4}
                  style={{ textAlign: 'center' }}
                />
              </div>
            </div>
            <div className="flex flex-wrap -mx-3 g-3 items-center">
              <label
                htmlFor="expiration-date"
                className={`${styles['col-form-label']} sm:w-1/6 px-6 w-1/4 px-6 ${styles['h6']}`}
              >
                有效期限
              </label>
              <div className={styles['creditcard']} style={{ width: '5rem' }}>
                <input
                  type="text"
                  className={`w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${styles['credit-card-input']}`}
                  id="expiration-date"
                  placeholder="MM"
                  maxLength={2}
                  min={1}
                  max={12}
                  style={{ textAlign: 'center' }}
                />
              </div>
              <div className={`w-auto ${styles['minussign']}`}>
                <FiMinus />
              </div>
              <div className={styles['creditcard']} style={{ width: '5rem' }}>
                <input
                  type="text"
                  className={`w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${styles['credit-card-input']}`}
                  id="expiration-date"
                  placeholder="YY"
                  maxLength={2}
                  style={{ textAlign: 'center' }}
                />
              </div>
            </div>
            <div className="flex flex-wrap -mx-3 g-3 items-center">
              <label
                htmlFor="3-number"
                className={`${styles['col-form-label']} sm:w-1/6 px-6 w-1/4 px-6 ${styles['h6']}`}
              >
                背面末三碼
              </label>
              <div className={styles['creditcard']} style={{ width: '5rem' }}>
                <input
                  type="text"
                  className={`w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${styles['credit-card-input']}`}
                  style={{ textAlign: 'center' }}
                  id="3-number"
                  maxLength={3}
                />
              </div>
            </div>
          </>
        )}

        {selected === 'mobliepayment' && (
          <div className={styles['cart-btn']}>
            <div
              className={`${styles['custom-btn']} ${styles['btn-15']} text-center`}
              role="button"
              tabIndex={0}
              onClick={sendOrder}
              onKeyDown={(e) => e.key === 'Enter' && sendOrder()}
            >
              綠界支付
            </div>
            <div
              className={`${styles['custom-btn']} ${styles['btn-6']} text-center`}
              role="button"
              tabIndex={0}
              onClick={() => {}}
              onKeyDown={() => {}}
            >
              LINE PAY
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
