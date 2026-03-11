import { Disclosure } from '@headlessui/react'
import Navbar from '@/components/common/navbar'
import NavbarMb from '@/components/common/navbar-mb'
import Footer from '@/components/common/footer'
import Link from 'next/link'
import Image from 'next/image'
import Head from 'next/head'
import jamHero from '@/assets/jam-hero.png'
// icons
import { IoHome } from 'react-icons/io5'
import { FaChevronRight, FaChevronDown } from 'react-icons/fa6'
import { IoClose } from 'react-icons/io5'
import { FaQuoteLeft, FaQuoteRight } from 'react-icons/fa6'
// 自製元件
import { useAuth } from '@/hooks/user/use-auth'
import { useMenuToggle } from '@/hooks/useMenuToggle'
import jStyles from './jam-shared.module.scss'

export default function RecruitList() {
  // ----------------------會員登入狀態 & 會員資料獲取  ----------------------
  //從hook 獲得使用者登入的資訊  儲存在變數LoginUserData裡面
  useAuth()

  // ----------------------手機版本  ----------------------
  // 主選單
  const { showMenu, menuMbToggle, showSidebar, setShowSidebar, sidebarToggle } =
    useMenuToggle()

  return (
    <>
      <Head>
        <title>什麼是JAM？</title>
      </Head>
      <Navbar menuMbToggle={menuMbToggle} />
      <div className="page-hero hidden sm:block">
        <Image
          src={jamHero}
          className="object-cover w-full"
          alt="cover"
          priority
        />
      </div>
      <div className="container mx-auto px-6 relative">
        {/* 手機版主選單/navbar */}
        <div
          className={`menu-mb sm:hidden flex flex-col items-center ${
            showMenu ? 'menu-mb-show' : ''
          }`}
        >
          <NavbarMb />
        </div>
        <div className="flex flex-wrap -mx-3">
          {/* sidebar */}
          <div className="sidebar-wrapper hidden sm:block sm:w-1/6 px-6">
            <div className="sidebar">
              <ul className="flex flex-col">
                <li>
                  <Link href={`/jam/recruit-list`}>團員募集</Link>
                </li>
                <li>
                  <Link href={`/jam/jam-list`}>活動中的JAM</Link>
                </li>
                <li>
                  <Link href={`/jam/Q&A`} className="active">
                    什麼是JAM？
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/*   ----------------------頁面內容  ---------------------- */}
          <div className="w-full px-6 sm:w-5/6 px-6 page-control">
            {/* 手機版sidebar */}
            <div
              className={`sidebar-mb sm:hidden ${
                showSidebar ? 'sidebar-mb-show' : ''
              }`}
            >
              <div className="sm-close">
                <IoClose
                  size={32}
                  onClick={() => {
                    setShowSidebar(false)
                  }}
                />
              </div>
              <Link href={`/jam/recruit-list`} className="sm-item">
                團員募集
              </Link>
              <Link href={`/jam/jam-list`} className="sm-item">
                活動中的JAM
              </Link>
              <Link href={`/jam/Q&A`} className="sm-item active">
                什麼是JAM？
              </Link>
            </div>
            {/*  ---------------------- 頂部功能列  ---------------------- */}
            <div
              className={`top-function-container ${jStyles.padBottom5}`}
            >
              {/*  ---------------------- 麵包屑  ---------------------- */}
              <div className="breadcrumb-wrapper">
                <ul className="flex items-center p-0 m-0">
                  <IoHome size={20} />
                  <li className={jStyles.bcItem1}>Let&apos;s JAM!</li>
                  <FaChevronRight />
                  <li className={jStyles.bcItem2}>什麼是JAM？</li>
                </ul>
              </div>

              <div
                className={`top-function-flex ${jStyles.padV2_5}`}
              >
                {/*  ---------------------- 搜尋欄  ---------------------- */}
                <div className="search-sidebarBtn">
                  <div
                    className={`flex sm:hidden b-btn b-btn-body ${jStyles.sidebarTrigger}`}
                    role="presentation"
                    onClick={sidebarToggle}
                  >
                    選單
                  </div>
                </div>
              </div>
            </div>
            {/* 主內容 */}
            <main className="content pt-2 sm:pt-0">
              <div className={`pb-6 ${jStyles.text18}`}>
                <FaQuoteLeft color="#666666" />
                <p className="m-0">
                  <span className="spec ml-6">Jam </span>
                  在音樂領域中指
                  <span className="spec">即興合奏</span>
                  ，取其「隨機、緣分」的意義，希望你在這裡邂逅能一同成長的知音，在漫長樂路上共譜人生樂章。
                </p>
                <div className="flex justify-end">
                  <FaQuoteRight color="#666666" />
                </div>
              </div>

              <div className="w-full space-y-4">
                {/* 關於發起 */}
                <Disclosure>
                  {({ open }) => (
                    <div className="border border-gray-200 rounded">
                      <Disclosure.Button className="w-full flex items-center justify-between py-2 px-4 text-left hover:bg-gray-50 transition-colors">
                        <span>關於發起</span>
                        <FaChevronDown
                          className={`transition-transform ${open ? 'rotate-180' : ''}`}
                          size={14}
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel>
                        <div
                          className="p-2 mt-0 rounded-b"
                          style={{
                            backgroundColor: 'rgba(185, 185, 185, 0.3)',
                          }}
                        >
                          <ol className="rule-list m-0">
                            <li>未有所屬 JAM 的會員，可進行發起。</li>
                            <li>
                              發起的 JAM{' '}
                              <span className="spec">以一個為限</span>
                              ，發起後即視為有所屬，
                              <span className="spec">不得</span>
                              申請他人的 JAM。
                            </li>
                            <li>
                              發起後若
                              <span className="spec"> 30 天內</span>
                              無法成團，視為發起失敗，將解散 JAM。
                            </li>
                            <li>
                              若人數總和已達{' '}
                              <span className="spec">2 人以上</span>
                              發起人得視招募情況解散或以當下成員成團。
                            </li>
                            <li>其他規則請見發起頁。</li>
                          </ol>
                        </div>
                      </Disclosure.Panel>
                    </div>
                  )}
                </Disclosure>

                {/* 關於申請 */}
                <Disclosure>
                  {({ open }) => (
                    <div className="border border-gray-200 rounded">
                      <Disclosure.Button className="w-full flex items-center justify-between py-2 px-4 text-left hover:bg-gray-50 transition-colors">
                        <span>關於申請</span>
                        <FaChevronDown
                          className={`transition-transform ${open ? 'rotate-180' : ''}`}
                          size={14}
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel>
                        <div
                          className="p-2 rounded-b"
                          style={{
                            backgroundColor: 'rgba(185, 185, 185, 0.3)',
                          }}
                        >
                          <p
                            className={`mb-1 pl-1 font-bold ${jStyles.dark}`}
                          >
                            申請人
                          </p>
                          <ol className="rule-list">
                            <li>未有所屬 JAM 的會員，可申請 JAM。</li>
                            <li>
                              申請不限數量，但最後只能
                              <span className="spec">擇一加入</span>。
                            </li>
                            <li>
                              可在會員中心-
                              <span className="spec">我的樂團</span>
                              查看自己的申請一覽。
                            </li>
                            <li>
                              等待審核的期間，可決定是否
                              <span className="spec">取消</span>申請
                            </li>
                            <li>不得再次申請已取消或被拒絕的 JAM。</li>
                            <li>
                              申請通過後，到會員中心-
                              <span className="spec">我的樂團</span>按下
                              <span className="spec">加入</span>即正式成為團員。
                            </li>
                            <li>
                              加入後隨時可以退出，但
                              <span className="spec">不得再次加入</span>。
                            </li>
                          </ol>
                          <p
                            className={`mb-1 pl-1 font-bold mt-2 ${jStyles.dark}`}
                          >
                            發起人
                          </p>
                          <ol className="rule-list">
                            <li>
                              在<span className="spec"> JAM 資訊頁</span>
                              查看並審核申請。
                            </li>
                            <li>
                              發起人根據申請訊息或參考會員資訊頁的內容，決定
                              <span className="spec">通過或拒絕</span>。
                            </li>
                          </ol>
                        </div>
                      </Disclosure.Panel>
                    </div>
                  )}
                </Disclosure>

                {/* 發起成功後 */}
                <Disclosure>
                  {({ open }) => (
                    <div className="border border-gray-200 rounded">
                      <Disclosure.Button className="w-full flex items-center justify-between py-2 px-4 text-left hover:bg-gray-50 transition-colors">
                        <span>發起成功後</span>
                        <FaChevronDown
                          className={`transition-transform ${open ? 'rotate-180' : ''}`}
                          size={14}
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel>
                        <div
                          className="p-2 rounded-b"
                          style={{
                            backgroundColor: 'rgba(185, 185, 185, 0.3)',
                          }}
                        >
                          <ol className="rule-list">
                            <li>
                              樂團資訊將移轉至
                              <span className="spec">活動中的 JAM </span>列表。
                            </li>
                            <li>
                              發起人擁有資訊編輯權限，可以修改團名、介紹、封面與張貼樂團影片連結。
                            </li>
                            <li>
                              將來預計在資訊頁增加
                              <span className="spec">活動公告</span>
                              區塊，供樂團張貼演出資訊。
                            </li>
                          </ol>
                        </div>
                      </Disclosure.Panel>
                    </div>
                  )}
                </Disclosure>
              </div>
            </main>
          </div>
        </div>
      </div>
      <Footer />
      <style jsx>{`
        .spec {
          font-weight: bold;
          color: #1581cc;
        }
        .rule-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          color: #1d1d1d;
        }
      `}</style>
    </>
  )
}
