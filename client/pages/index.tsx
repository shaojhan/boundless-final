import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/user/use-auth'
import { apiBaseUrl } from '@/configs'
import { authFetch } from '@/lib/api-client'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import Navbar from '@/components/common/navbar'
import NavbarMb from '@/components/common/navbar-mb'
import Footer from '@/components/common/footer'
import Link from 'next/link'
import Image from 'next/image'
import Head from 'next/head'
import 'animate.css'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
// scss
import styles from './index.module.scss'
import { useMenuToggle } from '@/hooks/useMenuToggle'

export default function Index() {
  const router = useRouter()
  // ----------------------會員登入狀態 & 會員資料獲取  ----------------------
  //從hook 獲得使用者登入的資訊  儲存在變數LoginUserData裡面
  const { LoginUserData, isAuth } = useAuth()
  const [carouselData, setCarouselData] = useState([])

  // ── 個人化推薦 ──────────────────────────────────────────────────────────────
  const [personalized, setPersonalized] = useState<{
    instruments: { puid: string | null; name: string | null; img: string | null; img_small: string | null; price: number | null; category_name: string | null }[]
    lessons: { puid: string | null; name: string | null; img: string | null; price: number | null; category_name: string | null }[]
  } | null>(null)

  useEffect(() => {
    if (!isAuth) return
    authFetch(`${apiBaseUrl}/recommendation/personalized?limit=4`)
      .then((r) => r.json())
      .then((res) => { if (res.status === 'success') setPersonalized(res.data) })
      .catch(() => {})
  }, [isAuth])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [instrCarouselIdx, setInstrCarouselIdx] = useState(0)
  const [lessonCarouselIdx, setLessonCarouselIdx] = useState(0)
  const slideIntervals = [6000, 6000, 6000, 6000, 4000]
  const carouselUseData =
    carouselData.length > 0
      ? [...carouselData, { img: 'banner.jpg', url: '/coupon/couponAdd' }]
      : []
  const getData = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/`)

      // res.json()是解析res的body的json格式資料，得到JS的資料格式
      const result = await res.json()

      // 設定到state中，觸發重新渲染(re-render)，會進入到update階段
      // 進入狀態前檢查資料類型為陣列，以避免錯誤
      if (result.status == 'success') {
        setCarouselData(result.data)
      }
    } catch (e) {
      console.error(e)
    }
  }
  useEffect(() => {
    getData()
  }, [])

  // 自動輪播
  useEffect(() => {
    if (carouselUseData.length === 0) return
    const interval = slideIntervals[currentSlide] ?? 5000
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselUseData.length)
    }, interval)
    return () => clearTimeout(timer)
  }, [currentSlide, carouselUseData.length])
  // -------------------------------------------------- 手機版本  --------------------------------------------------
  // 主選單
  const { showMenu, menuMbToggle } = useMenuToggle()
  const checkLogin = () => {
    toast('請先登入', {
      icon: 'ℹ️',
      style: {
        border: '1px solid #666666',
        padding: '16px',
        color: '#1d1d1d',
      },
      duration: 2000,
    })
  }
  return (
    <>
      <Head>
        <title>Boundless 線上音樂學習平台</title>
      </Head>
      <Navbar menuMbToggle={menuMbToggle} />
      <div className={`container-fill relative ${styles.minHeight95}`}>
        {/* 手機版主選單/navbar */}
        <div
          className={`menu-mb sm:hidden flex flex-col items-center ${
            showMenu ? 'menu-mb-show' : ''
          }`}
        >
          <NavbarMb />
        </div>
        <div>
          <h1 hidden>Boundless 線上音樂學習平台</h1>
          {/* 圖片輪播 */}
          <section className="carousel-section">
            <div className="relative overflow-hidden rounded-[10px]">
              {/* 投影片容器 */}
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {carouselUseData.map((v, i) => {
                  if (i < 4) {
                    return (
                      <Link
                        key={v.puid}
                        href={`/lesson/${v.lesson_category_name}/${v.puid}`}
                        className="relative w-full shrink-0 block"
                      >
                        <Image
                          src={`/課程與師資/lesson_img/${v.img}`}
                          alt="..."
                          fill
                        />
                      </Link>
                    )
                  } else {
                    return (
                      <div
                        key={v.url ?? i}
                        className={`relative w-full shrink-0 ${styles.cursorPointer}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          if (LoginUserData.id) {
                            router.push(v.url)
                          } else {
                            checkLogin()
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (LoginUserData.id) {
                              router.push(v.url)
                            } else {
                              checkLogin()
                            }
                          }
                        }}
                      >
                        <Image src={`/${v.img}`} alt="..." fill />
                      </div>
                    )
                  }
                })}
              </div>
              {/* Indicator dots */}
              {carouselUseData.length > 0 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  {carouselUseData.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Slide ${i + 1}`}
                      onClick={() => setCurrentSlide(i)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        i === currentSlide ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
              {/* Prev button */}
              <button
                type="button"
                aria-label="Previous"
                onClick={() =>
                  setCurrentSlide(
                    (prev) =>
                      (prev - 1 + carouselUseData.length) %
                      carouselUseData.length,
                  )
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/30 rounded-full hover:bg-black/50 text-white"
              >
                <FaChevronLeft size={16} />
              </button>
              {/* Next button */}
              <button
                type="button"
                aria-label="Next"
                onClick={() =>
                  setCurrentSlide((prev) => (prev + 1) % carouselUseData.length)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/30 rounded-full hover:bg-black/50 text-white"
              >
                <FaChevronRight size={16} />
              </button>
            </div>
          </section>
          {/* 個人化推薦區塊（登入後顯示） */}
          {isAuth && personalized && (personalized.instruments.length > 0 || personalized.lessons.length > 0) && (
            <section className="my-12 px-8">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold mb-8 text-center">為你推薦</h2>

                {/* 推薦樂器 */}
                {personalized.instruments.length > 0 && (
                  <div className="mb-12">
                    <h3 className="text-sm font-semibold mb-4 text-gray-400 tracking-widest uppercase">推薦樂器</h3>
                    <div className="relative">
                      <div className="overflow-hidden">
                        <div
                          className="flex gap-4 transition-transform duration-500 ease-in-out"
                          style={{ transform: `translateX(-${instrCarouselIdx * 208}px)` }}
                        >
                          {personalized.instruments.map((v) => (
                            <Link
                              key={v.puid}
                              href={`/instrument/${v.category_name ?? 'all'}/${v.puid}`}
                              className="flex-shrink-0 w-48 bg-white rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden"
                            >
                              <div className="relative w-48 h-48 bg-gray-50">
                                {v.img_small && v.category_name && (
                                  <Image
                                    src={`/instrument/${v.category_name}/small/${v.img_small}`}
                                    alt={v.name ?? ''}
                                    fill
                                    className="object-contain"
                                  />
                                )}
                              </div>
                              <div className="px-3 pt-2 pb-3">
                                <p className="text-sm font-medium text-gray-800 truncate">{v.name}</p>
                                <p className="text-sm font-semibold text-[#18a1ff] mt-1">
                                  NT$ {v.price?.toLocaleString() ?? '—'}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                      {instrCarouselIdx > 0 && (
                        <button
                          type="button"
                          aria-label="Previous instrument"
                          onClick={() => setInstrCarouselIdx((i) => i - 1)}
                          className="absolute left-0 top-1/2 -translate-x-5 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-md hover:bg-gray-50 text-gray-600 z-10"
                        >
                          <FaChevronLeft size={14} />
                        </button>
                      )}
                      {instrCarouselIdx < personalized.instruments.length - 3 && (
                        <button
                          type="button"
                          aria-label="Next instrument"
                          onClick={() => setInstrCarouselIdx((i) => i + 1)}
                          className="absolute right-0 top-1/2 translate-x-5 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-md hover:bg-gray-50 text-gray-600 z-10"
                        >
                          <FaChevronRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 推薦課程 */}
                {personalized.lessons.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-4 text-gray-400 tracking-widest uppercase">推薦課程</h3>
                    <div className="relative">
                      <div className="overflow-hidden">
                        <div
                          className="flex gap-4 transition-transform duration-500 ease-in-out"
                          style={{ transform: `translateX(-${lessonCarouselIdx * 208}px)` }}
                        >
                          {personalized.lessons.map((v) => (
                            <Link
                              key={v.puid}
                              href={`/lesson/${v.category_name ?? 'all'}/${v.puid}`}
                              className="flex-shrink-0 w-48 bg-white rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden"
                            >
                              <div className="relative w-48 h-48 bg-gray-50">
                                {v.img && (
                                  <Image
                                    src={`/課程與師資/lesson_img/${v.img}`}
                                    alt={v.name ?? ''}
                                    fill
                                    className="object-cover"
                                  />
                                )}
                              </div>
                              <div className="px-3 pt-2 pb-3">
                                <p className="text-sm font-medium text-gray-800 truncate">{v.name}</p>
                                <p className="text-sm font-semibold text-[#18a1ff] mt-1">
                                  NT$ {v.price?.toLocaleString() ?? '—'}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                      {lessonCarouselIdx > 0 && (
                        <button
                          type="button"
                          aria-label="Previous lesson"
                          onClick={() => setLessonCarouselIdx((i) => i - 1)}
                          className="absolute left-0 top-1/2 -translate-x-5 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-md hover:bg-gray-50 text-gray-600 z-10"
                        >
                          <FaChevronLeft size={14} />
                        </button>
                      )}
                      {lessonCarouselIdx < personalized.lessons.length - 3 && (
                        <button
                          type="button"
                          aria-label="Next lesson"
                          onClick={() => setLessonCarouselIdx((i) => i + 1)}
                          className="absolute right-0 top-1/2 translate-x-5 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-md hover:bg-gray-50 text-gray-600 z-10"
                        >
                          <FaChevronRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
          {/* 課程區塊 */}
          <section className="lesson-section flex flex-wrap -mx-3 items-center mx-0">
            {/* 雲 */}
            <div className="cloud-item cloud1">
              <Image src="/asset/cloud1.png" width={185} height={120} alt="" />
            </div>
            <div className="cloud-item cloud2">
              <Image src="/asset/cloud2.png" width={380} height={200} alt="" />
            </div>
            <div className="cloud-item cloud3">
              <Image src="/asset/cloud1.png" width={240} height={160} alt="" />
            </div>
            <div className="w-1/2 px-6 hidden sm:flex flex-col justify-center items-center px-12">
              <h2 className={`mb-12 text-center ${styles.title40}`}>
                從休閒到專業
                <br />
                精彩課程拓展你的音樂邊界
              </h2>
              <Link className="b-btn b-lesson-btn px-12 py-6" href="/lesson">
                開始探索
              </Link>
            </div>
            <div className="w-1/2 px-6 hidden sm:flex justify-end px-0">
              <div className="lesson-section-img">
                <Image src="/asset/lesson.png" fill alt="" />
              </div>
            </div>
            {/* 課程區塊-手機版 */}
            <div className="flex sm:hidden flex-col items-center">
              <h2 className="text-center">
                從休閒到專業
                <br />
                精彩課程拓展你的音樂邊界
              </h2>
              <div className="lesson-section-img my-6">
                <Image src="/asset/lesson_round.png" fill alt="" />
              </div>
              <Link className="b-btn b-lesson-btn px-6 py-2" href="/lesson">
                開始探索
              </Link>
            </div>
          </section>
          {/* 樂器區塊 */}
          <section className="instrument-section flex flex-wrap -mx-3 items-center mx-0">
            <div className="w-1/2 px-6 hidden sm:flex justify-end px-0">
              <div className="instrument-section-img">
                <Image src="/asset/instrument.png" fill alt="" />
              </div>
            </div>
            <div className="w-1/2 px-6 hidden sm:flex flex-col justify-center items-center px-12">
              <h2
                className={`mb-12 text-center ${styles.instrumentTitle}`}
              >
                工欲善其事，必先利其器
                <br />
                百種樂器任君挑選
              </h2>
              <Link
                className="b-btn b-instrument-btn px-12 py-6"
                href="/instrument"
              >
                來去逛逛
              </Link>
            </div>
            {/* 樂器區塊-手機版 */}
            <div className="flex sm:hidden flex-col items-center">
              <h2 className={`text-center ${styles.instrumentTitleMb}`}>
                工欲善其事，必先利其器
                <br />
                百種樂器任君挑選
              </h2>
              <div className="instrument-section-img my-6">
                <Image src="/asset/instrument.png" fill alt="" />
              </div>
              <Link
                className="b-btn b-instrument-btn px-6 py-2"
                href="/instrument"
              >
                來去逛逛
              </Link>
            </div>
          </section>
          {/* 樂團區塊 */}
          <section className="jam-section flex flex-wrap -mx-3 items-center mx-0">
            <div className="w-full px-6 px-0">
              <div className="jam-section-img">
                <Image src="/asset/jam.png" fill alt="" />
              </div>
            </div>
            <div className="jam-text w-full px-6 flex flex-col justify-center items-center px-12">
              <h2 className="slogan mb-6 sm:mb-12 text-center">
                線上組團媒合幫你尋覓知音
                <br />
                Let’s JAM!
              </h2>
              <Link
                className="b-btn b-jam-btn px-6 sm:px-12 py-2 sm:py-6"
                href="/jam/recruit-list"
              >
                立即應徵
              </Link>
            </div>
          </section>
          {/* 文章區塊 */}
          <section className="article-section flex flex-wrap -mx-3 items-center mx-0">
            <div className="w-1/2 px-6 hidden sm:flex px-0">
              <div className="article-section-img">
                <Image src="/asset/article.png" fill alt="" />
              </div>
            </div>
            <div className="w-1/2 px-6 hidden sm:flex flex-col justify-center items-center px-12">
              <h2 className={`mb-12 text-center ${styles.title40}`}>
                滿腹想法無處傾瀉？
                <br />
                樂友論壇歡迎你的獨到見解
              </h2>
              <Link
                className="b-btn b-article-btn px-12 py-6"
                href="/article-list"
              >
                查看文章
              </Link>
            </div>
            {/* 文章區塊-手機版 */}
            <div className="flex sm:hidden flex-col items-center">
              <h2 className="text-center">
                滿腹想法無處傾瀉？
                <br />
                樂友論壇歡迎你的獨到見解
              </h2>
              <div className="article-section-img my-6">
                <Image src="/asset/article_round.png" fill alt="" />
              </div>
              <Link
                className="b-btn b-article-btn px-6 py-2"
                href="/article-list"
              >
                查看文章
              </Link>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  )
}
