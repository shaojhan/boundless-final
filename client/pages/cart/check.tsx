import Navbar from '@/components/common/navbar'
import NavbarMb from '@/components/common/navbar-mb'
import Footer from '@/components/common/footer'
import Head from 'next/head'
import Link from 'next/link'

//css module

//cart-list
import LessonList from '@/components/cart/lesson-cart-list'
import InstrumentList from '@/components/cart/instrument-cart-list'
import InstrumentCouponList from '@/components/cart/instrument-coupons'
import LessonCouponList from '@/components/cart/lesson-coupons'

//hook
import { useCart } from '@/hooks/use-cart'
import { formatPrice } from '@/lib/utils/formatPrice'
import { useFilterToggle } from '@/hooks/useFilterToggle'
import { useMenuToggle } from '@/hooks/useMenuToggle'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function Test() {
  //hook
  const {
    items,
    instrumentData,
    instrumentCoupons,
    lessonData,
    lessonCoupons,
    increment_cart,
    decrement_cart,
    remove,
    calcInstrumentItems,
    calcInstrumentPrice,
    calcInstrumentDiscount,
    handleInstrumentSelector,
    calcLessonItems,
    calcLessonPrice,
    calcLessonDiscount,
    handleLessonSelector,
    calcTotalDiscount,
    calcTotalPrice,
    redeemCoupon,
  } = useCart()

  const [couponCode, setCouponCode] = useState('')
  const [redeeming, setRedeeming] = useState(false)

  const handleRedeem = async () => {
    if (!couponCode.trim()) return
    setRedeeming(true)
    const result = await redeemCoupon(couponCode.trim())
    setRedeeming(false)
    if (result.success) {
      toast.success(result.message, { duration: 3000 })
      setCouponCode('')
    } else {
      toast.error(result.message, { duration: 3000 })
    }
  }
  // ----------------------手機版本  ----------------------
  // 主選單
  const { showMenu, menuMbToggle } = useMenuToggle()
  // ----------------------假資料  ----------------------
  useFilterToggle()

  return (
    <>
      <Head>
        <title>修改訂單</title>
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
            <div
              className="flex items-center ballbox step1"
              style={{ gap: 10 }}
            >
              <div className="ball flex items-center justify-center active">
                1
              </div>
              <div className="h5 cart-process-text">修改訂單</div>
            </div>
            <div
              className="flex items-center ballbox step2"
              style={{ gap: 10 }}
            >
              <div className="ball flex items-center justify-center inactive">
                2
              </div>
              <div className="h5 cart-process-text">填寫訂單資料</div>
            </div>
            <div
              className="flex items-center ballbox step3"
              style={{ gap: 10 }}
            >
              <div className="ball flex items-center justify-center inactive">
                3
              </div>
              <div className="h5 cart-process-text">結帳確認</div>
            </div>
          </div>
          <div className="flex">
            <div className="w-full p-0 cart-main">
              <div className="cart-lesson">
                <div className="cart-title">課程</div>
                <div className="cart-thead">
                  <div className="lesson-product">商品</div>
                  <div className="lesson-price">售價</div>
                </div>
                <LessonList
                  items={items}
                  lessonData={lessonData}
                  remove={remove}
                />
                <div className="cart-subtotal h6">
                  原價 NT$ {formatPrice(calcLessonPrice())}
                </div>
                <div className="cart-coupon">
                  <div className="coupon-selector">
                    <div className="cart-coupon-text">優惠券</div>
                    <div>
                      <LessonCouponList
                        lessonCoupons={lessonCoupons}
                        handleLessonSelector={handleLessonSelector}
                      />
                    </div>
                  </div>
                  <div className="cart-discount h6">
                    折扣 -NT$
                    {formatPrice(calcLessonDiscount())}
                  </div>
                </div>
                <div className="cart-total">
                  <div className="cart-total-text">
                    小計 NT${' '}
                    {formatPrice(calcLessonPrice() - calcLessonDiscount())}
                  </div>
                </div>
              </div>
              <div className="cart-redeem">
                <div className="cart-title">折扣碼</div>
                <div className="redeem-body">
                  <input
                    className="redeem-input"
                    type="text"
                    placeholder="輸入折扣碼"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
                    maxLength={12}
                  />
                  <button
                    className="b-btn b-btn-primary redeem-btn"
                    onClick={handleRedeem}
                    disabled={redeeming || !couponCode.trim()}
                  >
                    {redeeming ? '兌換中...' : '兌換'}
                  </button>
                </div>
              </div>
              <div className="cart-instrument">
                <div className="cart-title">樂器</div>
                <div className="cart-thead">
                  <div className="instrument-product">商品</div>
                  <div className="instrument-price">單價</div>
                  <div className="instrument-quantity">數量</div>
                  <div className="instrument-total">總價</div>
                </div>
                <InstrumentList
                  items={items}
                  instrumentData={instrumentData}
                  increment_cart={increment_cart}
                  decrement_cart={decrement_cart}
                  remove={remove}
                />
                <div className="cart-subtotal h6">
                  原價 NT$ {formatPrice(calcInstrumentPrice())}
                </div>
                <div className="cart-coupon">
                  <div className="coupon-selector">
                    <div className="cart-coupon-text">優惠券</div>
                    <div>
                      <InstrumentCouponList
                        instrumentCoupons={instrumentCoupons}
                        handleInstrumentSelector={handleInstrumentSelector}
                      />
                    </div>
                  </div>
                  <div className="cart-discount h6">
                    折扣 -NT$ {formatPrice(calcInstrumentDiscount())}
                  </div>
                </div>
                <div className="cart-total">
                  <div className="cart-total-text">
                    小計 NT${' '}
                    {formatPrice(
                      calcInstrumentPrice() - calcInstrumentDiscount(),
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div
              className="flowcart sticky top-0"
              style={{ height: '100vh', paddingInline: 20, flex: '0 0 440px' }}
            >
              <div
                className="flex flex-col sticky"
                style={{ gap: 20, top: 110 }}
              >
                <div className="total flex flex-col" style={{ gap: 20 }}>
                  <div className="flex justify-between carttext">
                    <div>商品數量</div>
                    <div>
                      樂器*{calcInstrumentItems()} 課程*{calcLessonItems()}
                    </div>
                  </div>
                  <div className="flex justify-between carttext">
                    <div>原價合計</div>
                    <div>NT ${formatPrice(calcTotalPrice())}</div>
                  </div>
                  <div className="flex justify-between carttext discount">
                    <div>折扣合計</div>
                    <div>-NT ${formatPrice(calcTotalDiscount())}</div>
                  </div>
                  <div className="flex justify-between h3">
                    <div>合計</div>
                    <div>
                      NT ${formatPrice(calcTotalPrice() - calcTotalDiscount())}
                    </div>
                  </div>
                </div>
                <div className="cart-btn">
                  <Link
                    href="/cart/info"
                    className="b-btn b-btn-primary flex w-full h-full justify-center"
                    style={{ padding: '14px 0' }}
                  >
                    結帳
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      </div>
      <div className="flow-cart-mb">
        <div className="flex flex-col sticky" style={{ gap: 20, top: 110 }}>
          <div className="total flex flex-col" style={{ gap: 20 }}>
            <div className="flex justify-between carttext">
              <div>商品數量</div>
              <div>
                樂器*{calcInstrumentItems()} 課程*{calcLessonItems()}
              </div>
            </div>
            <div className="flex justify-between carttext">
              <div>原價合計</div>
              <div>NT ${formatPrice(calcTotalPrice())}</div>
            </div>
            <div className="flex justify-between carttext discount">
              <div>折扣合計</div>
              <div>-NT ${formatPrice(calcTotalDiscount())}</div>
            </div>
            <div className="flex justify-between h3">
              <div>合計</div>
              <div>
                NT ${formatPrice(calcTotalPrice() - calcTotalDiscount())}
              </div>
            </div>
          </div>
          <div className="cart-btn">
            <Link
              href="/cart/info"
              className="b-btn b-btn-primary flex w-full h-full justify-center"
              style={{ padding: '14px 0' }}
            >
              結帳
            </Link>
          </div>
        </div>
      </div>
      <Footer />

      <style jsx>{`
        .cart {
          color: black;
          padding: 20px 0;
        }
        .flowcart {
          @media screen and (max-width: 576px) {
            display: none;
          }
        }
        .ballbox {
          @media screen and (max-width: 576px) {
            flex-wrap: wrap;
            justify-content: center;
          }
        }
        .cart-process {
          padding: 8px 40px;
          margin-bottom: 20px;
          @media screen and (max-width: 576px) {
            padding: 0 0 0 0;
            gap: 25px;
          }
          .cart-process-text {
            font-size: 20px;
            text-align: center;
            @media screen and (max-width: 576px) {
              font-size: 14px;
              width: 100px;
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
          justify-content: center;
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
            display: none;
          }
          .lesson-product {
            grid-row: 1/2;
            grid-column: 1/4;
          }
          .lesson-price {
            grid-area: lesson-price;
            grid-row: 1/2;
            grid-column: 4/9;
          }
          .instrument-product {
            grid-row: 1/2;
            grid-column: 1/4;
          }
          .instrument-price {
            grid-row: 1/2;
            grid-column: 4/5;
          }
          .instrument-quantity {
            grid-row: 1/2;
            grid-column: 5/7;
            margin: auto;
          }
          .instrument-total {
            grid-row: 1/2;
            grid-column: 7/8;
          }
        }
        .cart-item-group {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          padding: 12px;
          color: black;

          .instrument-item {
            display: grid;
            place-content: center;
            grid-template-columns: repeat(8, 110px);
            @media screen and (max-width: 576px) {
              grid-template-columns: repeat(3, 132px);
              grid-template-rows: repeat(4, 33px);
            }
            .instrument-item-pic {
              width: 110px;
              height: 110px;
              grid-column: 1/2;
              overflow: hidden;
              position: relative;
              & img {
                width: auto;
                height: auto;
                object-fit: cover;
              }
              @media screen and (max-width: 576px) {
                width: 132px;
                height: 132px;
                grid-column: 1/2;
                grid-row: 1/4;
              }
            }
            .instrument-item-name {
              grid-row: 1/2;
              grid-column: 2/4;
              margin-block: auto;
              padding-left: 10px;
              @media screen and (max-width: 576px) {
                grid-row: 1/2;
                grid-column: 2/4;
              }
            }
            .instrument-item-price {
              grid-row: 1/2;
              grid-column: 4/5;
              margin-block: auto;
              @media screen and (max-width: 576px) {
                padding-left: 10px;
                grid-row: 2/3;
                grid-column: 2/4;
              }
            }
            .instrument-item-quantity {
              padding: 0 26px;
              grid-row: 1/2;
              grid-column: 5/7;
              margin-block: auto;
              @media screen and (max-width: 576px) {
                padding-left: 10px;
                padding-right: 0;
                grid-row: 3/4;
                grid-column: 2/3;
              }
            }
            .instrument-item-total {
              grid-row: 1/2;
              grid-column: 7/8;
              margin-block: auto;
              @media screen and (max-width: 576px) {
                display: none;
              }
            }
            .instrument-button {
              grid-row: 1/2;
              grid-column: 8/9;
              margin: auto;
              @media screen and (max-width: 576px) {
                grid-row: 4/5;
                grid-column: 3/4;
                margin-right: 0;
              }
            }
            .quantity-left-minus {
              margin: auto;

              width: 40px;
              height: 40px;

              @media screen and (max-width: 576px) {
                width: 32px;
                height: 32px;
                padding: 0;
              }
            }
            .quantity-right-plus {
              width: 40px;
              height: 40px;
              @media screen and (max-width: 576px) {
                width: 32px;
                height: 32px;
                padding: 0;
              }
            }
            .input-number {
              text-align: center;
              color: #000;

              /* sidebar-font */
              font-family: 'Noto Sans TC';
              font-size: 16px;
              font-style: normal;
              font-weight: 700;
              line-height: normal;
              @media screen and (max-width: 576px) {
                padding: 0;
                text-align: center;
              }
            }
          }
        }

        .cart-redeem {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          .redeem-body {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 0 12px;
          }
          .redeem-input {
            flex: 1;
            max-width: 320px;
            padding: 8px 12px;
            border: 1px solid var(--primary, #1581cc);
            border-radius: 6px;
            font-family: 'Noto Sans TC';
            font-size: 16px;
            outline: none;
            &:focus {
              border-color: var(--primary-deep, #124365);
            }
          }
          .redeem-btn {
            padding: 8px 20px;
            white-space: nowrap;
            &:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
          }
        }
        .cart-coupon {
          display: flex;
          padding: 0 12px;
          .coupon-selector {
            display: flex;
            align-items: center;
            gap: 20px;
            @media screen and (max-width: 576px) {
              gap: 0;
              width: 200px;
            }
          }
          .cart-coupon-text {
            color: black;
            font-family: Inter;
            font-size: 20px;
            font-style: normal;
            font-weight: 400;
            line-height: 24px; /* 120% */
            @media screen and (max-width: 576px) {
              font-size: 18px;
              width: 100px;
            }
          }
          .cart-discount {
            color: var(--primary, #1581cc);
            grid-column: 7/9;
            margin-left: auto;
          }
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
        .delete-btn {
          display: flex;
          gap: 6px;
          padding: 5px 10px;
          vertical-align: center;
        }
        .flow-cart-mb {
          display: none;
          @media screen and (max-width: 576px) {
            display: block;
            position: sticky;
            bottom: 0;
            left: 0;
            z-index: 100;
            background-color: #fff;
            padding: 20px 30px;
          }
        }
      `}</style>
    </>
  )
}
