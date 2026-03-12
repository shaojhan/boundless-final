import { useEffect, useState } from 'react'
import { apiBaseUrl } from '@/configs'
import { useDetailFetch } from '@/hooks/useDetailFetch'
import { formatPrice } from '@/lib/utils/formatPrice'
import { useRouter } from 'next/router'
import Navbar from '@/components/common/navbar'
import NavbarMb from '@/components/common/navbar-mb'
import Footer from '@/components/common/footer'
import Link from 'next/link'
import Image from 'next/image'
// icons
import { IoHome } from 'react-icons/io5'
import { FaChevronRight } from 'react-icons/fa6'
import { FaPlus } from 'react-icons/fa'
import { FaMinus } from 'react-icons/fa6'
import { FaUser } from 'react-icons/fa'
import { FaHeart } from 'react-icons/fa'
import { FaStar } from 'react-icons/fa'
//連購物車
import { useCart } from '@/hooks/use-cart'

import CardIns from '@/components/instrument/card'
import ProductCardIns from '@/components/instrument/instrument-productbrief-card'

//toast
import toast from 'react-hot-toast'
import React from 'react'
import Head from 'next/head'
import { useFilterToggle } from '@/hooks/useFilterToggle'
import { useMenuToggle } from '@/hooks/useMenuToggle'
import pStyles from './puid.module.scss'
// import ReactDOM from 'react-dom'

// import App from '@/pages/_app'

export default function InstrumentDetailPage() {
  // -------試抓資料區----------

  // ----------------------手機版本  ----------------------
  // 主選單
  const { showMenu, menuMbToggle } = useMenuToggle()

  // ----------------------加入右上角購物車的功能  ----------------------
  const { addInstrumentItem, increment, decrement, remove, notifyBuy } =
    useCart()

  // ----------------------假資料  ----------------------

  useFilterToggle()

  //收藏按鍵的功能
  //會有兩個狀態 連結會員資料 已經按過讚的收回;沒按過的按讚
  const [colorChange, setcolorChange] = useState(false)
  const colorToggle = () => {
    //按按鍵切換狀態
    setcolorChange(!colorChange)
  }

  //-----------------------動態路由
  //  由router中獲得動態路由(屬性名稱pid，即檔案[pid].js)的值，router.query中會包含pid屬性
  // 1. 執行(呼叫)useRouter，會回傳一個路由器
  // 2. router.isReady(布林值)，true代表本元件已完成水合作用(hydration)，可以取得router.query的值
  const router = useRouter()

  // 商品詳細
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [InstrumentDetail, setInstrumentDetail] = useState({} as any)
  const [specs, setSpecs] = useState([])
  const nameUnderline = InstrumentDetail.name
    ? InstrumentDetail.name.replaceAll(' ', '_')
    : ''
  const images = InstrumentDetail.img ? InstrumentDetail.img.split(',') : []
  const price = formatPrice(InstrumentDetail.price)
  const [selectedImg, setSelectedImg] = useState('')
  // 商品評論
  const [reviews, setReviews] = useState([])
  const [youmaylike, setYoumaylike] = useState([])
  const [quantity, setQuantity] = useState(1)

  // 產生評價星星
  const createStars = (num) => {
    let stars = []
    {
      for (let i = 0; i < num; i++) {
        stars.push(<FaStar color="#faad14" />)
      }
    }
    return stars
  }
  const statsDOM = (num) => {
    let stars = createStars(num)
    return stars.map((v) => {
      return v
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawData } = useDetailFetch<any>(
    router.isReady && router.query.puid
      ? `${apiBaseUrl}/instrument/${router.query.puid as string}`
      : null,
  )
  useEffect(() => {
    if (!rawData) return
    setInstrumentDetail(rawData.data)
    const reviewData = rawData.reviewData.map((v) => ({
      ...v,
      created_time: v.created_time?.split('T')[0] ?? '',
    }))
    setReviews(reviewData)
    setYoumaylike(rawData.youmaylike)
    setSpecs(rawData.data.specs.split('\n'))
  }, [rawData])

  useEffect(() => {
    if (InstrumentDetail.img) {
      setSelectedImg(InstrumentDetail.img.split(',')[0])
    }
  }, [InstrumentDetail])

  // View tracking — fire-and-forget
  useEffect(() => {
    if (!router.isReady || !router.query.puid) return
    fetch(`${apiBaseUrl}/recommendation/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ puid: router.query.puid }),
    }).catch(() => {})
  }, [router.isReady, router.query.puid])

  const _notify = () => toast('{InstrumentDetail[0].name)}已加入購物車.')

  // const quantity = localStorage.getItem('quantity')
  let _nameimg

  if (InstrumentDetail) {
    _nameimg = `/instrument/${InstrumentDetail.category_name}/${nameUnderline}/${selectedImg}`
  } else {
    _nameimg = '/instrument/defult.jpg'
  }

  return (
    <>
      <Navbar menuMbToggle={menuMbToggle} />
      <Head>
        <title>{InstrumentDetail.name}</title>
      </Head>
      <div className="container mx-auto px-6 relative">
        {/* 手機版主選單/navbar */}
        <div
          className={`menu-mb sm:hidden flex flex-col items-center ${showMenu ? 'menu-mb-show' : ''}`}
        >
          <NavbarMb />
        </div>
        {/* 麵包屑 */}
        <div className={`breadcrumb-wrapper-ns ${pStyles.bcWrap}`}>
          <ul className="flex items-center flex-wrap p-0 m-0">
            <IoHome size={20} />
            <Link href="/instrument">
              <li className={pStyles.bcItem1}>樂器商城</li>
            </Link>
            <FaChevronRight />
            <li className={pStyles.bcItem2}>
              {InstrumentDetail.category_name}
            </li>
            <FaChevronRight />
            <li className={pStyles.bcItem2}>{InstrumentDetail.name}</li>
          </ul>
        </div>

        <div className="flex flex-wrap -mx-3">
          <div className="w-full px-6 sm:w-1/2">
            {/* 主內容 */}
            <main className={`content ${pStyles.noPadInline}`}>
              <div>
                <div className="Left">
                  {/* prodBriefingArea */}
                  {/* 因為我的資料庫img存的是字串，所以我要把逗號去掉才能存成陣列，然後傳回來 */}
                  <div className="pic-Con ">
                    <div className="main-Pic">
                      <img
                        src={`/instrument/${InstrumentDetail.category_name}/${nameUnderline}/${selectedImg}`}
                        className={`h-full w-full ${pStyles.objectContain}`}
                        alt={InstrumentDetail.name}
                      />
                    </div>
                    <div className="sub-Pic-Con flex flex-wrap -mx-3 w-full">
                      {images.map((v) => {
                        return (
                          <div
                            key={v}
                            className={`col-3 p-0 sub-Pic-border ${
                              selectedImg == v ? 'active' : ''
                            }`}
                          >
                            <div
                              className={`sub-Pic p-2`}
                              role="button"
                              tabIndex={0}
                              onClick={(_e) => {
                                document
                                  .querySelector('.active')
                                  .classList.remove('active')
                                setSelectedImg(v)
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  document
                                    .querySelector('.active')
                                    .classList.remove('active')
                                  setSelectedImg(v)
                                }
                              }}
                            >
                              <img
                                src={`/instrument/${InstrumentDetail.category_name}/${nameUnderline}/${v}`}
                                className="img_small w-full h-full"
                                alt=""
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* 手機版productbrief-card放這 */}
                  <div className="Right-mobile">
                    <div
                      className={`prodBriefing sticky-top ${pStyles.zIndex20}`}
                    >
                      <div className="prodMainName">
                        {InstrumentDetail.name}
                      </div>

                      <div className="Rating">
                        <div className="star">
                          <img
                            loading="lazy"
                            src="https://cdn.builder.io/api/v1/image/assets/TEMP/84522f0e347edba7963eb335fd5301feca031f8d880bba21dd9760a01286c3a5?"
                            className="starImg"
                            alt=""
                          />
                          <div
                            className={`ratingNumber ${reviews.length > 0 ? '' : pStyles.noReview}`}
                          >
                            {reviews.length > 0 ? (
                              <>
                                {reviews.map((v) => {
                                  let _score = 0
                                  return (_score = v.stars / reviews.length)
                                })}
                              </>
                            ) : (
                              '尚無評價'
                            )}
                          </div>
                          <div className="commentNumber">
                            ({reviews.length})
                          </div>
                        </div>
                        <div className="sales">
                          已售出 {InstrumentDetail.sales}
                        </div>
                      </div>
                      <div className="productPrice">
                        <div className="price">NT$ {price}</div>
                        <div className="likesIcon icon-container ">
                          <FaHeart
                            className={`likesIcon ${colorChange ? pStyles.liked : ''}`}
                            size="32px"
                            onClick={colorToggle}
                          />
                        </div>
                      </div>

                      <div className={`Intro ${pStyles.textJustify}`}>
                        {InstrumentDetail.info}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>

          {/*   ----------------------頁面內容 右半部---------------------- */}
          <div className="hidden sm:block sm:w-1/2 px-6 page-control">
            <ProductCardIns
              className="Right-card"
              data={InstrumentDetail}
              reviews={reviews}
              quantity={quantity}
              setQuantity={setQuantity}
              addInstrumentItem={addInstrumentItem}
              increment={increment}
              decrement={decrement}
              remove={remove}
              notifyBuy={notifyBuy}
            />
          </div>
        </div>

        {/*商品細節 — 全寬顯示 */}
        <div className="detail">
          {/* 規格 */}
          <div className="outline detail-wrapp mt40">
            <div className="detail-title">規格</div>
            <div
              className={`list py-6 ${pStyles.borderRadius5}`}
            >
              <ul className="m-0">
                {specs.map((v) => {
                  return <li key={v}>{v}</li>
                })}
              </ul>
            </div>
          </div>

          {/* 買家評論 */}
          <div className="reviews mt40">
            <div className="detail-title">買家評論</div>
            <div
              className={`list py-6 ${pStyles.borderRadius5}`}
            >
              {reviews.length > 0 ? (
                <>
                  {reviews.map((v) => {
                    return (
                      <div className="review" key={v.id}>
                        <div className="review-area">
                          <div className="review-title">
                            <div className="userPhotoWrapper mr-6">
                              {v.img ? (
                                <Image
                                  src={`${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3005'}/user/${v.img}`}
                                  alt={`${v.name}'s photo`}
                                  width={32}
                                  height={32}
                                  className={`userPhoto`}
                                />
                              ) : (
                                <div className={`userPhotoDefault`}>
                                  <FaUser
                                    size={24}
                                    className={`userDefaultIcon`}
                                  />
                                </div>
                              )}
                            </div>
                            <div className="review-user">
                              <div className="review-Name">
                                <div className="user-Name">
                                  {v.nickname ? v.nickname : v.name}
                                </div>
                                <div className="review-Date">
                                  {v.created_time}
                                </div>
                              </div>
                              <div
                                className={`review-Star flex ${pStyles.gap3}`}
                              >
                                {statsDOM(v.stars)}
                              </div>
                            </div>
                          </div>
                          <div className="review-content mt-2">
                            {v.content}
                          </div>
                          <div className="comment-Like">
                            <div className="comment-Like-Number">
                              1人覺得有幫助
                            </div>
                            <div className="comment-Like-Icon">
                              <img
                                loading="lazy"
                                src="https://cdn.builder.io/api/v1/image/assets/TEMP/b33573d1006caa2dd045129e591ff98dd975245bb9b1f9ad55c74a65c6a47d58?"
                                className="comment-like-icon-img"
                                alt=""
                              />
                              <div className="comment-Like-Word">
                                有幫助
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </>
              ) : (
                <p className="m-0 font-semibold">尚無評論</p>
              )}
            </div>
          </div>
        </div>
        {/* 猜你喜歡 */}
        <div className="you-may-like hidden sm:block">
          <div className="detail-title ">猜你喜歡...</div>
          <div className="card-con">
            {youmaylike.map((v, i) => {
              return (
                <CardIns
                  key={i}
                  id={v.id}
                  puid={v.puid}
                  name={v.name}
                  category_name={v.category_name}
                  price={v.price}
                  img_small={v.img_small}
                  sales={v.sales}
                />
              )
            })}
          </div>
        </div>
        <div className="you-may-like-mobile">
          <div className="detail-title ">猜你喜歡...</div>
          {/* 手機版card-con */}
          <div className="instrument-card-group">
            {youmaylike.map((v, i) => {
              return i < 4 ? (
                <CardIns
                  key={i}
                  id={v.id}
                  puid={v.puid}
                  name={v.name}
                  category_name={v.category_name}
                  price={v.price}
                  img_small={v.img_small}
                  sales={v.sales}
                />
              ) : (
                ''
              )
            })}
          </div>
        </div>
      </div>
      <div
        className={`shoppingBtn sticky-top flex sm:hidden flex-col ${pStyles.zIndex99}`}
        id="shoppingBtn"
      >
        <div className="quantitySelector p-6">
          <div
            className="btn decrease-btn flex items-center"
            role="presentation"
            onClick={() => {
              if (quantity > 1) {
                setQuantity(quantity - 1)
              }
            }}
          >
            <FaMinus color="#666666" />
          </div>
          <div className={`quantity ${pStyles.dark}`}>
            {quantity}
          </div>
          <div
            className={`increase-btn flex items-center cursor-pointer font-medium ${
              InstrumentDetail.stock === 0 ? 'noStock' : 'hasStock'
            }`}
            role="presentation"
            onClick={() => {
              setQuantity(quantity + 1)
            }}
          >
            <FaPlus color="#fff" />
          </div>
          {InstrumentDetail.stock == 0 ? (
            <div className={`ml-6 ${pStyles.darkText20}`}>
              暫無庫存
            </div>
          ) : (
            ''
          )}
        </div>
        <div
          className={`flex jusify-content-evenly px-2 ${pStyles.gap12}`}
        >
          <div
            className={`cartBtn ${InstrumentDetail.stock == 0 ? pStyles.cartBtnDisabled : ''}`}
          >
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/c240e4bc8653fe6179383ea22f1eb80902c70eec255a944e9d8e0efbf823c4e3?"
              className="cartIcon"
              alt=""
            />
            <div
              className="cart"
              role="button"
              tabIndex={0}
              onClick={() => {
                if (InstrumentDetail.stock > 0) {
                  addInstrumentItem(InstrumentDetail, quantity)
                  notifyBuy(InstrumentDetail.name)
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && InstrumentDetail.stock > 0) {
                  addInstrumentItem(InstrumentDetail, quantity)
                  notifyBuy(InstrumentDetail.name)
                }
              }}
            >
              加入購物車
            </div>
          </div>
          <div
            className={`buyBtn ${InstrumentDetail.stock == 0 ? pStyles.buyBtnDisabled : ''}`}
            role="presentation"
            onClick={() => {
              if (InstrumentDetail.stock > 0) {
                addInstrumentItem(InstrumentDetail, quantity)
                router.push('/cart/check')
              }
            }}
          >
            <div className="buy">立即購買</div>
          </div>
        </div>
      </div>
      <Footer />

      <style jsx>{`
        * {
          box-sizing: border-box;
        }
        :root {
          --primary: #1581cc;
          --light-primary: #18a1ff;
          --deep-primary: #124365;
          --dark: #1d1d1d;
          --secondary: #5a5a5a;
          --body: #b9b9b9;
          --yellow: #faad14;
          --red: #ec3f3f;
        }

        body {
          font-family: 'Noto Sans TC', sans-serif;

          & ul {
            list-style: none;
            margin: 0;
          }

          & a {
            text-decoration: none;
          }
        }

        .content {
          @media screen and (max-width: 576px) {
            padding-top: 0px;
          }
        }
        .breadcrumb-wrapper-ns {
          @media screen and (max-width: 576px) {
            padding-inline: 4px;
          }
        }

        .instrument-card-group {
          display: flex;
          margin-block: 30px;
          gap: 35px;
          flex-wrap: wrap;
          @media screen and (max-width: 576px) {
            gap: 15px 10px;
          }
        }
        /* --------------- header & navbar --------------- */
        .userPhotoWrapper {
          border-radius: 50%;
          position: relative;
          overflow: hidden;
        }
        .userPhoto {
          object-fit: cover;
        }
        .userPhotoDefault {
          width: 32px;
          height: 32px;
          background-color: #1581cc;
          overflow: hidden;
          position: relative;
        }
        .userDefaultIcon {
          color: #fff;
          position: absolute;
          bottom: 0;
          left: calc(50% - 12px);
        }
        header {
          background-color: var(--primary);
          height: 60px;
          padding: 10px 35px;
          .logo {
            max-width: 180px;
          }
          .logo-mb {
            max-width: 30px;
          }

          @media screen and (max-width: 576px) {
            padding-inline: 20px;
          }
        }

        nav {
          flex: 1;
          max-width: 660px;
        }

        nav a {
          display: block;
          padding: 5px 12px;
          -radius: 10px;
          color: #fff;
          font-size: 20px;
          font-weight: 500;
          &:hover {
            color: var(--deep-primary);
            background-color: #fff;
          }
        }

        .navbar-mb {
          color: #fff;
        }

        /* --------------- container --------------- */
        .container {
          min-height: calc(100vh);
        }
        .breadcrumb-wrapper {
            cursor: pointer;
            transition: 0.3s;
            &:hover {
              color: #1581cc;
            }
        }

        .prodBriefingArea{
          width: 550px;
          height: 550px;
          padding:0px;
          border-radius: 10px;
          overflow: hidden; 
         
        
        }

        .prodImg {
          padding:0px;
          background-color: #ff9595;
          border-radius: 10px;
        }
     
     .pic-Con{
        display:flex;
        flex-direction:column;
        justify-content:center;
        align-items:stretch;
        width: 100%;
     }
     .main-Pic{
      height:550px;
      width:100%;
      max-width:550px;
      border-radius: 10px;
      border: 1px solid #b9b9b9;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
     }
     .sub-Pic-Con{
        display:flex;
        width: 100%;
        align-items: center;
        gap: 10px;
        padding-top:20px;
     }
     .sub-Pic{
      height:130px;
      overflow: hidden;
      @media screen and (max-width: 576px) {
        height: 90px;
      }
     }
     .sub-Pic-border {
      border-radius: 10px;
      width:130px;
      border: 1px solid #B9B9B9;
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      align-items: center;
      @media screen and (max-width: 576px) {
        width: 90px;
        height: 90px;
      }
     }
     .active {
        border: 5px solid #18A1FF;
        border-radius: 10px;
     }
     .img_small {
      object-fit: contain;
     }
        .mt-60 {
          margin-top: 60px;
        }

        .likesIcon {
            justify-content: center;
            align-items: center;
            border-radius: 5px;
            border: 1px solid var(--body, #b9b9b9);
            display: flex;
            aspect-ratio: 1;
            width: 34px;
            height: 34px;
            margin: auto 0;
            padding: 0 7px;
            transition: 0.2s;
            color: #b9b9b9;
          }

        /* ------------------ */

        /* 課程細節 */
        .mt40 {
          margin-top: 40px;
        }

        /* detail共用 */
        .detail{
            max-width:100%;
        }
        .detail-title {
          color: var(--primary-deep, #0d3652);
          font: 700 24px Noto Sans TC, sans-serif;
          margin-bottom:16px;
        }

        .list {
          background-color: rgba(185, 185, 185, 0.3);
          padding:8px 12px;
        }

        .outline {
          {/* height: 243px;
          width: 660px; */}
        }

        .outline ul{
list-style-type: disc; 
        }

        .suitable {
          {/* height: 130px;
          width: 660px; */}
        }
        .achievement {
          {/* height: 107px;
          width: 660px; */}
        }
        .review-title {
          display: flex;
        }
        .review-avatar {
          aspect-ratio: 1;
          object-fit: auto;
          object-position: center;
          width: 44px;
          : 1px solid black;
          -radius: 50%;
        }
        .review-Name {
          display: flex;
          gap: 10px;
        }
        .comment-Like {
          display: flex;
          justify-content: end;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
        }
        .comment-Like-Number {
          color: #5a5a5a;
          font-size: 14px;
          white-space: nowrap;
        }
        .comment-Like-Icon {
          display: flex;
          align-items: center;
          border-radius: 3px;
          border: 1px solid #1581cc;
          gap: 4px;
          padding: 2px 8px;
          white-space: nowrap;
          cursor: pointer;
        }
        .comment-like-icon-img {
          width: 18px;
          height: 18px;
          object-fit: contain;
        }
        .comment-Like-Word {
          color: #1581cc;
          font-size: 14px;
          white-space: nowrap;
        }
        .review-area {
          padding: 16px 0;
          border-bottom: 1px solid #e8e8e8;
        }
        .review:last-child .review-area {
          border-bottom: none;
        }
        .more-review {
          justify-content: end;
          display: flex;
          margin-right: 20px;
          margin-block: 10px;
          gap: 9px;
          font-size: 16px;
          color: var(--primary, #1581cc);
          font-weight: 700;
          padding: 4px 0 4px 80px;
        }
        .teacher-info {
          {/* height: 217px;
          width: 660px; */}
        }
        .teacher-info-area {
          display: flex;
          {/* height: 166px;
          width: 660px; */}
        }
        .teacher-img-con {
          width: 140px;
          height: 140px;
        }
        .teacherImg {
          width: 100%;
          height: auto;
          object-fit: cover;
          overflow: auto;
        }
        .teacher-info-word {
          width: 77%;
        }

.page-control{
    
            
}
    

        /* ------------- */

        .you-may-like {
          {/* height: 508px; */}
          width: 100%;
          margin-top: 30px;
        }
        .card-con{
            padding:0;
            display:flex;
            justify-content:space-between;
            
        }
        .card-con-mobile{
            display:block;
        }
        .Right-mobile{
            display:none;
        }
        .you-may-like-mobile{
            display:none;
        }
        /* --------------- footer --------------- */


        {/* -----------RWD-------------*/}
        @media screen and (max-width:576px) {

 .main-Pic{
    height: 390px;
max-width: 390px;
 }
   .sub-Pic-Con{

width:100%;
{/* margin-top:5px; */}
padding-top:20px;

     }
 .sub-Pic {
    width: 90px;
height: 90px;
 }
  .Right{
    display:none;
  }
  {/* 手機版productbrief-card */}
                        .prodBriefingArea{
    width:100%;
    height:204px;
}
                        .prodImg {
            padding:0px;
         
          background-color: #ff9595;
          border-radius: 10px;
          height:204px;
          
        }
                        .Right-mobile{
display:block;
  }
                        .prodBriefing {
                        /* background-color: #ff9595; */
                        {/* margin-left: 110px; */}
                        margin-top: 20px;
                      }
                      .prodMainName {
                        color: var(--dark, #1d1d1d);
                        /* font: 700 40px Noto Sans TC, sans-serif; */
                        font-weight: 700;
                        font-size: 40px;
                      }
                      /*  */
                      .font-family {
                        font-family: Noto Sans TC, sans-serif;
                      }
                      /*  */

                      .Rating {
                        justify-content: space-between;
                        display: flex;
                        margin-top: 10px;
                        width: 100%;
                        gap: 20px;
                        font-weight: 400;
                      }

                      .star {
                        justify-content: center;
                        align-items: center;
                        display: flex;
                        gap: 10px;
                        white-space: nowrap;
                      }

                      .ratingNumber {
                        color: var(--yellow, #faad14);
                        align-self: stretch;
                        font: 24px Noto Sans TC, sans-serif;
                      }

                      .commentNumber {
                        color: var(--body, #b9b9b9);
                        align-self: stretch;
                        flex-grow: 1;
                        margin: auto 0;
                        font: 16px Noto Sans TC, sans-serif;
                      }
                      .sales {
                        color: var(--secondary, #5a5a5a);
                        margin: auto 0;
                        font: 16px Noto Sans TC, sans-serif;
                      }
                      .productPrice {
                        justify-content: space-between;
                        align-items:center;
                        display: flex;
                        margin-top: 10px;
                        gap: 20px;
                      }
                      .price {
                        color: var(--dark, #1d1d1d);
                        white-space: nowrap;
                        padding: 9px 21px 2px 0;
                        font: 700 28px Noto Sans TC, sans-serif;
                      }
                      .likesIcon {
                        justify-content: center;
                        align-items: center;
                        border-radius: 5px;
                        border: 1px solid var(--body, #b9b9b9);
                        display: flex;
                        aspect-ratio: 1;
                        width: 34px;
                        height: 34px;
                        margin: auto 0;
                        padding: 0 7px;
                      }
                      .likesIcon :hover {
                        background-color: #ffc0cb;
                      }

                      .container{
                        padding-inline: 20px;
                        padding-bottom: 30px;
                        @media screen and (max-width: 576px) {
                          padding-bottom: 0px;
                        }
                      }
                      .shoppingBtn {
                        display: flex;
                        /* flex-direction: column; */
                        font-size: 16px;
                        color: var(--white, #fff);
                        font-weight: 700;
                        justify-content: space-evenly;
                        gap: 12px;
                        bottom: 0;
                        left: 0;
                        width: 100%;
                        background-color: white;
                        padding-bottom: 5px;
                        padding: 26px 0px 30px 0px;
                        z-index: 1200;
                      }

                      .cartBtn {
                        display: flex;
                        justify-content: center;
                        border-radius: 5px;
                        background-color: var(--body, #b9b9b9);
                        gap: 12px;
                        padding: 8px;
                        margin-left: 5px;
                        width: 100%;
                      }

                      .buyBtn {
                        display: flex;
                        justify-content: center;
                        border-radius: 5px;
                        background-color: #18a1ff;
                        gap: 12px;
                        padding: 8px;
                        margin-right: 5px;
                        width: 100%;
                      }

                      .quantitySelector {
                        display: flex;
                        align-items: center;
                        margin-top: 20px;
                        @media screen and (max-width: 576px) {
                          margin-top: 0px;
                        }
                      }
                      .decrease-btn {
                        height: 40px;
                        width: 40px;
                        border-radius: 5px 0px 0px 5px;
                        border: 1px solid var(--body, #b9b9b9);
                      }
                      .quantity {
                        display: flex;
                        width: 78px;
                        height: 40px;
                        justify-content: center;
                        align-items: center;
                        border: 1px solid var(--body, #b9b9b9);
                      }
                      .increase-btn {
                        height: 40px;
                        width: 40px;
                        border-radius: 0px 5px 5px 0px;
                      }
                      .hasStock {
                        background-color: #18a1ff;
                      }
                      .hasStock:hover {
                        background-color: #1581cc;
                      }
                      .noStock {
                        background-color: #b9b9b9;
                      }
                   
                      {/* ---------- */}

                      {/* detail-mobile */}
                      .detail{
max-width:100%;
                      }
                      .review-content{
                        max-width:100%;
                       word-wrap: break-word;
  overflow-wrap: break-word;

  
                      }
                      .you-will-like{
                       display:none;
}
.you-may-like-mobile{
    display:block;
}
.card-con-mobile{
    display:block;
     {/* flex: 0 0 90%;  */}
}
.you-may-like-mobile-card{
 flex: 0 0 30%; 
}
                   
                   
}
    
      `}</style>
    </>
  )
}
