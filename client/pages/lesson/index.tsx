import { apiBaseUrl } from '@/configs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '@/components/common/navbar'
import NavbarMb from '@/components/common/navbar-mb'
import Footer from '@/components/common/footer'
//試抓資料區
import Card from '@/components/lesson/lesson-card'
import Cardrwd from '@/components/lesson/lesson-card-rwd'
// import Lesson from '@/data/Lesson.json'

import Link from 'next/link'
import Image from 'next/image'
import lessonHero from '@/assets/lesson-hero.jpg'
import Head from 'next/head'
// icons
import { IoHome } from 'react-icons/io5'
import { FaChevronRight } from 'react-icons/fa6'
import { IoIosSearch } from 'react-icons/io'
import { FaFilter } from 'react-icons/fa6'
import { FaSortAmountDown } from 'react-icons/fa'
import { IoClose } from 'react-icons/io5'

import BS5Pagination from '@/components/common/pagination'

// 會員認證hook
import { useAuth } from '@/hooks/user/use-auth'
import { useMenuToggle } from '@/hooks/useMenuToggle'
import { useFilterToggle } from '@/hooks/useFilterToggle'
import styles from './index.module.scss'

export default function LessonList() {
  const router = useRouter()
  // ----------------------會員登入狀態 & 會員資料獲取  ----------------------
  //從hook 獲得使用者登入的資訊  儲存在變數LoginUserData裡面
  useAuth()
  //登出功能
  // 舊版會警告 因為先渲染但沒路徑 bad
  // const avatarImage = `/user/${LoginUserData.img}`
  // const avatargoogle = `${LoginUserData.photo_url}`
  // const avatarDefault = `/user/avatar_userDefault.jpg`

  // ----------------------會員登入狀態  ----------------------

  // 在電腦版或手機版時
  const [isSmallScreen, setIsSmallScreen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 576)
    }

    handleResize()

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  // ----------------------手機版本  ----------------------
  // 主選單
  const { showMenu, menuMbToggle, showSidebar, setShowSidebar, sidebarToggle } =
    useMenuToggle()

  // ----------------------條件篩選  ----------------------
  const { filterVisible, onshow, stopPropagation } = useFilterToggle()
  // ----------------------假資料  ----------------------
  // 資料排序
  const [dataSort, setDataSort] = useState('upToDate')

  const [priceLow, setPriceLow] = useState('')
  const [priceHigh, setPriceHigh] = useState('')

  //-------------------連資料庫
  const perPage = 12
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPage, setTotalPage] = useState(0)
  const [LessonArray, setLessonArray] = useState([])

  function getLesson(signal?: AbortSignal) {
    return new Promise((resolve, reject) => {
      let url = `${apiBaseUrl}/lesson`
      fetch(url, {
        method: 'GET',
        credentials: 'include',
        signal,
      })
        .then((response) => {
          return response.json()
        })
        .then((result) => {
          // 将 result 每 perPage 条记录分成一页一页的数组
          const pages = result.reduce((acc, current, index) => {
            const tempPage = Math.floor(index / perPage) // 当前记录所在的页码
            if (!acc[tempPage]) {
              acc[tempPage] = [] // 如果该页不存在，则创建一个新的页数组
            }
            acc[tempPage].push(current) // 将当前记录添加到相应的页数组中
            return acc
          }, [])
          setTotalPage(pages.length)
          setLessonArray(pages[currentPage]) // 将分页后的结果传递给 resolve
        })
        .catch((error) => {
          if (error.name === 'AbortError') return
          console.error(error)
          reject()
        })
    })
  }
  useEffect(() => {
    const controller = new AbortController()
    getLesson(controller.signal)
    return () => controller.abort()
  }, [currentPage])

  const handlePageClick = (event) => {
    const newPage = event.selected
    setCurrentPage(newPage)
  }

  // 在组件中定义 isFiltered 状态，并提供一个函数来更新它的值
  const [isFiltered, setIsFiltered] = useState(false)
  //-----------所有過濾資料功能傳回來的地方

  const [data, setData] = useState(LessonArray)

  //-----------------篩選功能
  // 價格篩選
  //確保 priceLow 和 priceHigh 有被定義後再呼叫 priceRange 函式
  const priceRange = (priceLow, priceHigh) => {
    if (priceLow !== '' && priceHigh !== '') {
      fetch(`${apiBaseUrl}/lesson?priceLow=${priceLow}&priceHigh=${priceHigh}`)
        .then((response) => response.json()) //在網路請求成功時將回應物件轉換為 JSON 格式，並回傳一個新的 Promise 物件。這個新的 Promise 物件會在 JSON 解析成功後被解析，而且 data 參數會包含解析後的 JSON 資料。

        .then((data) => setData(data))
      setIsFiltered(true)
    }
  }

  //   課程評價篩選
  const scoreState = ['all', '5', '4', '3']
  const [score, setScore] = useState('all')
  const [confirmClicked, setConfirmClicked] = useState(false) // 新状态来跟踪确认按钮点击
  //   当点击确认按钮时触发的useEffect
  useEffect(() => {
    if (score === 'all') {
      setData(LessonArray)
    } else {
      const scoreNum = parseInt(score, 10)
      const filtered = LessonArray.filter(
        (lesson) => Math.round(lesson.average_rating) === scoreNum,
      )
      setData(filtered)
      setIsFiltered(true)
    }
    setConfirmClicked(false) // 处理完后重置确认按钮的点击状态
  }, [confirmClicked]) // 依赖于确认按钮点击状态

  // 促銷課程篩選
  const [_sales, setSales] = useState(false)

  // 监听confirmClicked变化，执行筛选逻辑
  // useEffect(() => {
  //   if (confirmClicked) {
  //     if (sales == true) {
  //       // 筛选促销课程
  //       const salesCourses = LessonArray.filter(
  //         (lesson) => lesson.discount_state == 1
  //       )
  //       setData(salesCourses)
  //       setIsFiltered(true)
  //     } else {
  //       // 不筛选，显示所有课程
  //       setData(LessonArray)
  //     }
  //     // 重置confirmClicked状态以便下次点击
  //     setConfirmClicked(false)
  //   }
  // }, [confirmClicked, sales]) // 添加sales作为依赖项，确保筛选逻辑正确执行

  // 点击确认按钮的处理函数
  const handleConfirmClick = () => {
    setConfirmClicked(true)
  }

  // 清除表單內容
  const cleanFilter = () => {
    setPriceLow('')
    setPriceHigh('')
    setScore('all')
    setSales(false)
    setData(LessonArray)
  }

  //-------------------搜尋功能
  const [search, setSearch] = useState('')
  const handleSearch = () => {
    let newData
    if (search.trim() === '') {
      newData = LessonArray
    } else {
      newData = LessonArray.filter((v, _i) => {
        return v.name.includes(search)
      })
    }

    setData(newData)
    setIsFiltered(true)
  }

  //-------------------排序功能

  //最熱門
  const sortBySales = () => {
    const sortedProducts = [...LessonArray].sort((a, b) => b.sales - a.sales)
    setData(sortedProducts)
    setIsFiltered(true)
  }

  //依評價
  const sortByRating = () => {
    const sortedProducts = [...LessonArray].sort(
      (a, b) => b.average_rating - a.average_rating,
    )
    setData(sortedProducts)
    setIsFiltered(true)
  }
  //依時數
  const sortBylength = () => {
    const sortedProducts = [...LessonArray].sort((a, b) => b.length - a.length)
    setData(sortedProducts)
    setIsFiltered(true)
  }

  //-------------------渲染分類功能li
  const [LessonCategory, setLessonCategory] = useState([])

  function getLessonCategory() {
    return new Promise((resolve, reject) => {
      let url = `${apiBaseUrl}/lesson/categories`
      fetch(url, {
        method: 'GET',
        credentials: 'include',
      })
        .then((response) => {
          return response.json()
        })
        .then((result) => {
          resolve(result)
          setLessonCategory(result)
        })
        .catch((error) => {
          console.error(error)
          reject()
        })
    })
  }

  useEffect(() => {
    getLessonCategory()
  }, [])

  //-------------------選定特定分類

  const [selectedCategory, setSelectedCategory] = useState<string | number>('') // 儲存所選分類
  function handleCategoryChange(id) {
    // 在這裡執行你的其他邏輯，比如更新狀態
    // 特別處理「全部」選項
    if (id === 0) {
      setSelectedCategory(0) // 使用空字串表示「全部」
    } else {
      setSelectedCategory(id)
    }
  }

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `${apiBaseUrl}/lesson/category/${selectedCategory}`,
        )
        const data = await response.json()

        setData(data) //連回渲染特定分類課程
      } catch (error) {
        console.error('Error fetching products:', error)
      }
      setIsFiltered(true)
    }
    //当selectedCategory变化时重新获取商品数据
    if (selectedCategory !== '') {
      fetchProducts()
    }
  }, [selectedCategory])

  // 選定特定分類後熱門課程消失
  const { category } = router.query // 從 Next.js router 得到 category 值
  const showHotCourses = !category // 有分類參數時隱藏熱門課程

  return (
    <>
      <Head>
        <title>探索課程</title>
      </Head>
      <Navbar menuMbToggle={menuMbToggle} />
      <div className="hero hidden sm:block">
        <Image src={lessonHero} className="object-cover w-full" alt="cover" />
      </div>
      <div className="container mx-auto px-6 relative">
        {/* <NavbarMB
          menuMbToggle={menuMbToggle}
          className={`menu-mb sm:hidden flex flex-col items-center ${
            showMenu ? 'menu-mb-show' : ''
          }`}
        /> */}
        {/* 手機版主選單/navbar */}
        <div
          className={`menu-mb sm:hidden flex flex-col items-center ${showMenu ? 'menu-mb-show' : ''}`}
        >
          <NavbarMb />
        </div>

        <div className="flex flex-wrap -mx-3">
          {/* sidebar */}
          <div className="sidebar-wrapper hidden sm:block  sm:w-1/6 px-6">
            <div className="sidebar">
              <ul className="flex flex-col">
                <Link href={'/lesson'} onClick={() => handleCategoryChange(0)}>
                  <li
                    className={selectedCategory === 0 ? styles.activeCategory : styles.inactiveCategory}
                  >
                    全部
                  </li>
                </Link>
                {/* 分類功能 */}
                {LessonCategory.map((v, index) => {
                  return (
                    <Link
                      key={index}
                      href={`/lesson?category=${v.id}`}
                      onClick={() => handleCategoryChange(v.id)}
                    >
                      <li
                        className={selectedCategory === v.id ? styles.activeCategory : styles.inactiveCategory}
                      >
                        {v.name}
                      </li>
                    </Link>
                  )
                })}
              </ul>
            </div>
          </div>

          {/* 頁面內容 */}
          <div className="w-full px-6 sm:w-5/6 px-6 page-control">
            {/* 手機版分類sidebar */}
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
              <Link href={`/lesson`} className="sm-item active">
                全部
              </Link>
              {LessonCategory.map((v, index) => {
                return (
                  <Link
                    key={index}
                    href={`/lesson/?category=${v.id}`}
                    className="sm-item"
                    onClick={() => {
                      handleCategoryChange(v.id)
                      setShowSidebar(false)
                    }}
                  >
                    {v.name}
                  </Link>
                )
              })}
            </div>

            {/* 頂部功能列 */}
            <div className="top-function-container">
              {/* 麵包屑 */}
              <div className="breadcrumb-wrapper">
                <ul className="flex items-center p-0 m-0">
                  <IoHome size={20} />
                  <li className={styles.bcItem1}>探索課程</li>
                  <FaChevronRight />
                  <li className={styles.bcItem2}>線上課程</li>
                </ul>
              </div>

              <div className="top-function-flex">
                {/*  ---------------------- 搜尋欄  ---------------------- */}
                <div className="search-sidebarBtn">
                  <div
                    className={`b-btn b-btn-body ${styles.sidebarTrigger}`}
                    role="presentation"
                    onClick={sidebarToggle}
                  >
                    課程分類
                  </div>
                  <div className="search flex">
                    {/* 輸入欄位 */}
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="請輸入課程名稱..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <div
                      // 搜尋按鈕
                      onClick={handleSearch}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      role="button"
                      tabIndex={0}
                      className="search-btn btn flex justify-center items-center p-0"
                    >
                      <IoIosSearch size={25} />
                    </div>
                  </div>
                </div>
                {/* 手機版排序 */}
                <div className="filter-sort flex justify-between">
                  <div className="sort-mb block sm:hidden">
                    <select
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                      value={dataSort}
                      name="dataSort"
                      onChange={(e) => {
                        const selectedValue = e.target.value
                        if (selectedValue === 'upToDate') {
                          sortBySales()
                        } else if (selectedValue === 'review') {
                          sortByRating()
                        } else if (selectedValue === 'classLength') {
                          sortBylength()
                        }
                        setDataSort(selectedValue)
                      }}
                    >
                      <option selected value="upToDate">
                        最熱門
                      </option>
                      <option value="review">依評價</option>
                      <option value="classLength">依時數</option>
                    </select>
                  </div>

                  {/* ----------------------條件篩選------------------ */}
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
                        {/* 價格區間 */}
                        <div className="filter-item">
                          <div className="filter-title">價格區間</div>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary mb-2"
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
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
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
                          <div className="filter-title">課程評價</div>
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
                                      //   onChange={(e) => {
                                      //     setScore(e.target.value)
                                      //   }}
                                      onChange={(e) => {
                                        const value = e.target.value
                                        setScore(
                                          value === 'all' ? 'all' : value,
                                        ) // 不需要转换为数字，如果你在比较时也转换了
                                      }}
                                    />
                                    &nbsp;{v === 'all' ? '全部' : v + '星'}
                                  </label>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                        <div className="flex justify-between gap-2">
                          <div
                            className="filter-btn clean-btn w-full flex justify-center"
                            role="presentation"
                            onClick={cleanFilter}
                          >
                            清除
                          </div>
                          <div
                            className="filter-btn confirm-btn w-full flex justify-center"
                            role="presentation"
                            onClick={() => {
                              priceRange(priceLow, priceHigh)

                              handleConfirmClick()
                            }}
                          >
                            確認
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                  {/* web版資料排序 */}
                  <div className="sort hidden sm:flex justify-between items-center">
                    <div className="flex items-center">
                      排序
                      <FaSortAmountDown size={14} />
                    </div>

                    <div
                      className="sort-item "
                      role="button"
                      tabIndex={0}
                      onClick={sortBySales}
                      onKeyDown={(e) => e.key === 'Enter' && sortBySales()}
                    >
                      最熱門
                    </div>
                    <div
                      className="sort-item"
                      role="button"
                      tabIndex={0}
                      onClick={sortByRating}
                      onKeyDown={(e) => e.key === 'Enter' && sortByRating()}
                    >
                      依評價
                    </div>
                    <div
                      className="sort-item"
                      role="button"
                      tabIndex={0}
                      onClick={sortBylength}
                      onKeyDown={(e) => e.key === 'Enter' && sortBylength()}
                    >
                      依時數
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* 主內容 */}
            <div className={`content ${styles.minHeight95}`}>
              {showHotCourses && (
                <div className="hot-lesson">
                  <h4 className="text-primary">熱門課程</h4>
                  <div className="hot-lesson-card-group">
                    {LessonArray.slice() // Create a copy of data array to avoid mutating original array
                      .sort((a, b) => b.sales - a.sales) // Sort courses based on sales volume
                      .slice(0, 4) // Get top 4 courses */
                      .map((v, i) => {
                        return (
                          <div className="hot-lesson-card" key={i}>
                            <Card
                              id={v.id}
                              luid={v.puid}
                              name={v.name}
                              average_rating={v.average_rating}
                              price={v.price}
                              teacher_name={v.teacher_name}
                              img={v.img}
                              length={v.length}
                              sales={v.sales}
                            />
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}
              <hr />
              {/*-------- 列表頁卡片迴圈------- */}
              <div className="lesson-card-group">
                {/* 更改為搜尋過後篩選出來的課程 */}

                {isFiltered &&
                  // 如果已经进行了筛选或搜索，渲染筛选后的 Lesson 数据
                  data.map((v, _i) => {
                    const {
                      lesson_category_name,
                      id,
                      puid,
                      name,
                      average_rating,
                      review_count,
                      price,
                      teacher_name,
                      teacher_id: _teacher_id,
                      img,
                      img_small,
                      sales,
                      length,
                    } = v
                    return (
                      <div className="lesson-card-item" key={id}>
                        {isSmallScreen ? (
                          <Cardrwd
                            lesson_category_id={lesson_category_name}
                            id={id}
                            luid={puid}
                            name={name}
                            average_rating={Math.round(average_rating)}
                            review_count={review_count}
                            price={price}
                            teacher_name={teacher_name}
                            img_small={img_small}
                            sales={sales}
                            length={length}
                          />
                        ) : (
                          <Card
                            lesson_category_id={lesson_category_name}
                            id={id}
                            luid={puid}
                            name={name}
                            average_rating={Math.round(average_rating)}
                            review_count={review_count}
                            price={price}
                            teacher_name={teacher_name}
                            img={img}
                            sales={sales}
                            length={length}
                          />
                        )}
                      </div>
                    )
                  })}

                {!isFiltered &&
                  // 如果没有进行筛选或搜索，渲染原始的 Lesson 数据
                  LessonArray.map((v, _i) => {
                    const {
                      lesson_category_name,
                      id,

                      puid,
                      name,
                      average_rating,
                      review_count,
                      price,
                      teacher_name,
                      teacher_id: _teacher_id2,
                      img,
                      img_small,
                      sales,
                      length,
                    } = v
                    return (
                      <div className="lesson-card-item" key={id}>
                        {isSmallScreen ? (
                          <Cardrwd
                            lesson_category_id={lesson_category_name}
                            id={id}
                            luid={puid}
                            name={name}
                            average_rating={Math.round(average_rating)}
                            review_count={review_count}
                            price={price}
                            teacher_name={teacher_name}
                            img_small={img_small}
                            sales={sales}
                            length={length}
                          />
                        ) : (
                          <Card
                            lesson_category_id={lesson_category_name}
                            id={id}
                            luid={puid}
                            name={name}
                            average_rating={Math.round(average_rating)}
                            review_count={review_count}
                            price={price}
                            teacher_name={teacher_name}
                            img={img}
                            sales={sales}
                            length={length}
                          />
                        )}
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        {!isFiltered && (
          <BS5Pagination
            forcePage={currentPage}
            onPageChange={handlePageClick}
            pageCount={totalPage}
          />
        )}
      </div>
      <Footer />
      <style jsx>{`
        .content {
          padding-inline: 22px;
        }
        .lesson-card-group {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 240px));
          justify-content: start;
          margin-block: 30px;
          gap: 24px;
        }
        .lesson-card-item,
        .hot-lesson-card {
          width: 240px;
        }
        .hot-lesson-card-group {
          margin-block: 30px;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 240px));
          justify-content: start;
          gap: 24px;
        }
        @media screen and (max-width: 576px) {
          .content {
            padding-inline: 0;
            display: flex;
          }
          .hot-lesson {
            display: none;
          }
          .lesson-card-group {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
          }
          .lesson-card-item,
          .hot-lesson-card {
            width: 100%;
          }
        }
      `}</style>
    </>
  )
}
