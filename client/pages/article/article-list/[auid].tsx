import { apiBaseUrl } from '@/configs'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useDetailFetch } from '@/hooks/useDetailFetch'
import Head from 'next/head'
import Navbar from '@/components/common/navbar'
import NavbarMb from '@/components/common/navbar-mb'
import Footer from '@/components/common/footer'
import Link from 'next/link'
import Image from 'next/image'
// icons
import { IoHome } from 'react-icons/io5'
import { FaChevronRight } from 'react-icons/fa6'
import { RiUserSettingsFill } from 'react-icons/ri'
import Datetime from '@/components/article/datetime'
// 會員認證hook
import { useAuth } from '@/hooks/user/use-auth'
import { useFilterToggle } from '@/hooks/useFilterToggle'
import { useMenuToggle } from '@/hooks/useMenuToggle'
export default function Auid() {
  // ----------------------手機版本  ----------------------
  // 主選單
  const { showMenu, menuMbToggle } = useMenuToggle()

  // ----------------------會員登入狀態 & 會員資料獲取  ----------------------
  //從hook 獲得使用者登入的資訊  儲存在變數LoginUserData裡面
  const { LoginUserData } = useAuth()
  //登出功能

  // 舊版會警告 因為先渲染但沒路徑 bad
  // const avatarImage = `/user/${LoginUserData.img}`
  // const avatargoogle = `${LoginUserData.photo_url}`
  // const avatarDefault = `/user/avatar_userDefault.jpg`

  // ----------------------會員登入狀態  ----------------------

  // ----------------------要資料  ----------------------

  // ----------------------跟後端要資料  ----------------------
  //-----------------------動態路由
  //  由router中獲得動態路由(屬性名稱pid，即檔案[pid].js)的值，router.query中會包含pid屬性
  // 1. 執行(呼叫)useRouter，會回傳一個路由器
  // 2. router.isReady(布林值)，true代表本元件已完成水合作用(hydration)，可以取得router.query的值
  const router = useRouter()
  const { auid } = router.query
  // 動態路由參數

  // ----------------------全部資料----------------------
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [articleDetail, setArticleDetail] = useState({} as any)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawData } = useDetailFetch<any>(
    router.isReady && router.query.auid
      ? `${apiBaseUrl}/article/${router.query.auid as string}`
      : null,
  )
  useEffect(() => {
    if (!rawData) return
    setArticleDetail(rawData[0])
  }, [rawData])

  // 字串轉HTML格式
  const [myContent, _setMyContent] = useState('')
  const getContent = (content) => {
    document.querySelector('.newContent').innerHTML = content
  }
  useEffect(() => {
    getContent(articleDetail.content)
  }, [articleDetail.content])

  // ----------------------假資料  ----------------------

  useFilterToggle()

  return (
    <>
      <Head>
        <title>{articleDetail.title}</title>
      </Head>
      <Navbar menuMbToggle={menuMbToggle} />
      <div className="container mx-auto px-6 relative">
        {/* 手機版主選單/navbar */}
        <div
          className={`menu-mb sm:hidden flex flex-col items-center ${showMenu ? 'menu-mb-show' : ''}`}
        >
          <NavbarMb />
        </div>
        <div className="flex flex-wrap -mx-3">
          {/* 麵包屑 */}
          <div className="breadcrumb-wrapper-ns">
            <ul className="flex items-center p-0 m-0 flex-wrap">
              <IoHome size={20} />
              <Link href="/article/article-list">
                <li style={{ marginLeft: '8px' }}>樂友論壇</li>
              </Link>
              <FaChevronRight />
              <Link
                href={
                  articleDetail.category_name == '技術'
                    ? '/article/article-list/sharing'
                    : '/article/article-list/comments'
                }
              >
                <li style={{ marginLeft: '10px' }}>
                  {articleDetail.category_name == '技術'
                    ? '技術分享'
                    : '音樂評論'}
                </li>
              </Link>
              <FaChevronRight />
              <li style={{ marginLeft: '10px' }}>{articleDetail.title}</li>
            </ul>
          </div>
          <div className="">
            {/* 主內容 */}
            <main className="content pt-0">
              <div className="flex justify-end">
                {LoginUserData.id === articleDetail.user_id ? (
                  <Link
                    href={`/article/article-edit/${auid}`}
                    className="icon-btn"
                  >
                    <RiUserSettingsFill
                      size={30}
                      style={{ color: 'gray', cursor: 'pointer' }}
                    />
                    編輯
                  </Link>
                ) : (
                  ''
                )}
              </div>
              <h1 className="text-center">{articleDetail.title}</h1>
              <div className="newContent mb-6">{myContent}</div>
              <div className="main-img">
                {articleDetail.img && (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3005'}/article/${articleDetail.img}`}
                    alt=""
                    className="big-pic object-contain w-full"
                    fill
                  />
                )}
              </div>
              <div className="article-label flex pt-6 pl-6">
                <div className="bg-dark text-gray-100 pt-1 pb-1 pl-2 pr-2 mr-6">
                  標籤
                </div>
                <div className="pt-1 pb-1 pl-2 pr-2">
                  {articleDetail.category_name}
                </div>
              </div>
              {/* Reader Comment */}
              <h3 className="pt-12 text-primary">讀者留言</h3>
              <div className="reader-comment pt-6 flex items-center">
                {articleDetail.user_img && (
                  <Image
                    className="article-author"
                    src={`/user/${articleDetail.user_img}`}
                    alt="空的圖"
                    width={50}
                    height={50}
                  />
                )}
                <span className="pl-6 info-p text-primary">
                  {articleDetail.user_name}
                </span>
                <span className="pl-2 info-p text-secondary">
                  <Datetime
                    published_time={articleDetail.comment_created_time}
                  />
                </span>
              </div>
              <p className="pt-1">{articleDetail.comment_content}</p>
              <div className="reader-like flex justify-between">
                <div />
                <div className="flex items-center">
                  <div>{articleDetail.comment_likes}人認同</div>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center px-4 py-2 rounded font-medium cursor-pointer transition-colors border border-primary text-primary hover:bg-primary hover:text-white ml-1"
                  >
                    <i className="fa-solid fa-thumbs-up" />
                    認同
                  </button>
                </div>
              </div>
              {/* 最後textarea */}
              <div className="pl-6 pr-6">
                <textarea
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  rows={5}
                  placeholder="發表文章評語...(限50字)"
                  defaultValue={''}
                />
                <div className="text-right mt-2 mb-6">
                  <button
                    className="inline-flex items-center justify-center px-4 py-2 rounded font-medium cursor-pointer transition-colors bg-primary text-white hover:bg-deep-primary"
                    type="submit"
                  >
                    發表
                  </button>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
      <Footer />

      <style jsx>{`
        .wrapper {
          padding-left: 20px;
          padding-right: 20px;
        }
        .nav-category {
          display: flex;
          justify-content: between;
        }
        @media screen and (max-width: 576px) {
          .nav-category {
            display: none;
          }
        }
        main {
          padding-left: 55px;
          padding-right: 55px;
          @media screen and (max-width: 576px) {
            padding-inline: 10px;
          }
        }
        h1 {
          padding-top: 5;
        }
        @media screen and (max-width: 576px) {
          h1 {
            padding-top: 0;
          }
        }
        .breadcrumb-wrapper {
          margin-top: 50px;
          margin-left: 50px;
        }
        @media screen and (max-width: 576px) {
          .breadcrumb-wrapper {
            margin-top: 30px;
            margin-left: 10px;
          }
        }
        .main-img {
          position: relative;
          weight: 1000px;
          height: 500px;
        }
        .big-pic {
          position: absolute;
          top: 0;
          left: 0;
        }
        @media screen and (max-width: 576px) {
          .main-img {
            weight: 576px;
            height: 300px;
          }
        }
      `}</style>
    </>
  )
}
