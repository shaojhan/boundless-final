import { useEffect, useState } from 'react'
import Navbar from '@/components/common/navbar'
import Footer from '@/components/common/footer'
import Link from 'next/link'
import Image from 'next/image'
import jamHero from '@/assets/jam-hero.png'
// icons
import { IoHome } from 'react-icons/io5'
import { FaChevronRight } from 'react-icons/fa6'
import { IoIosSearch } from 'react-icons/io'
import { FaFilter } from 'react-icons/fa6'
import { FaSortAmountDown } from 'react-icons/fa'
import { ImExit } from 'react-icons/im'
import { IoClose } from 'react-icons/io5'

export default function Test() {
  // ----------------------手機版本  ----------------------
  // 主選單
  const [showMenu, setShowMenu] = useState(false)
  const menuMbToggle = () => {
    setShowMenu(!showMenu)
  }
  // sidebar
  const [showSidebar, setShowSidebar] = useState(false)
  const sidebarToggle = () => {
    setShowSidebar(!showSidebar)
  }
  // ----------------------假資料  ----------------------
  // sidebar假資料
  const sidebarData = ['吉他', '貝斯', '鍵盤樂器', '打擊樂器']

  // 資料排序
  const [dataSort, setDataSort] = useState('latest')
  // ----------------------條件篩選  ----------------------
  const [filterVisible, setFilterVisible] = useState(false)
  useEffect(() => {
    document.addEventListener('click', (_e) => {
      setFilterVisible(false)
    })
  }, [])
  // 阻止事件冒泡造成篩選表單關閉
  const stopPropagation = (e) => {
    e.stopPropagation()
  }
  // 顯示表單
  const onshow = (e) => {
    stopPropagation(e)
    setFilterVisible(!filterVisible)
  }
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
      <Navbar menuMbToggle={menuMbToggle} />
      <div
        className="page-shero hidden sm:block"
        style={{ paddingTop: '60px' }}
      >
        <Image src={jamHero} className="object-cover w-full" alt="cover" />
      </div>
      <div className="container mx-auto px-6 relative">
        {/* 手機版主選單/navbar */}
        <div
          className={`menu-mb sm:hidden flex flex-col items-center ${showMenu ? 'menu-mb-show' : ''}`}
        >
          {/* 用戶資訊 */}
          <div className="menu-mb-user-info flex items-center flex-col mb-6">
            <div className="mb-photo-wrapper mb-2">
              <Image
                src="/jam/amazingshow.jpg"
                alt="user photo mb"
                fill
              ></Image>
            </div>
            <div>用戶名稱</div>
          </div>
          <Link
            className="mm-item"
            href="/user"
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
          <div className="mm-item" style={{ color: '#1581cc' }}>
            登出
            <ImExit size={20} className="ml-2" />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3">
          {/* sidebar */}
          <div className="sidebar-wrapper hidden sm:block sm:w-1/6 px-6">
            <div className="sidebar">
              <ul className="flex flex-col">
                {sidebarData.map((item, index) => {
                  return (
                    <li key={index}>
                      <Link href={`#`}>{item}</Link>
                    </li>
                  )
                })}
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
              <div className="breadcrumb-wrapper">
                <ul className="flex items-center p-0 m-0">
                  <IoHome size={20} />
                  <li style={{ marginLeft: '8px' }}>Let&apos;s JAM!</li>
                  <FaChevronRight />
                  <li style={{ marginLeft: '10px' }}>團員募集</li>
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
                      <option selected value="latest">
                        新到舊
                      </option>
                      <option value="oldest">舊到新</option>
                    </select>
                  </div>
                  {/*  ---------------------- 條件篩選  ---------------------- */}
                  <form className="flex items-center  relative">
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
                            <option selected value="all">
                              全部
                            </option>
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
                                      className="form-check-input"
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
            <main className="content"></main>
          </div>
        </div>
      </div>
      <Footer />

      <style jsx>{``}</style>
    </>
  )
}
