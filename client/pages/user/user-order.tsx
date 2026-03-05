import Navbar from '@/components/common/navbar'
import { useState, useEffect } from 'react'
import Footer from '@/components/common/footer'
import Link from 'next/link'
import Image from 'next/image'
import Head from 'next/head'
import NavbarMb from '@/components/common/navbar-mb'

// 會員認證hook
import { useAuth } from '@/hooks/user/use-auth'
import { authFetch } from '@/lib/api-client'
import { useAvatarImage } from '@/hooks/useAvatarImage'

// icons
import { IoHome, IoClose } from 'react-icons/io5'
import { FaChevronRight } from 'react-icons/fa6'
import { IoIosSearch } from 'react-icons/io'
import { FaFilter } from 'react-icons/fa6'
import { FaSortAmountDown } from 'react-icons/fa'
import { useFilterToggle } from '@/hooks/useFilterToggle'
import { useMenuToggle } from '@/hooks/useMenuToggle'

export default function Test() {
  // ----------------------會員登入狀態 & 會員資料獲取  ----------------------
  //從hook 獲得使用者登入的資訊  儲存在變數LoginUserData裡面
  const { auth, LoginUserData } = useAuth()

  const avatarImage = useAvatarImage()


  // ----------------------會員登入狀態  ----------------------

  //------獲取單一使用者全部訂單
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userOrderData, setuserOrderData] = useState({} as any)
  const getLoginUserOrder = async () => {
    if (!auth?.user?.id) return
    try {
      const response = await authFetch(`/api/user/order/${auth.user.id}`, {
        method: 'POST',
        body: JSON.stringify({}),
      })
      const orderDatas = await response.json()
      setuserOrderData(orderDatas.data ?? [])
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error)
    }
  }

  //-------------------------------------------------------------
  //執行一次，如果有登入，獲得該使用者全部資料寫入userData 狀態
  useEffect(() => {
    if (auth?.user?.id) {
      getLoginUserOrder()
    }
  }, [auth?.user?.id])
  // ----------------------訂單明細 Accordion ----------------------
  const [selectedOrderIndex, setSelectedOrderIndex] = useState<number | null>(null)

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
        <title>我的訂單</title>
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
          <NavbarMb />
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
                  <Link
                    href={
                      LoginUserData.jamstate == '1'
                        ? `/jam/recruit-list/${LoginUserData.my_jam}`
                        : `/user/user-jam`
                    }
                  >
                    我的樂團
                  </Link>
                </li>
                <li key={3}>
                  <Link href="/user/user-order">我的訂單</Link>
                </li>
                <li key={4}>
                  <Link href="/user/user-article">我的文章</Link>
                </li>
                <li key={5}>
                  <Link href="/user/user-coupon">我的優惠券</Link>
                </li>
              </ul>
            </div>
          </div>

          {/*   ----------------------頁面內容  ---------------------- */}
          <div className="w-full px-6 sm:w-5/6 px-6 page-control">
            {/* 手機版sidebar */}
            <div
              className={`sidebar-mb sm:hidden ${showSidebar ? 'sidebar-mb-show' : ''}`}
              style={{ top: '190px' }}
            >
              <div className="sm-close">
                <IoClose
                  size={32}
                  onClick={() => {
                    setShowSidebar(false)
                  }}
                />
              </div>
              <Link href={`/user/user-info`} className="sm-item ">
                會員資訊
              </Link>
              <Link
                href={
                  LoginUserData.jamstate == '1'
                    ? `/jam/recruit-list/${LoginUserData.my_jam}`
                    : `/user/user-jam`
                }
                className="sm-item "
              >
                我的樂團
              </Link>
              <Link href={`/user/user-order`} className="sm-item active">
                我的訂單
              </Link>
              <Link href={`/user/user-article`} className="sm-item">
                我的文章
              </Link>
              <Link href={`/user/user-coupon`} className="sm-item ">
                我的優惠券
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
                  <li style={{ marginLeft: '10px' }}>我的訂單</li>
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
                        <div className="user-title-userInfo">我的訂單</div>
                      </div>
                      <div className="user-orderList">
                        {/* <div className="user-order-item-instrument ">
                          <div className="user-order-item-instrument-leftSide lg:w-1/4 px-6 w-full px-6">
                            <div className="user-order-item-instrument-leftSide-img">
                              <Image src={produceTestImage} alt='' priority style={{ borderRadius: 10, padding:5 }} width={150} height={150}></Image>
                            </div> */}
                        {/* <div className="user-order-item-instrument-leftSide-btn btn btn-primary">
                              退貨
                            </div> */}
                        {/* </div>
                          <div className="user-order-item-instrument-detail lg:w-3/4 px-6 w-full px-6">
                            <div className="user-order-item-instrument-detail-row ">
                              <div className="user-order-item-instrument-detail-row-col-productName">
                                <p>
                                  <span>商品名稱：</span> YBH_621S X 1
                                </p>
                              </div>
                            </div>
                            <div className="user-order-item-instrument-detail-row flex flex-wrap -mx-3">
                              <div className="user-order-item-instrument-detail-row-col lg:w-1/4 px-6 w-5/12 px-6">
                                <h5>訂單編號</h5>
                                <p>31700023464729</p>
                              </div>
                              <div className="user-order-item-instrument-detail-row-col lg:w-1/4 px-6 w-5/12 px-6">
                                <h5>購買日期</h5>
                                <p>2024/01/14</p>
                              </div>
                              <div className="user-order-item-instrument-detail-row-col lg:w-1/4 px-6 w-full px-6">
                                <h5>付款金額</h5>
                                <p>$ 72000</p>
                              </div>
                            </div>
                            <div className="user-order-item-instrument-detail-row flex flex-wrap -mx-3">
                              <div className="user-order-item-instrument-detail-row-col lg:w-1/4 px-6 w-5/12 px-6">
                                <h5>付款方式</h5>
                                <p>信用卡</p>
                              </div>
                              <div className="user-order-item-instrument-detail-row-col lg:w-1/4 px-6 w-5/12 px-6">
                                <h5>商品狀態</h5>
                                <p>配送完成</p>
                              </div>
                              <div className="user-order-item-instrument-detail-row-col-address lg:w-1/3 px-6 w-5/12 px-6">
                                <h5>配送地址</h5>
                                <p>320桃園市中壢區新生路二段421號</p>
                              </div>
                            </div>
                          </div>
                        </div> */}

                        {/* {OrderData.productResult ? 
                        <div className="user-order-item-instrument ">
                          <div className="user-order-item-instrument-leftSide lg:w-1/4 px-6 w-full px-6">
                            <div className="user-order-item-instrument-leftSide-img">
                              <Image src={produceTestImage} alt='' priority style={{ borderRadius: 10, padding:5 }} width={150} height={150}></Image>
                            </div>
                           
                          </div>
                          <div className="user-order-item-instrument-detail lg:w-3/4 px-6 w-full px-6">
                            <div className="user-order-item-instrument-detail-row ">
                              <div className="user-order-item-instrument-detail-row-col-productName">
                                <p>
                                  <span>商品名稱：</span> { userOrderData.productResult[0][0].name} {OrderData.productResult[0][0].quantity != 1  ?   "  *  " + OrderData.productResult[0][0].quantity : ''}
                                </p>
                                
                              </div>
                            </div>
                            <div className="user-order-item-instrument-detail-row flex flex-wrap -mx-3">
                              <div className="user-order-item-instrument-detail-row-col lg:w-1/4 px-6 w-5/12 px-6">
                                <h5>訂單編號</h5>
                                <p>{OrderData.productResult[0][0].order_id + 31700023464729}</p>
                              </div>
                              <div className="user-order-item-instrument-detail-row-col lg:w-1/4 px-6 w-5/12 px-6">
                                <h5>購買日期</h5>
                                <p>{OrderData.productResult[0][0].onshelf_time}</p>
                              </div>
                              <div className="user-order-item-instrument-detail-row-col lg:w-1/4 px-6 w-full px-6">
                                <h5>付款金額</h5>
                                <p>{OrderData.productResult[0][0].price * OrderData.productResult[0][0].quantity}</p>
                              </div>
                            </div>
                            <div className="user-order-item-instrument-detail-row flex flex-wrap -mx-3">
                              <div className="user-order-item-instrument-detail-row-col lg:w-1/4 px-6 w-5/12 px-6">
                                <h5>付款方式</h5>
                                <p>信用卡</p>
                              </div>
                              <div className="user-order-item-instrument-detail-row-col lg:w-1/4 px-6 w-5/12 px-6">
                                <h5>商品狀態</h5>
                                <p>{OrderData.productResult[0][0].transportation_state}</p>
                              </div>
                              <div className="user-order-item-instrument-detail-row-col-address lg:w-1/3 px-6 w-5/12 px-6">
                                <h5>配送地址</h5>
                                <p>{OrderData.productResult[0][0].postcode}{OrderData.productResult[0][0].country}{OrderData.productResult[0][0].township}{OrderData.productResult[0][0].address}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        : ''} */}

                        {/* {userOrderData.productResult && userOrderData.productResult.map((product, index) => (
                          <div className="user-order-item-instrument" key={index}>
                            <div className="user-order-item-instrument-leftSide lg:w-1/4 px-6 w-full px-6">
                              <div className="user-order-item-instrument-leftSide-img">
                                <Image src={product.image} alt={product.name} priority style={{ borderRadius: 10, padding:5 }} width={150} height={150}></Image>
                              </div>
                              
                            </div>
                            <div className="user-order-item-instrument-detail lg:w-3/4 px-6 w-full px-6">
                              <div className="user-order-item-instrument-detail-row">
                                <div className="user-order-item-instrument-detail-row-col-productName">
                                  <p>
                                    <span>商品名稱：</span> {product[0].name} {product[0].quantity !== 1 ? ` * ${product[0].quantity}` : ''}
                                  </p>
                                </div>
                              </div>
                              <div className="user-order-item-instrument-detail-row flex flex-wrap -mx-3">
                                <div className="user-order-item-instrument-detail-row-col lg:w-1/4 px-6 w-5/12 px-6">
                                  <h5>訂單編號</h5>
                                  <p>{product.order_id + 31700023464729}</p>
                                </div>
                                <div className="user-order-item-instrument-detail-row-col lg:w-1/4 px-6 w-5/12 px-6">
                                  <h5>購買日期</h5>
                                  <p>{product.onshelf_time}</p>
                                </div>
                                <div className="user-order-item-instrument-detail-row-col lg:w-1/4 px-6 w-full px-6">
                                  <h5>付款金額</h5>
                                  <p>{product.price * product.quantity}</p>
                                </div>
                              </div>
                              <div className="user-order-item-instrument-detail-row flex flex-wrap -mx-3">
                                <div className="user-order-item-instrument-detail-row-col lg:w-1/4 px-6 w-5/12 px-6">
                                  <h5>付款方式</h5>
                                  <p>信用卡</p>
                                </div>
                                <div className="user-order-item-instrument-detail-row-col lg:w-1/4 px-6 w-5/12 px-6">
                                  <h5>商品狀態</h5>
                                  <p>{product.transportation_state}</p>
                                </div>
                                <div className="user-order-item-instrument-detail-row-col-address lg:w-1/3 px-6 w-5/12 px-6">
                                  <h5>配送地址</h5>
                                  <p>{product.postcode}{product.country}{product.township}{product.address}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))} */}

                        {userOrderData.productResult &&
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          userOrderData.productResult.map((productList: any[], index: number) => {
                            const first = productList[0]
                            const isOpen = selectedOrderIndex === index
                            const totalAmount = productList.reduce(
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              (sum: number, p: any) => sum + p.price * p.quantity,
                              0
                            )
                            return (
                              <div className="order-accordion" key={index}>
                                {/* 可點擊的訂單摘要列 */}
                                <div
                                  className="user-order-item-instrument order-accordion-header"
                                  role="button"
                                  onClick={() => setSelectedOrderIndex(isOpen ? null : index)}
                                >
                                  <div
                                    className="user-order-item-instrument-leftSide lg:w-1/4 px-6 w-full px-6"
                                    style={{ paddingTop: 25 }}
                                  >
                                    <div className="user-order-item-instrument-leftSide-img">
                                      <Image
                                        src={`/smallForOrder/${first.img_small}`}
                                        alt={first.name}
                                        priority
                                        style={{
                                          borderRadius: 10,
                                          padding: 5,
                                          height: '100%',
                                          width: '100%',
                                          objectFit: 'contain',
                                        }}
                                        width={150}
                                        height={150}
                                      />
                                    </div>
                                  </div>
                                  <div
                                    className="user-order-item-instrument-detail lg:w-3/4 px-6 w-full px-6"
                                    style={{ paddingTop: 15 }}
                                  >
                                    <div className="user-order-item-instrument-detail-row">
                                      <div className="user-order-item-instrument-detail-row-col-productName">
                                        <p>
                                          <span>商品名稱：</span>
                                          {first.name}
                                          {productList.length > 1 ? ` 等 ${productList.length} 項商品` : ''}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="user-order-item-instrument-detail-row flex flex-wrap -mx-3">
                                      <div className="user-order-item-instrument-detail-row-col lg:w-1/4 px-6 w-5/12 px-6">
                                        <h5>訂單編號</h5>
                                        <p>{first.order_id + 31700023464729}</p>
                                      </div>
                                      <div className="user-order-item-instrument-detail-row-col lg:w-1/4 px-6 w-5/12 px-6">
                                        <h5>購買日期</h5>
                                        <p>{first.onshelf_time.split('T')[0]}</p>
                                      </div>
                                      <div className="user-order-item-instrument-detail-row-col lg:w-1/4 px-6 w-full px-6">
                                        <h5>付款金額</h5>
                                        <p>${totalAmount.toLocaleString()}</p>
                                      </div>
                                    </div>
                                    <div className="user-order-item-instrument-detail-row flex flex-wrap -mx-3">
                                      <div className="user-order-item-instrument-detail-row-col lg:w-1/4 px-6 w-5/12 px-6">
                                        <h5>付款方式</h5>
                                        <p>信用卡</p>
                                      </div>
                                      {first.type == '1' && (
                                        <div className="user-order-item-instrument-detail-row-col lg:w-1/4 px-6 w-5/12 px-6">
                                          <h5>商品狀態</h5>
                                          <p>{first.transportation_state}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {/* 展開箭頭 */}
                                  <div className={`order-chevron${isOpen ? ' open' : ''}`}>
                                    <FaChevronRight size={16} />
                                  </div>
                                </div>

                                {/* 展開的訂單明細 */}
                                {isOpen && (
                                  <div className="order-accordion-body">
                                    <div className="order-detail-items">
                                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                      {productList.map((product: any, i: number) => (
                                        <div className="order-detail-item" key={i}>
                                          <div className="order-detail-item-img">
                                            <Image
                                              src={`/smallForOrder/${product.img_small}`}
                                              alt={product.name}
                                              width={70}
                                              height={70}
                                              style={{ objectFit: 'contain', borderRadius: 6, padding: 4 }}
                                            />
                                          </div>
                                          <div className="order-detail-item-info">
                                            <span className="order-detail-item-name">{product.name}</span>
                                            <span className="order-detail-item-meta">
                                              單價 ${Number(product.price).toLocaleString()} × {product.quantity}
                                            </span>
                                          </div>
                                          <div className="order-detail-item-subtotal">
                                            ${(product.price * product.quantity).toLocaleString()}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                    {first.type == '1' && (
                                      <div className="order-detail-shipping">
                                        <span>商品狀態：{first.transportation_state}</span>
                                        <span>配送地址：{first.postcode}{first.country}{first.township}{first.address}</span>
                                      </div>
                                    )}
                                    <div className="order-detail-total">
                                      合計：${totalAmount.toLocaleString()}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })}

                        {/* <div className="user-order-item-lesson">
                          <div className="user-order-item-lesson-leftSide">
                            <div className="user-order-item-lesson-leftSide-img">
                              <img src="" alt="" />
                            </div>
                            <div className="user-order-item-lesson-leftSide-btn btn btn-primary">
                              修改訂單
                            </div>
                          </div>
                          <div className="user-order-item-lesson-detail">
                            <div className="user-order-item-lesson-detail-row">
                              <div className="user-order-item-lesson-detail-row-col-productName">
                                <p>
                                  <span>商品名稱：</span> 上課
                                </p>
                              </div>
                            </div>
                            <div className="user-order-item-lesson-detail-row">
                              <div className="user-order-item-lesson-detail-row-col">
                                <h5>訂單編號</h5>
                                <p>31700023464729</p>
                              </div>
                              <div className="user-order-item-lesson-detail-row-col">
                                <h5>購買日期</h5>
                                <p>2024/01/14</p>
                              </div>
                              <div className="user-order-item-lesson-detail-row-col ">
                                <h5>付款金額</h5>
                                <p>$ 72000</p>
                              </div>
                            </div>
                            <div className="user-order-item-lesson-detail-row">
                              <div className="user-order-item-lesson-detail-row-col">
                                <h5>付款方式</h5>
                                <p>信用卡</p>
                              </div>
                            </div>
                          </div>
                        </div> */}
                      </div>

                      {/* <div className="user-orderList-pagination">
                        <p>待放分頁元件 注意class</p>
                      </div> */}
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
        /* --------------- user-contect-order--------------- */

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

          .user-content {
            display: flex;
            width: 1070px;
            padding: 20px 10px;
            margin: 0;
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
            border-radius: 5px;
            background: var(--gray-30, rgba(185, 185, 185, 0.3));
          }

          .user-content-top {
            display: flex;
            align-items: flex-start;
            align-self: stretch;
            color: var(--primary-deep, #124365);
            text-align: center;
            /* h3 */
            font-family: 'Noto Sans TC';
            font-size: 28px;
            font-style: normal;
            font-weight: 700;
            line-height: normal;
          }

          .user-order-item-instrument {
            /* padding-left: 25px;*/
            display: flex;
            width: 1050px;
            /*height: 250px;*/
            align-items: center;
            gap: 20px;
            border-bottom: 1px solid var(--body, #b9b9b9);

            @media screen and (max-width: 576px) {
              flex-direction: column;
            }

            .user-order-item-instrument-leftSide {
              /* padding-left: 25px; */
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              gap: 10px;

              .user-order-item-instrument-leftSide-img {
                display: flex;
                width: 150px;
                height: 150px;
                align-items: flex-start;
                gap: 10px;
                border-radius: 10px;
                border: 1px solid var(--body, #b9b9b9);
                background: #fff;
              }

              .user-order-item-instrument-leftSide-btn {
                display: flex;
                padding: 3px 15px;
                justify-content: center;
                align-items: center;
                gap: 10px;
                border-radius: 5px;
                background: var(--primary, #1581cc);
              }
            }

            .user-order-item-instrument-detail {
              /*padding-left: 25px; */
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: flex-start;
              /* gap: 30px; */
              flex: 1 0 0;

              .user-order-item-instrument-detail-row {
                display: flex;
                align-items: center;
                gap: 5px;
                align-self: stretch;

                .user-order-item-instrument-detail-row-col-productName {
                  width: 700px;
                  padding: 0px 20px 5px 0px;
                  font-size: 20px;
                  @media screen and (max-width: 576px) {
                    margin-left: 30px;
                  }

                  & span {
                    font-family: 'Noto Sans TC';
                    font-style: normal;
                    font-weight: 400;
                    line-height: normal;
                    color: var(--primary-deep, #124365);
                  }
                }

                .user-order-item-instrument-detail-row-col {
                  display: flex;
                  padding: 0px 20px 5px 0px;
                  align-items: center;
                  display: -webkit-box;
                  -webkit-box-orient: vertical;
                  -webkit-line-clamp: 2;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  @media screen and (max-width: 576px) {
                    margin-left: 30px;
                  }
                }

                .user-order-item-instrument-detail-row-col-address {
                  /*width: 800px;*/
                  padding: 0px 20px 5px 0px;
                  @media screen and (max-width: 576px) {
                    margin-left: 30px;
                  }
                  & h5 {
                    font-family: 'Noto Sans TC';
                    font-size: 20px;
                    font-style: normal;
                    font-weight: 400;
                    line-height: normal;
                    color: var(--primary-deep, #124365);
                  }
                }
              }
            }
          }

          .user-order-item-lesson {
            /* padding-left: 25px; */
            display: flex;
            width: 1050px;
            height: 250px;
            align-items: center;
            gap: 20px;
            border-bottom: 1px solid var(--body, #b9b9b9);

            .user-order-item-lesson-leftSide {
              /* padding-left: 25px; */
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              gap: 10px;

              .user-order-item-lesson-leftSide-img {
                display: flex;
                width: 150px;
                height: 150px;
                align-items: flex-start;
                gap: 10px;
                border-radius: 10px;
                border: 1px solid var(--body, #b9b9b9);
                background: #fff;
              }

              .user-order-item-lesson-leftSide-btn {
                display: flex;
                padding: 3px 15px;
                justify-content: center;
                align-items: center;
                gap: 10px;
                border-radius: 5px;
                background: var(--primary, #1581cc);
              }
            }

            .user-order-item-lesson-detail {
              /*padding-left: 25px;*/
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: flex-start;
              /* gap: 30px; */
              flex: 1 0 0;

              .user-order-item-lesson-detail-row {
                display: flex;
                align-items: center;
                gap: 5px;
                align-self: stretch;

                .user-order-item-lesson-detail-row-col-productName {
                  width: 700px;
                  padding: 0px 20px 5px 0px;
                  font-size: 20px;

                  & span {
                    font-family: 'Noto Sans TC';
                    font-style: normal;
                    font-weight: 400;
                    line-height: normal;
                    color: var(--primary-deep, #124365);
                  }
                }

                .user-order-item-lesson-detail-row-col {
                  width: 200px;
                  display: flex;
                  padding: 0px 20px 5px 0px;
                  align-items: center;

                  display: -webkit-box;
                  -webkit-box-orient: vertical;
                  -webkit-line-clamp: 2;
                  overflow: hidden;

                  text-overflow: ellipsis;
                }
              }
            }
          }

          .user-orderList-pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            align-self: stretch;
          }
        }

        /* ------- accordion ------- */
        .order-accordion {
          border-bottom: 1px solid var(--body, #b9b9b9);
        }

        .order-accordion-header {
          cursor: pointer;
          border-bottom: none !important;
          display: flex;
          align-items: center;
          &:hover {
            background: rgba(21, 129, 204, 0.04);
          }
        }

        .order-chevron {
          flex-shrink: 0;
          padding-right: 12px;
          color: #888;
          transition: transform 0.2s ease;
          &.open {
            transform: rotate(90deg);
          }
        }

        .order-accordion-body {
          padding: 16px 24px 20px;
          background: #f8fafc;
          border-top: 1px solid #e8edf2;
        }

        .order-detail-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .order-detail-item {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .order-detail-item-img {
          width: 70px;
          height: 70px;
          flex-shrink: 0;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .order-detail-item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .order-detail-item-name {
          font-size: 15px;
          font-weight: 500;
          color: #124365;
        }

        .order-detail-item-meta {
          font-size: 13px;
          color: #666;
        }

        .order-detail-item-subtotal {
          font-size: 15px;
          font-weight: 600;
          color: #1d1d1d;
          white-space: nowrap;
        }

        .order-detail-shipping {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 13px;
          color: #555;
          padding: 12px 0 8px;
          border-top: 1px solid #e0e0e0;
        }

        .order-detail-total {
          text-align: right;
          font-size: 16px;
          font-weight: 700;
          color: #124365;
          padding-top: 12px;
          border-top: 1px solid #e0e0e0;
        }
        /* ------- accordion ------- */

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
            .user-order-item-instrument {
              width: 370px;
              overflow: hidden;
            }

            .user-order-item-instrument-detail-row-col-address {
              width: 370px;
              overflow: hidden;
            }

            .user-order-item-lesson {
              width: 370px;
              overflow: hidden;
            }
          }
        }
        /* RWD讓SIDEBAR消失 測試用記得刪 */
      `}</style>
    </>
  )
}
