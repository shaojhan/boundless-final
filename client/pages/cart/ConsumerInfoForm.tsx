import styles from './info.module.scss'
import Twzipcode from '@/components/cart/twzipcode'

interface Props {
  name: string
  phone: string
  email: string
  address: string
  setName: (v: string) => void
  setPhone: (v: string) => void
  setEmail: (v: string) => void
  setAddress: (v: string) => void
  postcode: string
  onPostcodeChange: (
    country: string,
    township: string,
    postcode: string,
  ) => void
}

export default function ConsumerInfoForm({
  name,
  phone,
  email,
  address,
  setName,
  setPhone,
  setEmail,
  setAddress,
  postcode,
  onPostcodeChange,
}: Props) {
  return (
    <div className={styles['consumer-info']}>
      <div className={styles['cart-title']}>寄送資訊</div>
      <div className={styles['consumer-info-group']}>
        <div className="flex flex-wrap -mx-3 g-3 items-center">
          <label
            htmlFor="name"
            className={`${styles['col-form-label']} sm:w-1/6 px-6 ${styles['h6']}`}
          >
            購買者姓名
          </label>
          <div
            className={`sm:w-1/4 px-6 w-1/2 px-6 ${styles['consumer-info-input']}`}
          >
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 g-3 items-center">
          <label
            htmlFor="phone"
            className={`${styles['col-form-label']} sm:w-1/6 px-6 ${styles['h6']}`}
          >
            電話號碼
          </label>
          <div
            className={`sm:w-1/4 px-6 w-1/2 px-6 ${styles['consumer-info-input']}`}
          >
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 g-3 items-center">
          <label
            htmlFor="email"
            className={`${styles['col-form-label']} sm:w-1/6 px-6 ${styles['h6']}`}
          >
            電子信箱
          </label>
          <div
            className={`sm:w-5/12 px-6 w-5/6 px-6 ${styles['consumer-info-input']}`}
          >
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 g-3">
          <label
            htmlFor="address"
            className={`${styles['col-form-label']} sm:w-1/6 px-6 ${styles['h6']}`}
          >
            寄送地址
          </label>
          <div className={`${styles['address-location']} sm:w-5/6 px-6`}>
            <Twzipcode
              initPostcode={postcode}
              onPostcodeChange={onPostcodeChange}
            />
            <div className="sm:w-7/12 px-6 w-7/12 px-6">
              <label
                htmlFor="addressinfo"
                className="block text-sm font-medium text-dark mb-1"
              >
                詳細地址
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                id="addressinfo"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
