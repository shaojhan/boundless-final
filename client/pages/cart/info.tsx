import { apiBaseUrl } from '@/configs'
import { useEffect, useState } from 'react'
import Navbar from '@/components/common/navbar'
import NavbarMb from '@/components/common/navbar-mb'
import Footer from '@/components/common/footer'
import Head from 'next/head'
import { useCart } from '@/hooks/use-cart'
import { useMenuToggle } from '@/hooks/useMenuToggle'
import styles from './info.module.scss'
import ConsumerInfoForm from './ConsumerInfoForm'
import PaymentSection from './PaymentSection'
import CartSummarySidebar from './CartSummarySidebar'

export default function Test() {
  const {
    calcInstrumentItems,
    calcLessonItems,
    calcTotalDiscount,
    calcTotalPrice,
  } = useCart()

  const [selected, setSeleted] = useState('credit-card')

  const [name, setName] = useState(() => {
    try { return JSON.parse(localStorage.getItem('UserInfo') ?? '')[0]?.Name || '' } catch { return '' }
  })
  const [phone, setPhone] = useState(() => {
    try { return JSON.parse(localStorage.getItem('UserInfo') ?? '')[0]?.Phone || '' } catch { return '' }
  })
  const [email, setEmail] = useState(() => {
    try { return JSON.parse(localStorage.getItem('UserInfo') ?? '')[0]?.Email || '' } catch { return '' }
  })
  const [address, setAddress] = useState(() => {
    try { return JSON.parse(localStorage.getItem('UserInfo') ?? '')[0]?.Address || '' } catch { return '' }
  })

  const UserInfo = JSON.stringify([
    { Name: name, Phone: phone, Email: email, Address: address },
  ])

  useEffect(() => {
    localStorage.setItem('UserInfo', UserInfo)
  }, [UserInfo])

  const [data, setData] = useState({
    country: localStorage.getItem('Country') || '',
    township: localStorage.getItem('Township') || '',
    postcode: localStorage.getItem('Postcode') || '',
  })

  const sendOrder = async () => {
    await fetch(`${apiBaseUrl}/order/sendorder`, {
      method: 'GET',
      credentials: 'include',
    })
  }

  const { showMenu, menuMbToggle } = useMenuToggle()

  const summaryProps = { calcInstrumentItems, calcLessonItems, calcTotalPrice, calcTotalDiscount }

  return (
    <>
      <Head>
        <title>填寫訂單資料</title>
      </Head>
      <Navbar menuMbToggle={menuMbToggle} />
      <div className="container mx-auto px-6 relative">
        <div
          className={`menu-mb sm:hidden flex flex-col items-center ${showMenu ? 'menu-mb-show' : ''}`}
        >
          <NavbarMb />
        </div>
        <>
          <div className={styles['cart']}>
            <h2>購物車</h2>
          </div>
          <div className={`flex justify-between ${styles['cart-process']}`}>
            <div className={`flex items-center ${styles['ballbox']}`} style={{ gap: 10 }}>
              <div className={`${styles['ball']} flex items-center justify-center ${styles['inactive']}`}>
                1
              </div>
              <div className={`${styles['h5']} ${styles['cart-process-text']}`}>修改訂單</div>
            </div>
            <div className={`flex items-center ${styles['ballbox']}`} style={{ gap: 10 }}>
              <div className={`${styles['ball']} flex items-center justify-center ${styles['active']}`}>
                2
              </div>
              <div className={`${styles['h5']} ${styles['cart-process-text']}`}>填寫訂單資料</div>
            </div>
            <div className={`flex items-center ${styles['ballbox']}`} style={{ gap: 10 }}>
              <div className={`${styles['ball']} flex items-center justify-center ${styles['inactive']}`}>
                3
              </div>
              <div className={`${styles['h5']} ${styles['cart-process-text']}`}>結帳確認</div>
            </div>
          </div>
          <div className="flex">
            <div className={`w-full p-0 ${styles['cart-main']}`}>
              <ConsumerInfoForm
                name={name}
                phone={phone}
                email={email}
                address={address}
                setName={setName}
                setPhone={setPhone}
                setEmail={setEmail}
                setAddress={setAddress}
                postcode={data.postcode}
                onPostcodeChange={(country, township, postcode) =>
                  setData({ country, township, postcode })
                }
              />
              <PaymentSection
                selected={selected}
                onSelect={setSeleted}
                sendOrder={sendOrder}
              />
            </div>
            <div
              className={`sticky top-0 ${styles['flowcart']}`}
              style={{ height: '100vh', paddingInline: 20, flex: '0 0 440px' }}
            >
              <CartSummarySidebar {...summaryProps} />
            </div>
          </div>
        </>
      </div>
      <div className={styles['flow-cart-mb']}>
        <CartSummarySidebar {...summaryProps} />
      </div>
      <Footer />
    </>
  )
}
