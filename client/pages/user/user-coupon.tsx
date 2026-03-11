import uStyles from './user-layout.module.scss'
import { useEffect, useMemo, useState } from 'react'
import Navbar from '@/components/common/navbar'
import Footer from '@/components/common/footer'
import Link from 'next/link'
import Image from 'next/image'
import Head from 'next/head'
import NavbarMb from '@/components/common/navbar-mb'
import { useAuth } from '@/hooks/user/use-auth'
import { useAvatarImage } from '@/hooks/useAvatarImage'
import { IoHome } from 'react-icons/io5'
import { FaChevronRight } from 'react-icons/fa6'
import { IoClose } from 'react-icons/io5'
import Coupon from '@/components/coupon/coupon'
import CouponClass from '@/API/Coupon'
import { useMenuToggle } from '@/hooks/useMenuToggle'
import type { CouponItem } from '@/types/api'

// 分類 tab 設定
const TABS = [
  { label: '全部', kind: 0, valid: 999 },
  { label: '樂器券', kind: 1, valid: 1 },
  { label: '課程券', kind: 2, valid: 1 },
  { label: '已使用', kind: 0, valid: 0 },
] as const

const PAGE_SIZE = 9

export default function UserCoupon() {
  const { LoginUserData } = useAuth()
  const avatarImage = useAvatarImage()
  const { showMenu, menuMbToggle, showSidebar, setShowSidebar } =
    useMenuToggle()

  const [data, setData] = useState<CouponItem[]>([])
  const [tabIdx, setTabIdx] = useState(0)
  const [sort, setSort] = useState<0 | 1 | 2>(0)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (!LoginUserData?.id) return
    CouponClass.FindAll(LoginUserData.id).then(setData)
  }, [LoginUserData?.id])

  const { kind, valid } = TABS[tabIdx]

  const filtered = useMemo(() => {
    return data
      .filter((i) => (kind !== 0 ? i.kind === kind : true))
      .filter((i) => (valid !== 999 ? i.valid === valid : true))
      .sort((a, b) => {
        if (sort === 1) return b.discount - a.discount
        if (sort === 2)
          return a.limit_time > b.limit_time
            ? 1
            : a.limit_time < b.limit_time
              ? -1
              : 0
        return 0
      })
  }, [data, kind, valid, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  const handleTabClick = (idx: number) => {
    setTabIdx(idx)
    setCurrentPage(1)
  }

  const handleSort = (s: 1 | 2) => {
    setSort((prev) => (prev === s ? 0 : s))
    setCurrentPage(1)
  }

  const displayName = LoginUserData?.nickname || LoginUserData?.name || ''

  return (
    <>
      <Head>
        <title>我的優惠券</title>
      </Head>
      <Navbar menuMbToggle={menuMbToggle} />

      <div className="container mx-auto px-6 relative">
        {/* 手機 navbar */}
        <div
          className={`menu-mb sm:hidden flex flex-col items-center ${showMenu ? 'menu-mb-show' : ''}`}
        >
          <NavbarMb />
        </div>

        <div className="page-layout">
          {/* ── Sidebar ── */}
          <aside className="sidebar-wrapper hidden sm:block">
            <div className="sidebar">
              <div className="sidebar-avatar-box">
                <Image
                  src={avatarImage}
                  alt="avatar"
                  fill
                  priority
                  sizes="100px"
                />
              </div>
              <div className="sidebar-name">{displayName}</div>
              <nav>
                <ul className="sidebar-nav">
                  <li>
                    <Link href="/user/user-info">會員資訊</Link>
                  </li>
                  <li>
                    <Link
                      href={
                        LoginUserData?.jamstate == '1'
                          ? `/jam/recruit-list/${LoginUserData.my_jam}`
                          : `/user/user-jam`
                      }
                    >
                      我的樂團
                    </Link>
                  </li>
                  <li>
                    <Link href="/user/user-order">我的訂單</Link>
                  </li>
                  <li>
                    <Link href="/user/user-article">我的文章</Link>
                  </li>
                  <li className="active">
                    <Link href="/user/user-coupon">我的優惠券</Link>
                  </li>
                </ul>
              </nav>
            </div>
          </aside>

          {/* ── Main ── */}
          <div className="main-content">
            {/* 手機 sidebar */}
            <div
              className={`sidebar-mb sm:hidden ${showSidebar ? 'sidebar-mb-show' : ''}`}
            >
              <IoClose
                size={28}
                className="sm-close"
                onClick={() => setShowSidebar(false)}
              />
              <Link href="/user/user-info" className="sm-item">
                會員資訊
              </Link>
              <Link
                href={
                  LoginUserData?.jamstate == '1'
                    ? `/jam/recruit-list/${LoginUserData.my_jam}`
                    : `/user/user-jam`
                }
                className="sm-item"
              >
                我的樂團
              </Link>
              <Link href="/user/user-order" className="sm-item">
                我的訂單
              </Link>
              <Link href="/user/user-article" className="sm-item">
                我的文章
              </Link>
              <Link href="/user/user-coupon" className="sm-item active">
                我的優惠券
              </Link>
            </div>

            {/* 麵包屑 */}
            <div className="breadcrumb-wrapper-ns">
              <ul className={`flex items-center p-0 m-0 ${uStyles.bcGap}`}>
                <IoHome size={18} />
                <li>會員中心</li>
                <FaChevronRight size={12} />
                <li>我的優惠券</li>
              </ul>
            </div>

            {/* 頁面標題 */}
            <div className="page-title">
              {displayName} 的優惠券
              <span className="coupon-count">{filtered.length} 張</span>
            </div>

            {/* 手機：分類 select + 排序 select */}
            <div className="mobile-controls sm:hidden">
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                onChange={(e) => handleTabClick(Number(e.target.value))}
                value={tabIdx}
              >
                {TABS.map((t, i) => (
                  <option key={i} value={i}>
                    {t.label}
                  </option>
                ))}
              </select>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                onChange={(e) => setSort(Number(e.target.value) as 0 | 1 | 2)}
                value={sort}
              >
                <option value={0}>預設排序</option>
                <option value={1}>折扣幅度↓</option>
                <option value={2}>即將到期↑</option>
              </select>
            </div>

            {/* 桌機：Tab + 排序 */}
            <div className="toolbar hidden sm:flex">
              <div className="tab-group">
                {TABS.map((t, i) => (
                  <button
                    key={i}
                    className={`tab-btn ${tabIdx === i ? 'active' : ''}`}
                    onClick={() => handleTabClick(i)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="sort-group">
                <span className="sort-label">排序</span>
                <button
                  className={`sort-btn ${sort === 1 ? 'active' : ''}`}
                  onClick={() => handleSort(1)}
                >
                  折扣幅度
                </button>
                <button
                  className={`sort-btn ${sort === 2 ? 'active' : ''}`}
                  onClick={() => handleSort(2)}
                >
                  即將到期
                </button>
              </div>
            </div>

            {/* 優惠券卡片 grid */}
            {paged.length > 0 ? (
              <div className="coupon-grid">
                {paged.map((v) => (
                  <Coupon
                    key={v.id}
                    id={v.id}
                    name={v.name}
                    type={v.type}
                    discount={v.discount}
                    kind={v.kind}
                    created_time={v.created_time}
                    limit_time={v.limit_time}
                    valid={v.valid}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">目前沒有符合條件的優惠券</div>
            )}

            {/* 分頁 */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  {'‹'}
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      className={`page-btn ${currentPage === p ? 'active' : ''}`}
                      onClick={() => setCurrentPage(p)}
                    >
                      {p}
                    </button>
                  ),
                )}
                <button
                  className="page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  {'›'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        .page-layout {
          display: flex;
          gap: 24px;
          padding: 24px 0 40px;
        }

        /* ── Sidebar ── */
        .sidebar-wrapper {
          flex: 0 0 180px;
        }
        .sidebar {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
          padding: 20px 16px;
          background: #f8f9fa;
          border-radius: 10px;
        }
        .sidebar-avatar-box {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          position: relative;
          overflow: hidden;
          border: 3px solid #e0e0e0;
        }
        .sidebar-name {
          font-family: 'Noto Sans TC';
          font-size: 16px;
          font-weight: 700;
          color: #1d1d1d;
        }
        :global(.sidebar-nav) {
          list-style: none;
          padding: 0;
          margin: 0;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        :global(.sidebar-nav li a) {
          display: block;
          padding: 8px 12px;
          border-radius: 6px;
          color: #555;
          font-size: 14px;
          transition:
            background 0.15s,
            color 0.15s;
          text-decoration: none;
        }
        :global(.sidebar-nav li a:hover),
        :global(.sidebar-nav li.active a) {
          background: #e8f4fd;
          color: #1581cc;
          font-weight: 600;
        }

        /* ── Main ── */
        .main-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* 麵包屑 */
        :global(.breadcrumb-wrapper-ns ul li) {
          list-style: none;
          color: #666;
          font-size: 14px;
        }

        /* 標題 */
        .page-title {
          display: flex;
          align-items: baseline;
          gap: 10px;
          font-family: 'Noto Sans TC';
          font-size: 24px;
          font-weight: 700;
          color: #124365;
        }
        .coupon-count {
          font-size: 14px;
          font-weight: 400;
          color: #888;
        }

        /* 手機控制列 */
        .mobile-controls {
          display: flex;
          gap: 10px;
        }
        .mobile-controls :global(.form-select) {
          flex: 1;
        }

        /* 桌機 toolbar */
        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .tab-group {
          display: flex;
          gap: 6px;
        }
        .tab-btn {
          padding: 6px 18px;
          border-radius: 20px;
          border: 1px solid #d0d0d0;
          background: #fff;
          color: #555;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .tab-btn:hover {
          border-color: #1581cc;
          color: #1581cc;
        }
        .tab-btn.active {
          background: #1581cc;
          border-color: #1581cc;
          color: #fff;
          font-weight: 600;
        }
        .sort-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sort-label {
          font-size: 13px;
          color: #888;
        }
        .sort-btn {
          padding: 5px 14px;
          border-radius: 20px;
          border: 1px solid #d0d0d0;
          background: #fff;
          color: #555;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .sort-btn:hover {
          border-color: #1581cc;
          color: #1581cc;
        }
        .sort-btn.active {
          background: #e8f4fd;
          border-color: #1581cc;
          color: #1581cc;
          font-weight: 600;
        }

        /* 卡片 Grid */
        .coupon-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        /* 空狀態 */
        .empty-state {
          padding: 60px 0;
          text-align: center;
          color: #aaa;
          font-size: 16px;
        }

        /* 分頁 */
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          padding-top: 8px;
        }
        .page-btn {
          min-width: 36px;
          height: 36px;
          padding: 0 10px;
          border-radius: 6px;
          border: 1px solid #d0d0d0;
          background: #fff;
          color: #555;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .page-btn:hover:not(:disabled) {
          border-color: #1581cc;
          color: #1581cc;
        }
        .page-btn.active {
          background: #1581cc;
          border-color: #1581cc;
          color: #fff;
          font-weight: 700;
        }
        .page-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        /* RWD */
        @media screen and (max-width: 576px) {
          .page-layout {
            padding: 16px 0 32px;
          }
          .coupon-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  )
}
