import tStyles from './template.module.scss'
import { useEffect, useState } from 'react'
import Navbar from '@/components/common/navbar'
import Footer from '@/components/common/footer'
import Link from 'next/link'
import Image from 'next/image'
// icons
import { IoHome } from 'react-icons/io5'
import { FaChevronRight } from 'react-icons/fa6'
import { ImExit } from 'react-icons/im'

export default function Test() {
  // ----------------------手機版本  ----------------------
  // 主選單
  const [showMenu, setShowMenu] = useState(false)
  const menuMbToggle = () => {
    setShowMenu(!showMenu)
  }

  // ----------------------假資料  ----------------------

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
  const _onshow = (e) => {
    stopPropagation(e)
    setFilterVisible(!filterVisible)
  }

  return (
    <>
      <Navbar menuMbToggle={menuMbToggle} />
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
            className={`mm-item ${tStyles.menuSep}`}
            href="/user"
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
          <div className={`mm-item ${tStyles.primary}`}>
            登出
            <ImExit size={20} className="ml-2" />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3">
          <div className="w-full px-6 sm:w-2/3 px-6">
            {/* 麵包屑 */}
            <div
              className={`breadcrumb-wrapper ${tStyles.bcWrap}`}
            >
              <ul className="flex items-center p-0 m-0">
                <IoHome size={20} />
                <li className={tStyles.bcItem1}>Let&apos;s JAM!</li>
                <FaChevronRight />
                <Link href="/jam/recruit-list">
                  <li className={tStyles.bcItem2}>團員募集</li>
                </Link>

                <FaChevronRight />
                <li className={tStyles.bcItem2}>JAM 資訊</li>
              </ul>
            </div>
            {/* 主內容 */}
            <main className="content"></main>
          </div>

          {/*   ----------------------頁面內容  ---------------------- */}
          <div className="hidden sm:block sm:w-1/3 px-6 page-control"></div>
        </div>
      </div>
      <Footer />

      <style jsx>{``}</style>
    </>
  )
}
