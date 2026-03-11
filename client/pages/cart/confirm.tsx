import { apiBaseUrl } from '@/configs'
import { useState, useEffect } from 'react'
import { formatPrice } from '@/lib/utils/formatPrice'
import { authFetch } from '@/lib/api-client'
import Swal from 'sweetalert2'
import Navbar from '@/components/common/navbar'
import NavbarMb from '@/components/common/navbar-mb'
import Footer from '@/components/common/footer'
import Head from 'next/head'
import Link from 'next/link'

//hook
import { useCart } from '@/hooks/use-cart'

// 會員認證hook
import { useAuth } from '@/hooks/user/use-auth'

//confirmlist
import LessonConfirmList from '@/components/cart/confirm-lesson-items'
import InstrumentConfirmList from '@/components/cart/confirm-instrument-items'
import { useFilterToggle } from '@/hooks/useFilterToggle'
import { useMenuToggle } from '@/hooks/useMenuToggle'
import cStyles from './confirm.module.scss'

export default function Test() {
  // localStorage is browser-only; lazy initializer prevents SSR crash
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [UserInfo] = useState<Record<string, any>[]>(() => {
    if (typeof window === 'undefined') return [{}]
    try {
      return JSON.parse(localStorage.getItem('UserInfo') ?? '[]') || [{}]
    } catch {
      return [{}]
    }
  })
  //hook
  const {
    items: cartItems,
    instrumentData,
    lessonData,
    calcInstrumentItems,
    calcInstrumentPrice: _calcInstrumentPrice,
    calcInstrumentDiscount: _calcInstrumentDiscount,
    handleInstrumentSelector: _handleInstrumentSelector,
    calcLessonItems,
    calcLessonPrice: _calcLessonPrice,
    calcLessonDiscount: _calcLessonDiscount,
    handleLessonSelector: _handleLessonSelector,
    calcTotalDiscount,
    calcTotalPrice,
    confirmOrderSubmit,
  } = useCart()

  // ----------------------會員登入狀態 & 會員資料獲取  ----------------------
  //從hook 獲得使用者登入的資訊  儲存在變數LoginUserData裡面
  const { LoginUserData } = useAuth()
  //登出功能

  const uid = LoginUserData?.uid as string | undefined
  // ----------------------手機版本  ----------------------
  // 主選單
  const { showMenu, menuMbToggle } = useMenuToggle()

  // ----------------------假資料  ----------------------

  useFilterToggle()

  const [orderID, setOrderID] = useState(1)

  // Server-calculated price (authoritative — used for display and submission)
  const [serverPrice, setServerPrice] = useState<{
    totalPrice: number
    totalDiscount: number
    finalPayment: number
  } | null>(null)

  const phone = UserInfo[0].Phone
  const email = UserInfo[0].Email
  const address = UserInfo[0].Address
  const country = localStorage.getItem('Country')
  const township = localStorage.getItem('Township')
  const postcode = localStorage.getItem('Postcode')
  const transportationstate = '運送中'
  const cartData = JSON.stringify(cartItems)
  const LessonCUID = localStorage.getItem('LessonCouponCUID')
  const InstrumentCUID = localStorage.getItem('InstrumentCouponCUID')

  // Fetch server-authoritative prices on mount
  useEffect(() => {
    if (!uid || !cartItems.length) return
    let mounted = true
    authFetch(`${apiBaseUrl}/cart/calculate`, {
      method: 'POST',
      body: JSON.stringify({
        cartdata: cartData,
        lessonCUID: LessonCUID,
        instrumentCUID: InstrumentCUID,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return
        if (data.status === 'success') {
          setServerPrice({
            totalPrice: data.totalPrice,
            totalDiscount: data.totalDiscount,
            finalPayment: data.finalPayment,
          })
        }
      })
      .catch(() => {
        /* fallback to client values if network fails */
      })
    return () => { mounted = false }
  }, [uid])

  // Display helpers — prefer server values, fall back to Redux selectors
  const displayTotalPrice = serverPrice?.totalPrice ?? calcTotalPrice()
  const displayTotalDiscount = serverPrice?.totalDiscount ?? calcTotalDiscount()
  const displayFinalPayment =
    serverPrice?.finalPayment ?? calcTotalPrice() - calcTotalDiscount()

  const sendForm = async (): Promise<boolean> => {
    try {
      const res = await authFetch(`${apiBaseUrl}/cart/form`, {
        method: 'POST',
        body: JSON.stringify({
          phone,
          email,
          country: country ?? '',
          township: township ?? '',
          postcode: postcode ?? '',
          address,
          transportationstate,
          cartdata: cartData,
          LessonCUID: LessonCUID ?? 'null',
          InstrumentCUID: InstrumentCUID ?? 'null',
        }),
      })
      const data = await res.json()
      return data.status === 'success'
    } catch {
      return false
    }
  }

  return (
    <>
      <Head>
        <title>結帳確認</title>
      </Head>
      <Navbar menuMbToggle={menuMbToggle} />
      <div className="container mx-auto px-6 relative">
        {/* 手機版主選單/navbar */}
        <div
          className={`menu-mb sm:hidden flex flex-col items-center ${showMenu ? 'menu-mb-show' : ''}`}
        >
          <NavbarMb />
        </div>
        <>
          <div className="cart">
            <h2>購物車</h2>
          </div>
          <div className="flex justify-between cart-process">
            <div className={`flex items-center ballbox ${cStyles.ballboxGap}`}>
              <div className="ball flex items-center justify-center inactive">
                1
              </div>
              <div className="h5 cart-process-text">修改訂單</div>
            </div>
            <div className={`flex items-center ballbox ${cStyles.ballboxGap}`}>
              <div className="ball flex items-center justify-center inactive">
                2
              </div>
              <div className="h5 cart-process-text">填寫訂單資料</div>
            </div>
            <div className={`flex items-center ballbox ${cStyles.ballboxGap}`}>
              <div className="ball flex items-center justify-center active">
                3
              </div>
              <div className="h5 cart-process-text">結帳確認</div>
            </div>
          </div>
          <div className="flex">
            <div className="w-full p-0 cart-main">
              <div className="cart-lesson">
                <div className="cart-title">訂單內容</div>
                <div className="cart-thead">
                  <div className="lesson-product">課程</div>
                  <div className="lesson-price">價格</div>
                  <div className="lesson-payment">實付金額</div>
                </div>
                <div className="cart-item-group">
                  <LessonConfirmList lessonData={lessonData} />
                </div>
                <div className="cart-thead">
                  <div className="instrument-product">樂器</div>
                  <div className="instrument-price">單價</div>
                  <div className="instrument-quantity">數量</div>
                  <div className="instrument-total">總價</div>
                  <div className="instrument-payment">實付金額</div>
                </div>
                <div className="cart-item-group">
                  <InstrumentConfirmList instrumentData={instrumentData} />
                </div>
              </div>
              <div className="consumer-info">
                <div className="cart-title">寄送資訊</div>
                <div className="consumer-info-group">
                  <div className="flex flex-wrap -mx-3 g-3 items-center">
                    <label
                      htmlFor="name"
                      className="flex items-center text-sm font-medium text-dark sm:w-1/6 px-6 w-1/2 px-6 h6"
                    >
                      購買者姓名
                    </label>
                    <div className="sm:w-1/4 px-6 w-1/4 px-6">
                      {UserInfo[0].Name}
                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-3 g-3 items-center">
                    <label
                      htmlFor="phone"
                      className="flex items-center text-sm font-medium text-dark sm:w-1/6 px-6 w-1/2 px-6 h6"
                    >
                      電話號碼
                    </label>
                    <div className="sm:w-1/4 px-6 w-1/3 px-6">
                      {UserInfo[0].Phone}
                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-3 g-3">
                    <label
                      htmlFor="address"
                      className="flex items-center text-sm font-medium text-dark sm:w-1/6 px-6 w-1/2 px-6 h6"
                    >
                      寄送地址
                    </label>
                    <div className="address-location sm:w-5/6 px-6 w-1/2 px-6">
                      <div>{postcode}</div>
                      <div className="w-5/6 px-6 address-location-info">
                        <div>
                          {country} {township}
                        </div>
                        <div>{UserInfo[0].Address}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="cart-instrument credit-card-info">
                <div className="cart-title">付款資訊</div>
                <div className="consumer-info-group">
                  <div className="flex flex-wrap -mx-3 g-3 items-center">
                    <label
                      htmlFor="name"
                      className="flex items-center text-sm font-medium text-dark sm:w-1/6 px-6 h6"
                    >
                      付款方式
                    </label>
                    <div className="sm:w-1/2 px-6">信用卡</div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`flowcart sticky top-0 ${cStyles.flowcartWrapper}`}
            >
              <div
                className={`flex flex-col sticky ${cStyles.sidebarGap}`}
              >
                <div className={`total flex flex-col ${cStyles.innerGap}`}>
                  <div className="flex justify-between carttext">
                    <div>商品數量</div>
                    <div>
                      樂器*{calcInstrumentItems()} 課程*{calcLessonItems()}
                    </div>
                  </div>
                  <div className="flex justify-between carttext">
                    <div>原價合計</div>
                    <div>NT ${formatPrice(displayTotalPrice)}</div>
                  </div>
                  <div className="flex justify-between carttext discount">
                    <div>折扣合計</div>
                    <div>-NT ${formatPrice(displayTotalDiscount)}</div>
                  </div>
                  <div className="flex justify-between h3">
                    <div>合計</div>
                    <div>NT ${formatPrice(displayFinalPayment)}</div>
                  </div>
                </div>
                <div className="cart-btn">
                  <Link
                    href="/cart/info"
                    className={`b-btn b-btn-body flex w-full h-full justify-center ${cStyles.btnPad}`}
                  >
                    回上一步
                  </Link>
                  <div
                    className={`b-btn b-btn-primary flex w-full h-full justify-center ${cStyles.btnPad}`}
                    role="button"
                    tabIndex={0}
                    onClick={async () => {
                      const ok = await sendForm()
                      if (ok) {
                        setOrderID(orderID + 1)
                        localStorage.setItem('orderID', String(orderID))
                        confirmOrderSubmit()
                      } else {
                        Swal.fire({
                          icon: 'error',
                          title: '結帳失敗',
                          text: '訂單建立失敗，請稍後再試。',
                        })
                      }
                    }}
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        const ok = await sendForm()
                        if (ok) {
                          setOrderID(orderID + 1)
                          localStorage.setItem('orderID', String(orderID))
                          confirmOrderSubmit()
                        } else {
                          Swal.fire({
                            icon: 'error',
                            title: '結帳失敗',
                            text: '訂單建立失敗，請稍後再試。',
                          })
                        }
                      }
                    }}
                  >
                    確認付款
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      </div>

      {/* 手機版 */}
      <div className="flow-cart-mb">
        <div className={`flex flex-col sticky ${cStyles.sidebarGap}`}>
          <div className={`total flex flex-col ${cStyles.innerGap}`}>
            <div className="flex justify-between carttext">
              <div>商品數量</div>
              <div>
                樂器*{calcInstrumentItems()} 課程*{calcLessonItems()}
              </div>
            </div>
            <div className="flex justify-between carttext">
              <div>原價合計</div>
              <div>NT ${formatPrice(displayTotalPrice)}</div>
            </div>
            <div className="flex justify-between carttext discount">
              <div>折扣合計</div>
              <div>-NT ${formatPrice(displayTotalDiscount)}</div>
            </div>
            <div className="flex justify-between h3">
              <div>合計</div>
              <div>NT ${formatPrice(displayFinalPayment)}</div>
            </div>
          </div>
          <div className="cart-btn">
            <Link
              href="/cart/info"
              className={`b-btn b-btn-body flex w-full h-full justify-center ${cStyles.btnPad}`}
            >
              回上一步
            </Link>
            <div
              className={`b-btn b-btn-primary flex w-full h-full justify-center ${cStyles.btnPad}`}
              role="button"
              tabIndex={0}
              onClick={async () => {
                setOrderID(orderID + 1)
                localStorage.setItem('orderID', String(orderID))
                await sendForm()
                confirmOrderSubmit()
              }}
              onKeyDown={async (e) => {
                if (e.key === 'Enter') {
                  setOrderID(orderID + 1)
                  localStorage.setItem('orderID', String(orderID))
                  await sendForm()
                  confirmOrderSubmit()
                }
              }}
            >
              確認付款
            </div>
          </div>
        </div>
      </div>
      <Footer />

      <style jsx>{`
        .cart{
          color: black;
          padding: 20px 0;
        }
        .flowcart{
          @media screen and (max-width: 576px) {
            display: none;
          }
        }
        .ballbox{
          @media screen and (max-width: 576px) {
            flex-wrap: wrap;
            justify-content: center;
          }
        }
        .cart-process {
          padding: 8px 40px;
          margin-bottom: 20px;
          @media screen and (max-width: 576px) {
            padding:0 0 0 0;
            gap:25px;
          }
          .cart-process-text{
            font-size:20px;
            text-align: center;
            @media screen and (max-width: 576px) {
              font-size:14px;
              width:100px;
            }
          }
        }
        .cart-main {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .active {
          background: var(--primary-light, #18a1ff);
        }
        .inactive {
          background: var(--body, #b9b9b9);
        }
        .ball {
          color: #fff;
          text-align: center;
          height: 50px;
          width: 50px;
          border-radius: 50%;
          font-family: 'Noto Sans TC';
          font-size: 24px;
          font-style: normal;
          font-weight: 700;
          line-height: normal;
        }
        .h5 {
          color: #000;
          /* h5 */
          font-family: 'Noto Sans TC';
          font-size: 20px;
          font-style: normal;
          font-weight: 400;
          line-height: normal;
        }
        .h3 {
          font-family: 'Noto Sans TC';
          font-size: 28px;
          font-style: normal;
          font-weight: 700;
          line-height: normal;
        }
        .h6 {
          font-family: 'Noto Sans TC';
          font-size: 18px;
          font-style: normal;
          font-weight: 400;
          line-height: normal;
        }
        .carttext {
          font-family: 'Noto Sans TC';
          font-size: 20px;
          font-style: normal;
          font-weight: 700;
          line-height: normal;
        }
        .discount {
          color: var(--primary, #1581cc);
        }
        .total {
          color: black;
          border-radius: 10px;
          border: 1px solid var(--primary, #1581cc);
          padding: 20px;
          align-self: stretch;
          @media screen and (max-width: 576px) {
            border: 0;
            padding: 0;
            gap: 10px !important;
          }
        }
        .cart-btn {
          width: 100%;
          display: flex;
          gap: 20px;

          justify-content: center;
          align-items: center;
          align-self: stretch;
          border-radius: 5px;
          .btn {
            width: 100%;
            padding: 14px 0px !important;
          }
          .btn-prev{
            color: var(--Gray-00, #FFF);

            /* Button Label/Large */
            font-family: Inter;
            font-size: 18px;
            font-style: normal;
            font-weight: 600;
            line-height: 24px; /* 133.333% */
          }
          .btn-next{
            color: var(--Gray-00, #FFF);

            /* Button Label/Large */
            font-family: Inter;
            font-size: 18px;
            font-style: normal;
            font-weight: 600;
            line-height: 24px; /* 133.333% */
          }
        }
        }
        .cart-lesson {
          display: flex;
          gap: 12px;
          flex-direction: column;
          width: 100%;
        }
        .cart-instrument {
          display: flex;
          gap: 12px;
          flex-direction: column;
          width: 100%;
        }
        .cart-title {
          color: var(--white, #fff);
          font-family: 'Noto Sans TC';
          font-size: 24px;
          font-style: normal;
          font-weight: 700;
          line-height: normal;
          background-color: var(--body, #b9b9b9);
          padding: 5px 12px;
        }
        .cart-thead {
          width: 100%;
          padding: 4px 12px;
          height: auto;
          display: grid;
          grid-template-columns: repeat(8, 110px);
          color: var(--primary-deep, #124365);
          font-family: 'Noto Sans TC';
          font-size: 20px;
          font-style: normal;
          font-weight: 700;
          line-height: normal;
          @media screen and (max-width: 576px) {
            grid-template-columns: repeat(4, 1fr);
          }
          .lesson-product {
            grid-row: 1/2;
            grid-column: 1/3;
            @media screen and (max-width: 576px) {
              grid-column: 1/3;
            }
          }
          .lesson-price {
            grid-row: 1/2;
            grid-column: 3/8;
            margin: auto;
            @media screen and (max-width: 576px) {
              grid-column: 3/4;
            }
          }
          .lesson-payment{
            grid-row: 1/2;
            grid-column: 8/9;
            margin: auto;
            @media screen and (max-width: 576px) {
              grid-column: 4/5;
            }
          }
          .instrument-product {
            grid-row: 1/2;
            grid-column: 1/3;
            @media screen and (max-width: 576px) {
              grid-column: 1/3;
            }
          }
          .instrument-price {
            grid-row: 1/2;
            grid-column: 3/5;
            margin: auto;
            @media screen and (max-width: 576px) {
              display: none;
            }
          }
          .instrument-quantity {
            grid-row: 1/2;
            grid-column: 5/6;
            margin: auto;
            @media screen and (max-width: 576px) {
              display: none;
            }
          }
          .instrument-total {
            grid-row: 1/2;
            grid-column: 6/8;
            margin: auto;
            @media screen and (max-width: 576px) {
              grid-column: 3/4;
            }
          }
          .instrument-payment{
            grid-row: 1/2;
            grid-column: 8/9;
            margin: auto;
            @media screen and (max-width: 576px) {
              grid-column: 4/5;
            }
          }
        }
        .cart-item-group {
          gap: 12px;
          padding: 12px;
          color: black;
          }

        .cart-subtotal {
          color: black;
          display: flex;
          padding: 4px 12px;
          justify-content: flex-end;
          align-items: center;
          align-self: stretch;
        }
        .cart-total {
          color: black;
          display: flex;
          padding: 4px 12px;
          justify-content: flex-end;
          align-items: center;
          align-self: stretch;
          .cart-total-text {
            font-family: 'Noto Sans TC';
            font-size: 24px;
            font-style: normal;
            font-weight: 700;
            line-height: normal;
          }
        }
        .delete-btn{
          display: flex;
          gap: 6px;
          padding: 5px 10px;
          vertical-align: center;
        }
        .consumer-info-group {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 12px;
      }
      .address-location{
        display: flex;
        align-items: flex-start;
        align-content: flex-start;
        gap: 12px 45px;
        flex-wrap: wrap;
        @media screen and (max-width: 576px) {
          flex-wrap: nowrap;
          gap: 12px 20px;
        }
      }
      .address-location-info{
        display:flex;
        column-gap:15px;
        @media screen and (max-width: 576px) {
          display:block;
          white-space: pre-wrap;
          overflow-wrap: break-word;
        }
      }

      .credit-card-info{
        color: black;
        .minussign{
          width:12px;
        }
      }
      .consumer-info{
        color: black;
      }
      .flow-cart-mb {
          display: none;
          @media screen and (max-width: 576px) {
            display: block;
            position: sticky;
            bottom: 0;
            left: 0;
            z-index: 100;
            background-color: #FFF;
            padding: 20px 30px;
            }
        }
      `}</style>
    </>
  )
}
