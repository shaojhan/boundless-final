import Navbar from '@/components/common/navbar'
import { useState } from 'react'
import Footer from '@/components/common/footer'
import Link from 'next/link'
import Image from 'next/image'
import Head from 'next/head'

// 會員認證hook
import { useAuth } from '@/hooks/user/use-auth'
import { useAvatarImage } from '@/hooks/useAvatarImage'

// icons
import { IoHome } from 'react-icons/io5'
import { FaChevronRight } from 'react-icons/fa6'
import { IoIosSearch } from 'react-icons/io'
import { FaFilter } from 'react-icons/fa6'
import { FaSortAmountDown } from 'react-icons/fa'
import { ImExit } from 'react-icons/im'
import { IoClose } from 'react-icons/io5'
import { useFilterToggle } from '@/hooks/useFilterToggle'
import { useMenuToggle } from '@/hooks/useMenuToggle'

export default function Test() {
  // ----------------------會員登入狀態 & 會員資料獲取  ----------------------
  //從hook 獲得使用者登入的資訊  儲存在變數LoginUserData裡面
  const { LoginUserData, handleLogout } = useAuth()

  const avatarImage = useAvatarImage()

  // ----------------------會員登入狀態  ----------------------

  // ----------------------手機版本  ----------------------
  // 主選單
  const { showMenu, menuMbToggle, showSidebar, sidebarToggle, setShowSidebar } =
    useMenuToggle()
  // ----------------------假資料  ----------------------
  // sidebar假資料
  // const sidebarData = [
  //   '會員資訊',
  //   '我的樂團',
  //   '我的訂單',
  //   '我的文章',
  //   '我的收藏',
  //   '我的優惠券 ',
  //   '我的課程',
  //   '我的訊息',
  // ]

  // 資料排序
  const [dataSort, setDataSort] = useState('latest')
  // ----------------------條件篩選  ----------------------
  const { filterVisible, onshow, stopPropagation } =
    useFilterToggle()
  // filter假資料
  const brandData = [
    { id: 1, name: 'YAMAHA' },
    { id: 2, name: 'Roland' },
    { id: 3, name: 'Fender' },
    { id: 4, name: 'Gibson' },
  ]
  const [brandSelect, setBrandSelect] = useState('all')

  const [priceLow, setPriceLow] = useState('')
  const [priceHigh, setPriceHigh] = useState('')

  // 課程評價
  const scoreState = ['all', '5', '4', '3']
  const [score, setScore] = useState('all')

  // 活動促銷
  const [sales, setSales] = useState(false)

  // 清除表單內容
  const cleanFilter = () => {
    setBrandSelect('all')
    setPriceLow('')
    setPriceHigh('')
    setScore('all')
    setSales(false)
  }

  return (
    <>
      <Head>
        <title>我的通知</title>
      </Head>
      <Navbar menuMbToggle={menuMbToggle} />
      {/* 先把HEROSECTION隱藏 */}
      {/* <div
        className="page-shero hidden sm:block"
        style={{ paddingTop: '60px' }}
      >
        <Image src={jamHero} className="object-cover w-full" alt="cover" />
      </div> */}
      <div className="container mx-auto px-6 relative">
        {/* 手機版主選單/navbar */}
        <div
          className={`menu-mb sm:hidden flex flex-col items-center ${showMenu ? 'menu-mb-show' : ''}`}
        >
          {/* 用戶資訊 */}
          <div className="menu-mb-user-info flex items-center flex-col mb-6">
            <div className="mb-photo-wrapper mb-2">
              <Image
                src={avatarImage}
                alt="user photo mb"
                fill
                sizes="(max-width: 150px)"
              ></Image>
            </div>
            <div>{LoginUserData.nickname}</div>
          </div>
          <Link
            className="mm-item"
            href="/user/user-info"
            style={{ borderTop: '1px solid #b9b9b9' }}
          >
            會員中心
          </Link>
          <Link className="mm-item" href="/lesson/lesson-list">
            探索課程
          </Link>
          <Link className="mm-item" href="/instrument/instrument-list">
            樂器商城
          </Link>
          <Link className="mm-item" href="/jam/recruit-list">
            Let &apos;s JAM!
          </Link>
          <Link className="mm-item" href="/article/article-list">
            樂友論壇
          </Link>
          {}
          <div
            onClick={handleLogout}
            //onclick 要加這個 不然ES會跳沒有給身障人士使用
            role="presentation"
            className="mm-item"
            style={{ color: '#1581cc' }}
          >
            登出
            <ImExit size={20} className="ml-2" />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3">
          {/* sidebar */}
          <div className="sidebar-wrapper hidden sm:block sm:w-1/6 px-6">
            <div className="sidebar">
              <div className="sidebar-user-info">
                <div className="sidebar-user-info-imgBox">
                  <Image
                    src={avatarImage}
                    alt="user photo mb"
                    fill
                    priority //不加的話Next 會問是否要加優先級
                    sizes="(max-width: 150px)"
                  ></Image>
                </div>
                <div className="sidebar-user-info-text">
                  <div className="sidebar-user-info-name">
                    {LoginUserData.nickname}
                  </div>
                  <div className="sidebar-user-info-band">
                    {LoginUserData.my_jamname}
                  </div>
                </div>
                {/* 更換大頭貼的功能暫定併回會員資訊 故不再sidebar顯示 */}
                {/* <div className="sidebar-user-info-Camera-img">
                  <Image src={avatar} alt="user photo mb" fill></Image>
                </div> */}
              </div>
              <ul className="flex flex-col">
                {/* {sidebarData.map((item, index) => {
                  return (
                    <li key={index}>
                      <Link href={`#`}>{item}</Link>
                    </li>
                  )
                })} */}

                <li key={1}>
                  <Link href="/user/user-info">會員資訊</Link>
                </li>
                <li key={2}>
                  <Link href="/user/user-jam">我的樂團</Link>
                </li>
                <li key={3}>
                  <Link href="/user/user-order">我的訂單</Link>
                </li>
                <li key={4}>
                  <Link href="/user/user-article">我的文章</Link>
                </li>
                <li key={5}>
                  <Link href="/user/user-favorite">我的收藏</Link>
                </li>
                <li key={6}>
                  <Link href="/user/user-coupon">我的優惠券</Link>
                </li>
                <li key={7}>
                  <Link href="/user/user-lesson">我的課程</Link>
                </li>
                <li key={8}>
                  <Link href="/user/user-notify">我的訊息</Link>
                </li>
              </ul>
            </div>
          </div>

          {/*   ----------------------頁面內容  ---------------------- */}
          <div className="w-full px-6 sm:w-5/6 px-6 page-control">
            {/* 手機版sidebar */}
            <div
              className={`sidebar-mb sm:hidden ${showSidebar ? 'sidebar-mb-show' : ''}`}
            >
              <div className="sm-close">
                <IoClose
                  size={32}
                  onClick={() => {
                    setShowSidebar(false)
                  }}
                />
              </div>
              <Link href={`/jam/recruit-list`} className="sm-item active">
                團員募集
              </Link>
              <Link href={`/jam/jam-list`} className="sm-item">
                活動中的JAM
              </Link>
              <Link href={`/jam/Q&A`} className="sm-item">
                什麼是JAM？
              </Link>
            </div>
            {/*  ---------------------- 頂部功能列  ---------------------- */}
            <div className="top-function-container">
              {/*  ---------------------- 麵包屑  ---------------------- */}
              <div className="breadcrumb-wrapper-ns">
                <ul className="flex items-center p-0 m-0">
                  <IoHome size={20} />
                  <li style={{ marginLeft: '8px' }}>會員中心</li>
                  <FaChevronRight />
                  <li style={{ marginLeft: '10px' }}>我的通知</li>
                </ul>
              </div>

              <div className="top-function-flex">
                {/*  ---------------------- 搜尋欄  ---------------------- */}
                <div className="search-sidebarBtn">
                  <div
                    className="flex sm:hidden items-center b-btn b-btn-body"
                    role="presentation"
                    style={{ paddingInline: '16px' }}
                    onClick={sidebarToggle}
                  >
                    選單
                  </div>
                  <div className="search input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="請輸入關鍵字..."
                    />
                    <div className="search-btn btn flex justify-center items-center p-0">
                      <IoIosSearch size={25} />
                    </div>
                  </div>
                </div>

                <div className="filter-sort flex justify-between">
                  <div className="sort-mb block sm:hidden">
                    <select
                      className="form-select"
                      value={dataSort}
                      name="dataSort"
                      onChange={(e) => {
                        setDataSort(e.target.value)
                      }}
                    >
                      <option value="latest">新到舊</option>
                      <option value="oldest">舊到新</option>
                    </select>
                  </div>
                  {/*  ---------------------- 條件篩選  ---------------------- */}
                  <form className="flex items-center relative">
                    <div
                      className="filter-text flex items-center sm:mr-6"
                      role="presentation"
                      onClick={onshow}
                    >
                      條件篩選
                      <FaFilter size={13} />
                      <div
                        className={`filter ${
                          filterVisible === false ? 'hidden' : 'block'
                        }`}
                        onClick={stopPropagation}
                        role="presentation"
                      >
                        {/* 品牌 */}
                        <div className="filter-item">
                          <div className="filter-title">選擇品牌</div>
                          <select
                            className="form-select"
                            aria-label="Default select example"
                            value={brandSelect}
                            name="brand"
                            onChange={(e) => {
                              setBrandSelect(e.target.value)
                            }}
                          >
                            <option value="all">全部</option>
                            {brandData.map((v) => {
                              return (
                                <option key={v.id} value={v.id}>
                                  {v.name}
                                </option>
                              )
                            })}
                          </select>
                        </div>
                        {/* 價格區間 */}
                        <div className="filter-item">
                          <div className="filter-title">價格區間</div>
                          <input
                            type="number"
                            className="form-control mb-2"
                            placeholder="最低價"
                            name="priceLow"
                            value={priceLow}
                            min={0}
                            max={Number(priceHigh) - 1}
                            onChange={(e) => {
                              setPriceLow(e.target.value)
                            }}
                          />
                          <input
                            type="number"
                            className="form-control"
                            placeholder="最高價"
                            name="priceHigh"
                            value={priceHigh}
                            min={priceLow + 1}
                            onChange={(e) => {
                              setPriceHigh(e.target.value)
                            }}
                          />
                        </div>
                        {/* 商品評價 */}
                        <div className="filter-item m-0">
                          <div className="filter-title">商品評價</div>
                          <div className="filter-radio-group flex flex-wrap justify-between">
                            {scoreState.map((v, i) => {
                              return (
                                <div
                                  className="filter-radio-item form-check p-0 mb-6"
                                  key={i}
                                >
                                  <label className="form-check-label">
                                    <input
                                      type="radio"
                                      name="score"
                                      value={v}
                                      checked={v === score}
                                      onChange={(e) => {
                                        setScore(e.target.value)
                                      }}
                                    />
                                    &nbsp;{v === 'all' ? '全部' : v + '星'}
                                  </label>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                        {/* 促銷商品 */}
                        <div className="filter-item">
                          <div className="form-check">
                            <label className="form-check-label filter-title mb-0">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                value={sales ? 'true' : 'false'}
                                name="sales"
                                onChange={() => {
                                  setSales(!sales)
                                }}
                              />{' '}
                              促銷商品
                            </label>
                          </div>
                        </div>
                        <div
                          className="flex justify-between gap-2 mt-2"
                          style={{ paddingInline: '10px' }}
                        >
                          <div
                            className="filter-btn clean-btn w-full flex justify-center"
                            role="presentation"
                            onClick={cleanFilter}
                          >
                            清除
                          </div>
                          <div className="filter-btn confirm-btn w-full flex justify-center">
                            確認
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                  {/* ---------------------- 資料排序  ---------------------- */}
                  <div className="sort hidden sm:flex justify-between items-center">
                    <div className="flex items-center">
                      排序
                      <FaSortAmountDown size={14} />
                    </div>
                    <div
                      className={`sort-item ${
                        dataSort === 'latest' ? 'active' : ''
                      }`}
                      role="presentation"
                      onClick={(_e) => {
                        setDataSort('latest')
                      }}
                    >
                      新到舊
                    </div>
                    <div
                      className={`sort-item ${
                        dataSort === 'oldest' ? 'active' : ''
                      }`}
                      role="presentation"
                      onClick={(_e) => {
                        setDataSort('oldest')
                      }}
                    >
                      舊到新
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* 主內容 */}
            <main className="content">
              <div className="container mx-auto px-6 custom-container">
                <div className="flex flex-wrap -mx-3">
                  <div
                    className="sm:w-5/6 px-6 w-full px-6"
                    style={{
                      backgroundColor: 'rgb(255, 255, 255)',
                    }}
                  >
                    <div className="user-content w-full px-6">
                      <div className="user-content-top">
                        <div className="user-title-userInfo">我的訊息</div>
                      </div>

                      <div className="user-notifyList ">
                        <div className="user-notifyList-item flex flex flex-wrap -mx-3 mb-2">
                          <div className=" sm:w-auto px-6 w-full px-6 ">
                            <div className=" user-notifyList-item-notifyLabel">
                              那些在買七弦吉他前，需要注意的調 Tone 撇步！
                            </div>
                          </div>

                          <div className="user-notifyList-item-type sm:w-1/3 px-6 w-full px-6">
                            <span className="user-notifyList-item-message">
                              有新的留言！
                            </span>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;10分鐘前
                          </div>
                        </div>
                        <hr />

                        {/* ----------------重複內容 測試-------------------- */}
                        <div className="user-notifyList-item flex flex flex-wrap -mx-3 mb-2">
                          <div className=" sm:w-auto px-6 w-full px-6 ">
                            <div className=" user-notifyList-item-notifyLabel">
                              那些在買七弦吉他前，需要注意的調 Tone 撇步！
                            </div>
                          </div>

                          <div className="user-notifyList-item-type sm:w-1/3 px-6 w-full px-6">
                            <span className="user-notifyList-item-message">
                              有新的留言！
                            </span>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;10分鐘前
                          </div>
                        </div>
                        <hr />
                        <div className="user-notifyList-item flex flex flex-wrap -mx-3 mb-2">
                          <div className=" sm:w-auto px-6 w-full px-6 ">
                            <div className=" user-notifyList-item-notifyLabel">
                              那些在買七弦吉他前，需要注意的調 Tone 撇步！
                            </div>
                          </div>

                          <div className="user-notifyList-item-type sm:w-1/3 px-6 w-full px-6">
                            <span className="user-notifyList-item-message">
                              有新的留言！
                            </span>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;10分鐘前
                          </div>
                        </div>
                        <hr />
                        <div className="user-notifyList-item flex flex flex-wrap -mx-3 mb-2">
                          <div className=" sm:w-auto px-6 w-full px-6 ">
                            <div className=" user-notifyList-item-notifyLabel">
                              那些在買七弦吉他前，需要注意的調 Tone 撇步！
                            </div>
                          </div>

                          <div className="user-notifyList-item-type sm:w-1/3 px-6 w-full px-6">
                            <span className="user-notifyList-item-message">
                              有新的留言！
                            </span>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;10分鐘前
                          </div>
                        </div>
                        <hr />
                        <div className="user-notifyList-item flex flex flex-wrap -mx-3 mb-2">
                          <div className=" sm:w-auto px-6 w-full px-6 ">
                            <div className=" user-notifyList-item-notifyLabel">
                              那些在買七弦吉他前，需要注意的調 Tone 撇步！
                            </div>
                          </div>

                          <div className="user-notifyList-item-type sm:w-1/3 px-6 w-full px-6">
                            <span className="user-notifyList-item-message">
                              有新的留言！
                            </span>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;10分鐘前
                          </div>
                        </div>
                        <hr />
                        <div className="user-notifyList-item flex flex flex-wrap -mx-3 mb-2">
                          <div className=" sm:w-auto px-6 w-full px-6 ">
                            <div className=" user-notifyList-item-notifyLabel">
                              那些在買七弦吉他前，需要注意的調 Tone 撇步！
                            </div>
                          </div>

                          <div className="user-notifyList-item-type sm:w-1/3 px-6 w-full px-6">
                            <span className="user-notifyList-item-message">
                              有新的留言！
                            </span>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;10分鐘前
                          </div>
                        </div>
                        <hr />
                        {/* ----------------重複內容 測試-------------------- */}
                      </div>

                      <div className="user-orderList-pagination">
                        <p>待放分頁元件 注意class</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
      <Footer />

      <style jsx>{`
        /* -------------------user sidebar-------------------- */
        .sidebar-user-info {
          display: flex;
          padding: 0px 12px;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
          align-self: stretch;

          /* position: relative; */

          .sidebar-user-info-imgBox {
            width: 100px;
            height: 100px;
            border-radius: 100px;

            /* react Image 要加上這兩條參數 家在外層容器的css , Image本身要fill */

            position: relative;
            overflow: hidden;
          }
          .sidebar-user-info-text {
            display: flex;

            width: 140px;
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
            color: var(--dark, #1d1d1d);
            text-align: start;

            /* h5 */
            font-family: 'Noto Sans TC';
            font-size: 20px;
            font-style: normal;
            font-weight: 400;
            line-height: normal;
            .sidebar-user-info-band {
              margin-bottom: 20px;
            }
          }

          .sidebar-user-info-Camera-img {
            width: 30px;
            height: 30px;
            position: absolute;
            left: 85px;
            top: 70px;
            fill: var(--light-gray, #cfcfcf);
          }
        }

        /* -------------------user sidebar-------------------- */
        /* --------------- user-contect-notify--------------- */
        hr {
          margin: 10px;
        }
        .custom-container {
          padding: 0;
          color: #000;

          & p {
            font-family: 'Noto Sans TC';
            font-style: normal;
            font-weight: 400;
            line-height: normal;
            overflow: hidden;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            color: #000;
            text-overflow: ellipsis;
          }
          & h5 {
            font-family: 'Noto Sans TC';
            font-size: 20px;
            font-style: normal;
            font-weight: 400;
            line-height: normal;
            color: var(--primary-deep, #124365);
          }

          .user-orderList-pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            align-self: stretch;
          }
        }

        .user-content {
          display: flex;
          width: 1070px;
          padding: 20px 10px;
          flex-direction: column;
          align-items: flex-start;
          gap: 20px;
          border-radius: 5px;
          background: var(--gray-30, rgba(185, 185, 185, 0.3));

          .user-content-top {
            display: flex;
            align-items: flex-start;
            align-self: stretch;
            color: var(--primary-deep, #124365);
            text-align: center;
            justify-content: space-between;
            /* h3 */
            font-family: 'Noto Sans TC';
            font-size: 28px;
            font-style: normal;
            font-weight: 700;
            line-height: normal;

            .user-notify-newBtn {
              display: none;
            }
          }
          /*----------------------notify css----------------------- */
          .user-notifyList {
            width: 100%;
          }

          .user-notifyList-item {
            align-items: center;
            padding-left: 25px;
            margin-inline: auto;
            /*height: 60px; */

            .user-notifyList-item-notifyLabel {
              display: -webkit-box;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 1;
              overflow: hidden;
            }
            .user-notifyList-item-type {
              /*text-align: end;*/
            }
            .user-notifyList-item-message {
              color: var(--primary-deep, #124365);
            }
          }

          /*----------------------notify css----------------------- */

          .user-orderList-pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            align-self: stretch;
          }
        }

        /* RWD讓SIDEBAR消失 測試用記得刪 */
        @media screen and (max-width: 576px) {
          body {
            padding-inline: 20px;
          }

          .custom-container {
            overflow: hidden;

            .user-content {
              width: 390px;
              padding: 10px;
              overflow: hidden;
            }
          }

          .user-content {
            .user-notifyList-item {
              padding-left: 0px;
              font-size: 20px;

              .user-notifyList-item-notifyLabel {
                -webkit-line-clamp: 2;
              }

              .user-notifyList-item-type {
                font-size: 16px;
              }
            }
          }
        }
        /* RWD讓SIDEBAR消失 測試用記得刪 */
      `}</style>
    </>
  )
}
