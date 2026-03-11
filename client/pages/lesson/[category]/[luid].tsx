import { apiBaseUrl } from '@/configs'
import { formatPrice } from '@/lib/utils/formatPrice'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useDetailFetch } from '@/hooks/useDetailFetch'
import Navbar from '@/components/common/navbar'
import Footer from '@/components/common/footer'
import NavbarMb from '@/components/common/navbar-mb'
import Link from 'next/link'
import Head from 'next/head'
// icons
import { IoHome } from 'react-icons/io5'
import { FaChevronRight } from 'react-icons/fa6'
import { FaStar, FaHeart, FaShoppingCart, FaBook } from 'react-icons/fa'
import { GoClock } from 'react-icons/go'
import { MdOutlinePeopleAlt } from 'react-icons/md'

import Card from '@/components/lesson/lesson-card'
import HoriCard from '@/components/lesson/lesson-card-rwd'

import { useCart } from '@/hooks/use-cart'
import { format } from 'date-fns'
import { useFilterToggle } from '@/hooks/useFilterToggle'
import { useMenuToggle } from '@/hooks/useMenuToggle'
import styles from './luid.module.scss'

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h2 className={`text-2xl font-bold ${styles.sectionTitle}`}>
        {title}
      </h2>
      <div className={`bg-gray-50 rounded-xl border border-gray-100 ${styles.sectionBody}`}>
        {children}
      </div>
    </div>
  )
}

export default function LessonDetailPage() {
  const { showMenu, menuMbToggle } = useMenuToggle()
  useFilterToggle()

  const [colorChange, setcolorChange] = useState(false)
  const colorToggle = () => setcolorChange(!colorChange)

  const { addLessonItem, notifyBuy } = useCart()
  const router = useRouter()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [LessonDetail, setLessonDetail] = useState({} as any)
  const [reviews, setReviews] = useState([])
  const [youWillLike, setYouWillLike] = useState([])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawData } = useDetailFetch<any>(
    router.isReady && router.query.luid
      ? `${apiBaseUrl}/lesson/${router.query.luid as string}`
      : null,
  )
  useEffect(() => {
    if (!rawData) return
    setLessonDetail(rawData.data[0])
    setReviews(rawData.product_review)
    setYouWillLike(rawData.youwilllike)
  }, [rawData])

  const toLocalePrice = formatPrice(LessonDetail.price)

  return (
    <>
      <Head>
        <title>{LessonDetail.name}</title>
      </Head>
      <Navbar menuMbToggle={menuMbToggle} />

      <div className="container mx-auto px-4 sm:px-6 relative">
        {/* Mobile navbar */}
        <div
          className={`menu-mb sm:hidden flex flex-col items-center ${showMenu ? 'menu-mb-show' : ''}`}
        >
          <NavbarMb />
        </div>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 py-5 text-sm text-gray-500 flex-wrap">
          <IoHome size={16} />
          <Link
            href="/lesson"
            className="hover:text-blue-600 transition-colors ml-1"
          >
            探索課程
          </Link>
          <FaChevronRight size={11} />
          <span>{LessonDetail.lesson_category_name}</span>
          <FaChevronRight size={11} />
          <span className="text-gray-800 font-medium truncate max-w-[160px] sm:max-w-none">
            {LessonDetail.name}
          </span>
        </nav>

        {/* ── Hero: 圖左、描述右 ── */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 ${styles.heroGrid}`}
        >
          {/* 課程圖片 */}
          <div className="w-full aspect-video rounded-xl overflow-hidden bg-gray-100 shadow-sm self-start">
            <img
              src={`/課程與師資/lesson_img/${LessonDetail.img}`}
              className="w-full h-full object-cover"
              alt={LessonDetail.name || 'Course Preview'}
            />
          </div>

          {/* 課程描述 */}
          <div className={`flex flex-col self-start ${styles.descCol}`}>
            <h1 className="text-2xl font-bold text-gray-900 leading-snug">
              {LessonDetail.name}
            </h1>

            {/* 評分 & 購買人數 */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <FaStar className="text-yellow-400" size={15} />
                <span className="text-yellow-500 font-semibold">
                  {Math.round(LessonDetail.average_rating)}
                </span>
                <span className="text-gray-400 text-sm">
                  ({reviews.length} 評論)
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                <MdOutlinePeopleAlt size={15} />
                <span>購買人數 {LessonDetail.sales}</span>
              </div>
            </div>

            {/* 價格 & 收藏 */}
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-gray-900">
                NT$ {toLocalePrice}
              </div>
              <button
                onClick={colorToggle}
                className="p-2 border border-gray-300 rounded-lg hover:border-red-400 transition-colors"
                aria-label="收藏"
              >
                <FaHeart
                  size={22}
                  className={colorChange ? 'text-red-500' : 'text-gray-300'}
                />
              </button>
            </div>

            {/* 時長 & 作業 */}
            <div className="flex gap-5 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <GoClock size={15} className="text-blue-500" />
                <span>{LessonDetail.length} 小時</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FaBook size={13} className="text-blue-500" />
                <span>{LessonDetail.homework} 份作業</span>
              </div>
            </div>

            {/* 簡介 */}
            <p className="text-gray-600 text-sm leading-relaxed">
              {LessonDetail.info}
            </p>

            {/* 購買按鈕（桌機版顯示）*/}
            <div className="hidden md:flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  notifyBuy(LessonDetail.name)
                  addLessonItem(LessonDetail)
                }}
                className="flex items-center justify-center gap-2 w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-lg transition-colors text-sm"
              >
                <FaShoppingCart size={14} />
                加入購物車
              </button>
              <button
                onClick={() => {
                  addLessonItem(LessonDetail)
                  router.push('/cart/check')
                }}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors text-sm"
              >
                立即購買
              </button>
            </div>
          </div>
        </div>

        {/* ── 詳細內容（全寬置中）── */}
        <div
          className={`flex flex-col ${styles.detailSection}`}
        >
          <Section title="單元一覽">
            <ul className="list-disc list-inside space-y-1.5 text-gray-700 text-sm">
              {LessonDetail.outline
                ?.split('\n')
                .map((line: string, i: number) => (
                  <li key={i}>{line}</li>
                ))}
            </ul>
          </Section>

          <Section title="適合對象">
            <ul className="list-disc list-inside space-y-1.5 text-gray-700 text-sm">
              {LessonDetail.suitable
                ?.split('\n')
                .map((line: string, i: number) => (
                  <li key={i}>{line}</li>
                ))}
            </ul>
          </Section>

          <Section title="你將學到">
            <ul className="list-disc list-inside space-y-1.5 text-gray-700 text-sm">
              {LessonDetail.achievement
                ?.split('\n')
                .map((line: string, i: number) => (
                  <li key={i}>{line}</li>
                ))}
            </ul>
          </Section>

          <Section title="學員回饋">
            <div className="space-y-5">
              {reviews.map((review, i) => (
                <div
                  key={i}
                  className="border-b border-gray-200 pb-5 last:border-0 last:pb-0"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={`/新增資料夾/user/${review.img}`}
                      className="w-11 h-11 rounded-full object-cover border border-gray-200 flex-shrink-0"
                      alt={review.name}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-semibold text-sm ${styles.reviewerName}`}
                        >
                          {review.name}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {review.created_time ? format(new Date(review.created_time), 'yyyy-MM-dd') : ''}
                        </span>
                      </div>
                      <div className="flex gap-0.5 mt-1">
                        {[...Array(5)].map((_, si) => (
                          <FaStar
                            key={si}
                            size={12}
                            className="text-yellow-400"
                          />
                        ))}
                      </div>
                      <p className="text-gray-700 text-sm mt-2 break-words leading-relaxed">
                        {review.content}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end items-center gap-2 mt-3">
                    <span className="text-gray-400 text-xs">
                      {review.likes} 人覺得有幫助
                    </span>
                    <button className="text-xs border border-blue-500 text-blue-500 px-2 py-0.5 rounded hover:bg-blue-50 transition-colors">
                      有幫助
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 text-blue-600 font-semibold text-sm hover:underline">
              更多回饋 →
            </button>
          </Section>

          {/* 講師資訊 */}
          <div>
            <h2 className={`text-2xl font-bold ${styles.sectionTitle}`}>
              講師資訊
            </h2>
            <div className="flex gap-5 bg-gray-50 rounded-xl p-5 border border-gray-100">
              <div className="w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                <img
                  src="/課程與師資/teacher_img/teacher_001.jpeg"
                  className="w-full h-full object-cover"
                  alt="Teacher"
                />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-base mb-2">
                  徐歡CheerHsu
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  本身為全職的音樂工作者，也是Youtuber「倆倆」的音樂影片製作人，擁有近百支以上音樂的MV製作經驗，在2017曾創下台灣Youtube熱門創作者影片的第四名，本身頻道總點閱率也達到一千五百萬成績。對於這方面的學習從不間斷，且已將音樂融入為生活習慣。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 猜你喜歡 — 桌機 */}
        <div className="hidden md:block mb-10">
          <h2 className={`text-2xl font-bold mb-6 ${styles.deepPrimary}`}>
            猜你喜歡...
          </h2>
          <div className="flex gap-4 flex-wrap">
            {[...youWillLike]
              .sort((a, b) => b.sales - a.sales)
              .slice(0, 5)
              .map((v, i) => (
                <Card
                  key={i}
                  id={v.id}
                  luid={v.puid}
                  name={v.name}
                  average_rating={Math.round(v.average_rating)}
                  review_count={v.review_count}
                  price={v.price}
                  teacher_name={v.teacher_name}
                  img={v.img}
                  length={v.length}
                  sales={v.sales}
                />
              ))}
          </div>
        </div>

        {/* 猜你喜歡 — 手機 */}
        <div className="md:hidden mb-28">
          <h2 className={`text-2xl font-bold mb-5 ${styles.deepPrimary}`}>
            猜你喜歡...
          </h2>
          <div className="space-y-3">
            {[...youWillLike]
              .sort((a, b) => b.sales - a.sales)
              .slice(0, 3)
              .map((v, i) => (
                <HoriCard
                  key={i}
                  id={v.id}
                  luid={v.puid}
                  name={v.name}
                  average_rating={Math.round(v.average_rating)}
                  review_count={v.review_count}
                  price={v.price}
                  teacher_name={v.teacher_name}
                  img={v.img}
                  length={v.length}
                  sales={v.sales}
                />
              ))}
          </div>
        </div>
      </div>

      {/* 手機底部固定購買列 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3 z-50 shadow-lg">
        <button
          onClick={() => {
            notifyBuy(LessonDetail.name)
            addLessonItem(LessonDetail)
          }}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-lg transition-colors text-sm"
        >
          <FaShoppingCart size={14} />
          加入購物車
        </button>
        <button
          onClick={() => {
            addLessonItem(LessonDetail)
            router.push('/cart/check')
          }}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors text-sm"
        >
          立即購買
        </button>
      </div>

      <Footer />
    </>
  )
}
