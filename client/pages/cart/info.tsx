import { apiBaseUrl } from '@/configs'
import { formatPrice } from '@/lib/utils/formatPrice'
import { useEffect, useState } from 'react'
import Navbar from '@/components/common/navbar'
import NavbarMb from '@/components/common/navbar-mb'
import Footer from '@/components/common/footer'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { FiMinus } from 'react-icons/fi'

//hook
import { useCart } from '@/hooks/use-cart'

import Twzipcode from '@/components/cart/twzipcode'
import { useMenuToggle } from '@/hooks/useMenuToggle'

export default function Test() {
  //hook
  const {
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
  } = useCart()

  const [selected, setSeleted] = useState('credit-card')

  //form
  const _handleSubmit = (e) => {
    //取消表單預設行為，因為要使用js做進一步檢查
    e.preventDefault()
    const _formData = new FormData(e.target)
    //取得欄位的的名稱
  }

  //User-Info Data

  const [name, setName] = useState(() => {
    const saveItem = localStorage.getItem('UserInfo')
    const parseItem = JSON.parse(saveItem)[0].Name
    return parseItem || ''
  })

  const [phone, setPhone] = useState(() => {
    const saveItem = localStorage.getItem('UserInfo')
    const parseItem = JSON.parse(saveItem)[0].Phone
    return parseItem || ''
  })
  const [email, setEmail] = useState(() => {
    const saveItem = localStorage.getItem('UserInfo')
    const parseItem = JSON.parse(saveItem)[0].Email
    return parseItem || ''
  })
  const [address, setAddress] = useState(() => {
    const saveItem = localStorage.getItem('UserInfo')
    const parseItem = JSON.parse(saveItem)[0].Address
    return parseItem || ''
  })

  let UserInfo = JSON.stringify([
    { Name: name, Phone: phone, Email: email, Address: address },
  ])

  let UserInfoData = JSON.parse(UserInfo)

  useEffect(() => {
    localStorage.setItem('UserInfo', UserInfo)
  }, [UserInfo])

  const country = localStorage.getItem('Country') || ''
  const township = localStorage.getItem('Township') || ''
  const postcode = localStorage.getItem('Postcode') || ''

  const [data, setData] = useState({
    country: country,
    township: township,
    postcode: postcode,
  })

  const sendOrder = async () => {
    await fetch(`${apiBaseUrl}/order/sendorder`, {
      method: 'GET',
      credentials: 'include',
    })
  }

  // ----------------------手機版本  ----------------------
  // 主選單
  const { showMenu, menuMbToggle } = useMenuToggle()

  // ----------------------假資料  ----------------------

  return (
    <>
      <Head>
        <title>填寫訂單資料</title>
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
            <div className="flex items-center ballbox" style={{ gap: 10 }}>
              <div className="ball flex items-center justify-center inactive">
                1
              </div>
              <div className="h5 cart-process-text">修改訂單</div>
            </div>
            <div className="flex items-center ballbox" style={{ gap: 10 }}>
              <div className="ball flex items-center justify-center active">
                2
              </div>
              <div className="h5 cart-process-text">填寫訂單資料</div>
            </div>
            <div className="flex items-center ballbox" style={{ gap: 10 }}>
              <div className="ball flex items-center justify-center inactive">
                3
              </div>
              <div className="h5 cart-process-text">結帳確認</div>
            </div>
          </div>
          <div className="flex">
            <div className="w-full p-0 cart-main">
              <div className="consumer-info">
                <div className="cart-title">寄送資訊</div>
                <div className="consumer-info-group">
                  <div className="flex flex-wrap -mx-3 g-3 items-center">
                    <label
                      htmlFor="name"
                      className="col-form-label sm:w-1/6 px-6 h6"
                    >
                      購買者姓名
                    </label>
                    <div className="sm:w-1/4 px-6 w-1/2 px-6 consumer-info-input">
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        value={UserInfoData[0].Name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-3 g-3 items-center">
                    <label
                      htmlFor="phone"
                      className="col-form-label sm:w-1/6 px-6 h6"
                    >
                      電話號碼
                    </label>
                    <div className="sm:w-1/4 px-6 w-1/2 px-6 consumer-info-input">
                      <input
                        type="text"
                        className="form-control"
                        id="phone"
                        value={UserInfoData[0].Phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-3 g-3 items-center">
                    <label
                      htmlFor="email"
                      className="col-form-label sm:w-1/6 px-6 h6"
                    >
                      電子信箱
                    </label>
                    <div className="sm:w-5/12 px-6 w-5/6 px-6 consumer-info-input">
                      <input
                        type="text"
                        className="form-control"
                        id="email"
                        value={UserInfoData[0].Email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-3 g-3">
                    <label
                      htmlFor="address"
                      className="col-form-label sm:w-1/6 px-6 h6"
                    >
                      寄送地址
                    </label>
                    <div className="address-location sm:w-5/6 px-6">
                      <Twzipcode
                        initPostcode={data.postcode}
                        onPostcodeChange={(country, township, postcode) => {
                          setData({
                            country,
                            township,
                            postcode,
                          })
                        }}
                      />

                      <div className="sm:w-7/12 px-6 w-7/12 px-6">
                        <label htmlFor="addressinfo" className="form-label">
                          詳細地址
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="addressinfo"
                          value={UserInfoData[0].Address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="cart-instrument credit-card-info">
                <div className="cart-title">付款資訊</div>
                <div className="payment-info-group">
                  <div className="paymethods">
                    <div className="paymethod-item">
                      <input
                        type="radio"
                        id="transfer"
                        value={'transfer'}
                        name="paymethods"
                        onChange={() => {
                          setSeleted('transfer')
                        }}
                        checked={selected === 'transfer' ? true : false}
                      />
                      <label htmlFor="transfer">轉帳匯款</label>
                    </div>

                    <div className="paymethod-item">
                      <input
                        type="radio"
                        id="credit-card"
                        value={'credit-card'}
                        name="paymethods"
                        onChange={() => {
                          setSeleted('credit-card')
                        }}
                        checked={selected === 'credit-card' ? true : false}
                      />
                      <label htmlFor="credit-card">信用卡</label>
                      <div className="credit-card-pic">
                        <div className="credit-card-pic-item mastercard">
                          <Image src="/cart/mastercard.svg" fill alt="" />
                        </div>
                        <div className="credit-card-pic-item mnp">
                          <Image src="/cart/mnp.svg" fill alt="" />
                        </div>
                        <div className="credit-card-pic-item visa">
                          <Image src="/cart/visa.svg" fill alt="" />
                        </div>
                      </div>
                    </div>

                    <div className="paymethod-item">
                      <input
                        type="radio"
                        id="mobliepayment"
                        value={'mobliepayment'}
                        name="paymethods"
                        onChange={() => {
                          setSeleted('mobliepayment')
                        }}
                        checked={selected == 'mobliepayment' ? true : false}
                      />
                      <label htmlFor="mobliepayment">行動支付</label>
                      <div className="credit-card-pic">
                        <div
                          className="mobilepayment-pic-item"
                          style={{ backgroundColor: 'green' }}
                        >
                          <Image src="/cart/ecpay_logo_w.svg" fill alt="" />
                        </div>
                      </div>
                      <div className="credit-card-pic">
                        <div className="mobilepayment-pic-item">
                          <Image src="/cart/linepay.svg" fill alt="" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <hr />
                  </div>
                  {selected === 'credit-card' ? (
                    <>
                      <div className="flex flex-wrap -mx-3 g-3 items-center">
                        <label
                          htmlFor="name"
                          className="col-form-label sm:w-1/6 px-6 w-1/4 px-6 h6"
                        >
                          持卡人姓名
                        </label>
                        <div className="sm:w-1/2 px-6 w-7/12 px-6">
                          <input
                            type="text"
                            className="form-control credit-card-input"
                            id="name"
                            placeholder="Ex:HSIANG-AN, YANG"
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap -mx-3 g-3 items-center">
                        <label
                          htmlFor="credit-card-number"
                          className="col-form-label sm:w-1/6 px-6 w-1/4 px-6 h6"
                        >
                          信用卡卡號
                        </label>
                        <div className="creditcard" style={{ width: '5rem' }}>
                          <input
                            type="text"
                            className="form-control credit-card-input"
                            id="credit-card-number"
                            maxLength={4}
                            style={{ textAlign: 'center' }}
                          />
                        </div>
                        <div className="w-auto minussign">
                          <FiMinus />
                        </div>
                        <div className="creditcard" style={{ width: '5rem' }}>
                          <input
                            type="text"
                            className="form-control credit-card-input"
                            id="credit-card-number"
                            maxLength={4}
                            style={{ textAlign: 'center' }}
                          />
                        </div>
                        <div className="w-auto minussign">
                          <FiMinus />
                        </div>
                        <div className="creditcard " style={{ width: '5rem' }}>
                          <input
                            type="text"
                            className="form-control credit-card-input"
                            id="credit-card-number"
                            maxLength={4}
                            style={{ textAlign: 'center' }}
                          />
                        </div>
                        <div className="w-auto minussign">
                          <FiMinus />
                        </div>
                        <div className="creditcard" style={{ width: '5rem' }}>
                          <input
                            type="text"
                            className="form-control credit-card-input"
                            id="credit-card-number"
                            maxLength={4}
                            style={{ textAlign: 'center' }}
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap -mx-3 g-3 items-center">
                        <label
                          htmlFor="email"
                          className="col-form-label sm:w-1/6 px-6 w-1/4 px-6 h6"
                        >
                          有效期限
                        </label>
                        <div className="creditcard" style={{ width: '5rem' }}>
                          <input
                            type="text"
                            className="form-control credit-card-input"
                            id="expiration-date"
                            placeholder="MM"
                            maxLength={2}
                            min={1}
                            max={12}
                            style={{ textAlign: 'center' }}
                          />
                        </div>
                        <div className="w-auto minussign">
                          <FiMinus />
                        </div>
                        <div className="creditcard" style={{ width: '5rem' }}>
                          <input
                            type="text"
                            className="form-control credit-card-input"
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
                          className="col-form-label sm:w-1/6 px-6 w-1/4 px-6 h6"
                        >
                          背面末三碼
                        </label>
                        <div className="creditcard" style={{ width: '5rem' }}>
                          <input
                            type="text"
                            className="form-control credit-card-input"
                            style={{ textAlign: 'center' }}
                            id="3-number"
                            maxLength={3}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    ''
                  )}
                  {selected === 'mobliepayment' ? (
                    <>
                      <div className="cart-btn">
                        <div
                          className="custom-btn btn-15 text-center"
                          onClick={() => {
                            sendOrder()
                          }}
                        >
                          綠界支付
                        </div>
                        <div
                          className="custom-btn btn-6 text-center"
                          onClick={() => {}}
                        >
                          LINE PAY
                        </div>
                      </div>
                    </>
                  ) : (
                    ''
                  )}
                </div>
              </div>
            </div>
            <div
              className="sticky top-0 flowcart"
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
            </div>
          </div>
        </>
      </div>
      <div className="flow-cart-mb" style={{}}>
        <div className="flex flex-col sticky" style={{ gap: 20, top: 110 }}>
          <div className="total flex flex-col" style={{ gap: 20 }}>
            <div className="flex justify-between carttext">
              <div>商品數量</div>
              <div>
                樂器*{calcInstrumentItems()} 課程*{calcLessonItems()}
              </div>{' '}
            </div>
            <div className="flex justify-between carttext">
              <div>原價合計</div>
              <div>NT ${formatPrice(calcTotalPrice())}</div>
            </div>
            <div className="flex justify-between carttext discount">
              <div>折扣合計</div>
              <div>-NT ${formatPrice(calcTotalDiscount())}</div>{' '}
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
      </div>
      <Footer />

      <style jsx>{`
        .cart{
          color: black;
          padding: 20px 0;
        }
        .flowcart {
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
        .credit-card-input{
          @media screen and (max-width: 576px) {
            font-size: 14px;
            padding:3px 3px;
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
        }
        .cart-total-text {
            font-family: 'Noto Sans TC';
            font-size: 24px;
            font-style: normal;
            font-weight: 700;
            line-height: normal;
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
        padding: 7px 8px;
        & label{
          color: var(--Text-Secondary---Grey2, #6F7482);
        }
        @media screen and (max-width: 576px) {
          margin-top:0;
        }
      }
      .consumer-info-input{
        & input{
          @media screen and (max-width: 576px) {
            font-size: 14px;
            padding:3px 3px;
          }
        }
        @media screen and (max-width: 576px) {
          margin-top:0;
        }
      }
      .payment-info-group{
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 12px;
      }
      .credit-card-info{
        color: black;
        .minussign{
          @media screen and (max-width: 576px) {
            padding:0 2px
          }
        }
      }
      
      .credit-card-pic{
        display: flex;
        .credit-card-pic-item{
          width:28px;
          height:20px;
          position:relative;
          overflow: hidden;
          margin: 4px;
        }
        .visa{
          background: linear-gradient(#222357, #254AA5);
          border-width: 3px;
          border-style: solid;
          border-image: linear-gradient(to bottom, #222357, #254AA5) 1;
        }
        .mnp{
          background-color: #D7FFD8;
          border: 3px solid #D7FFD8;
        }
        .mastercard{
          background-color: #01326F;
          border: 4px solid #01326F;
        }
      }
      .mobilepayment-pic-item{
        width: 65px;
        height: 23px;
        position:relative;
        overflow: hidden;
      }
      .paymethods{
        display: flex;
        flex-wrap: wrap;
        gap: 40px;
        @media screen and (max-width: 576px) {
          padding:0 0 0 0;
          gap:20px 40px;
        }
        .paymethod-item{
          width: fit-content;
          display: flex;
          gap: 20px;
        }
      }
      .creditcard{
        @media screen and (max-width: 576px) {
          padding: 0px 3px;
          width: fit-content !important;
        }
        & input{
          @media screen and (max-width: 576px) {
            width: 50px;
          }
        }
      }
      .consumer-info{
        color: black;
      }
      .col-form-label{
        @media screen and (max-width: 576px) {
          font-size: 16px;
          padding-right:2px;
        }
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

      .custom-btn {
        width: 130px;
        height: 40px;
        color: #fff;
        border-radius: 5px;
        padding: 10px 25px;
        font-family: 'Lato', sans-serif;
        font-weight: 500;
        background: transparent;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        display: inline-block;
        box-shadow:inset 2px 2px 2px 0px rgba(255,255,255,.5),
        7px 7px 20px 0px rgba(0,0,0,.1),
        4px 4px 5px 0px rgba(0,0,0,.1);
        outline: none;
      }
      .btn-15 {
        background: #b621fe;
        border: none;
        z-index: 1;
      }
      .btn-15:after {
        position: absolute;
        content: "";
        width: 0;
        height: 100%;
        top: 0;
        right: 0;
        z-index: -1;
        background-color: #663dff;
        border-radius: 5px;
        box-shadow:inset 2px 2px 2px 0px rgba(255,255,255,.5),
        7px 7px 20px 0px rgba(0,0,0,.1),
        4px 4px 5px 0px rgba(0,0,0,.1);
        transition: all 0.3s ease;
      }
      .btn-15:hover {
        color: #fff;
      }
      .btn-15:hover:after {
        left: 0;
        width: 100%;
      }
      .btn-15:active {
        top: 2px;
      }
      .btn-6 {
        background: rgb(247,150,192);
        background: radial-gradient(circle, rgba(247,150,192,1) 0%, rgba(118,174,241,1) 100%);
        line-height: 42px;
        padding: 0;
        border: none;
      }
      .btn-6 span {
        position: relative;
        display: block;
        width: 100%;
        height: 100%;
      }
      .btn-6:before,
      .btn-6:after {
        position: absolute;
        content: "";
        height: 0%;
        width: 1px;
      box-shadow:
        -1px -1px 20px 0px rgba(255,255,255,1),
        -4px -4px 5px 0px rgba(255,255,255,1),
        7px 7px 20px 0px rgba(0,0,0,.4),
        4px 4px 5px 0px rgba(0,0,0,.3);
      }
      .btn-6:before {
        right: 0;
        top: 0;
        transition: all 500ms ease;
      }
      .btn-6:after {
        left: 0;
        bottom: 0;
        transition: all 500ms ease;
      }
      .btn-6:hover{
        background: transparent;
        color: #76aef1;
        box-shadow: none;
      }
      .btn-6:hover:before {
        transition: all 500ms ease;
        height: 100%;
      }
      .btn-6:hover:after {
        transition: all 500ms ease;
        height: 100%;
      }
      .btn-6 span:before,
      .btn-6 span:after {
        position: absolute;
        content: "";
        box-shadow:
        -1px -1px 20px 0px rgba(255,255,255,1),
        -4px -4px 5px 0px rgba(255,255,255,1),
        7px 7px 20px 0px rgba(0,0,0,.4),
        4px 4px 5px 0px rgba(0,0,0,.3);
      }
      .btn-6 span:before {
        left: 0;
        top: 0;
        width: 0%;
        height: .5px;
        transition: all 500ms ease;
      }
      .btn-6 span:after {
        right: 0;
        bottom: 0;
        width: 0%;
        height: .5px;
        transition: all 500ms ease;
      }
      .btn-6 span:hover:before {
        width: 100%;
      }
      .btn-6 span:hover:after {
        width: 100%;
      }
      `}</style>
    </>
  )
}
