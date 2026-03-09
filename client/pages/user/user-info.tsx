import Navbar from '@/components/common/navbar'
import Footer from '@/components/common/footer'
import Link from 'next/link'
import Image from 'next/image'
import Head from 'next/head'
import NavbarMb from '@/components/common/navbar-mb'

import { useAuth } from '@/hooks/user/use-auth'
import { useAvatarImage } from '@/hooks/useAvatarImage'

import playerData from '@/data/player.json'
import genreData from '@/data/genre.json'

import { IoHome } from 'react-icons/io5'
import { FaChevronRight, FaPen } from 'react-icons/fa6'
import { IoClose } from 'react-icons/io5'
import { FiUser } from 'react-icons/fi'
import { useFilterToggle } from '@/hooks/useFilterToggle'
import { useMenuToggle } from '@/hooks/useMenuToggle'

// ── helpers ──────────────────────────────────────────────────────────────────

function resolveLabels(
  ids: string | undefined | null,
  data: { id: number; name: string }[]
): string {
  if (!ids) return '尚未填寫'
  const map = Object.fromEntries(data.map((d) => [String(d.id), d.name]))
  const labels = ids
    .split(',')
    .map((id) => map[id.trim()] ?? id.trim())
    .filter(Boolean)
  return labels.length ? labels.join('、') : '尚未填寫'
}

function formatBirthday(raw: string | undefined | null): string {
  if (!raw) return '尚未填寫'
  const d = new Date(raw)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// ── component ─────────────────────────────────────────────────────────────────

export default function UserInfo() {
  const { LoginUserData } = useAuth()
  const avatarImage = useAvatarImage()

  const { showMenu, menuMbToggle, showSidebar, sidebarToggle, setShowSidebar } =
    useMenuToggle()
  useFilterToggle()

  // derived values
  const gender =
    LoginUserData.gender == 1
      ? '男'
      : LoginUserData.gender == 2
        ? '女'
        : LoginUserData.gender == 3
          ? '其他'
          : '尚未填寫'

  const birthday = formatBirthday(LoginUserData.birthday)
  const finalGenreLike = resolveLabels(LoginUserData.genre_like, genreData)
  const finalPlayInstrument = resolveLabels(
    LoginUserData.play_instrument,
    playerData
  )

  const privacyArr = LoginUserData.privacy?.split(',') ?? []
  const privacyBD = privacyArr[0] === '1'
  const privacyPhone = privacyArr[1] === '1'
  const privacyEmail = privacyArr[2] === '1'

  const fullAddress = [
    LoginUserData.postcode,
    LoginUserData.country,
    LoginUserData.township,
    LoginUserData.address,
  ]
    .filter(Boolean)
    .join('')

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <>
      <Head>
        <title>會員資訊</title>
      </Head>
      <Navbar menuMbToggle={menuMbToggle} />

      <div className="container mx-auto px-6 relative">
        {/* mobile navbar */}
        <div
          className={`menu-mb sm:hidden flex flex-col items-center ${showMenu ? 'menu-mb-show' : ''}`}
        >
          <NavbarMb />
        </div>

        <div className="flex flex-wrap -mx-3">
          {/* ── sidebar ── */}
          <div className="sidebar-wrapper hidden sm:block sm:w-1/6 px-6">
            <div className="sidebar">
              <div className="sidebar-user-info">
                <div className="sidebar-user-info-imgBox">
                  <Image
                    src={avatarImage}
                    alt="user avatar"
                    fill
                    priority
                    sizes="(max-width: 150px)"
                    unoptimized
                  />
                </div>
                <div className="sidebar-user-info-text">
                  <div className="sidebar-user-info-name">
                    {LoginUserData.nickname}
                  </div>
                  <div className="sidebar-user-info-band">
                    {LoginUserData.my_jamname}
                  </div>
                </div>
              </div>
              <ul className="flex flex-col">
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

          {/* ── main ── */}
          <div className="w-full px-6 sm:w-5/6 page-control">
            {/* mobile sidebar */}
            <div
              className={`sidebar-mb sm:hidden ${showSidebar ? 'sidebar-mb-show' : ''}`}
              style={{ top: '190px' }}
            >
              <div className="sm-close">
                <IoClose size={32} onClick={() => setShowSidebar(false)} />
              </div>
              <Link href="/user/user-info" className="sm-item active">
                會員資訊
              </Link>
              <Link
                href={
                  LoginUserData.jamstate == '1'
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
              <Link href="/user/user-coupon" className="sm-item">
                我的優惠券
              </Link>
            </div>

            {/* breadcrumb + sidebar toggle */}
            <div className="top-function-container">
              <div className="breadcrumb-wrapper-ns">
                <ul className="flex items-center p-0 m-0">
                  <IoHome size={20} />
                  <li style={{ marginLeft: '8px' }}>會員中心</li>
                  <FaChevronRight />
                  <li style={{ marginLeft: '10px' }}>會員資訊</li>
                </ul>
              </div>
              <div className="top-function-flex">
                <div className="search-sidebarBtn">
                  <div
                    className="flex sm:hidden items-center b-btn b-btn-body"
                    role="presentation"
                    style={{ paddingInline: '16px' }}
                    onClick={sidebarToggle}
                  >
                    選單
                  </div>
                </div>
              </div>
            </div>

            {/* ── page content ── */}
            <main className="ui-page">
              {/* profile header card */}
              <div className="profile-header">
                <div className="avatar-wrap">
                  <Image
                    src={avatarImage}
                    alt="avatar"
                    fill
                    sizes="120px"
                    unoptimized
                    className="avatar-img"
                  />
                </div>
                <div className="profile-meta">
                  <div className="profile-name">{LoginUserData.nickname}</div>
                  <div className="profile-sub">
                    {LoginUserData.name && (
                      <span className="profile-realname">
                        {LoginUserData.name}
                      </span>
                    )}
                    {LoginUserData.my_jamname && (
                      <span className="profile-band">
                        {LoginUserData.my_jamname}
                      </span>
                    )}
                  </div>
                </div>
                <div className="profile-actions">
                  <Link
                    href={`/user/user-homepage/${LoginUserData.uid}`}
                    className="btn-outline"
                  >
                    <FiUser size={14} />
                    個人首頁
                  </Link>
                  <Link href="/user/user-info-edit" className="btn-primary">
                    <FaPen size={13} />
                    編輯資訊
                  </Link>
                </div>
              </div>

              {/* info sections */}
              <div className="sections">
                {/* 基本資料 */}
                <section className="info-card">
                  <h3 className="section-title">基本資料</h3>
                  <div className="field-grid">
                    <InfoRow label="真實姓名" value={LoginUserData.name} />
                    <InfoRow label="暱稱" value={LoginUserData.nickname} />
                    <InfoRow label="性別" value={gender} />
                    <InfoRow label="生日" value={birthday} />
                  </div>
                </section>

                {/* 音樂偏好 */}
                <section className="info-card">
                  <h3 className="section-title">音樂偏好</h3>
                  <div className="field-grid">
                    <InfoRow label="喜歡曲風" value={finalGenreLike} />
                    <InfoRow label="演奏樂器" value={finalPlayInstrument} />
                  </div>
                </section>

                {/* 聯絡資訊 */}
                <section className="info-card">
                  <h3 className="section-title">聯絡資訊</h3>
                  <div className="field-grid">
                    <InfoRow
                      label="電子信箱"
                      value={LoginUserData.email}
                      badge={privacyEmail ? '公開' : '不公開'}
                      badgePublic={privacyEmail}
                    />
                    <InfoRow
                      label="手機"
                      value={LoginUserData.phone || '尚未填寫'}
                      badge={privacyPhone ? '公開' : '不公開'}
                      badgePublic={privacyPhone}
                    />
                    <InfoRow
                      label="生日"
                      value={birthday}
                      badge={privacyBD ? '公開' : '不公開'}
                      badgePublic={privacyBD}
                    />
                    <InfoRow
                      label="地址"
                      value={fullAddress || '尚未填寫'}
                    />
                  </div>
                </section>

                {/* 自我介紹 */}
                <section className="info-card">
                  <h3 className="section-title">自我介紹</h3>
                  <p className="bio-text">
                    {LoginUserData.info || '尚未填寫'}
                  </p>
                </section>
              </div>
            </main>
          </div>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        /* sidebar (unchanged global structure) */
        .sidebar-user-info {
          display: flex;
          padding: 0 12px;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
          align-self: stretch;
        }
        .sidebar-user-info-imgBox {
          width: 100px;
          height: 100px;
          border-radius: 100px;
          position: relative;
          overflow: hidden;
        }
        .sidebar-user-info-text {
          display: flex;
          width: 140px;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
          color: #1d1d1d;
          font-family: 'Noto Sans TC';
          font-size: 20px;
        }
        .sidebar-user-info-band {
          margin-bottom: 20px;
        }

        /* ── page layout ── */
        .ui-page {
          padding: 8px 0 40px;
          max-width: 860px;
        }

        /* ── profile header ── */
        .profile-header {
          display: flex;
          align-items: center;
          gap: 24px;
          background: #fff;
          border: 1px solid #e8edf2;
          border-radius: 12px;
          padding: 24px 28px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .avatar-wrap {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
          border: 3px solid #e2ecf5;
        }

        .profile-meta {
          flex: 1;
          min-width: 0;
        }
        .profile-name {
          font-size: 22px;
          font-weight: 700;
          color: #0d3652;
          font-family: 'Noto Sans TC';
          margin-bottom: 6px;
        }
        .profile-sub {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .profile-realname {
          font-size: 14px;
          color: #666;
          font-family: 'Noto Sans TC';
        }
        .profile-band {
          font-size: 14px;
          color: #18a1ff;
          font-family: 'Noto Sans TC';
          background: #e8f4ff;
          padding: 2px 10px;
          border-radius: 20px;
        }

        .profile-actions {
          display: flex;
          gap: 10px;
          flex-shrink: 0;
        }
        .btn-outline {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 1.5px solid #b9b9b9;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #555;
          font-family: 'Noto Sans TC';
          text-decoration: none;
          transition: border-color 0.15s, color 0.15s;
        }
        .btn-outline:hover {
          border-color: #0d3652;
          color: #0d3652;
        }
        .btn-primary {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: #18a1ff;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          font-family: 'Noto Sans TC';
          text-decoration: none;
          transition: background 0.15s;
        }
        .btn-primary:hover {
          background: #0d8de6;
        }

        /* ── sections ── */
        .sections {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .info-card {
          background: #fff;
          border: 1px solid #e8edf2;
          border-radius: 12px;
          padding: 20px 28px 24px;
        }
        .section-title {
          font-size: 15px;
          font-weight: 700;
          color: #0d3652;
          font-family: 'Noto Sans TC';
          margin: 0 0 16px;
          padding-bottom: 10px;
          border-bottom: 1.5px solid #e8edf2;
        }
        .field-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
        }

        .bio-text {
          font-size: 15px;
          color: #333;
          font-family: 'Noto Sans TC';
          line-height: 1.8;
          margin: 0;
          white-space: pre-wrap;
        }

        /* RWD */
        @media (max-width: 576px) {
          .profile-header {
            padding: 18px;
            gap: 16px;
          }
          .profile-name {
            font-size: 18px;
          }
          .profile-actions {
            width: 100%;
          }
          .btn-outline,
          .btn-primary {
            flex: 1;
            justify-content: center;
          }
          .field-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  )
}

// ── InfoRow sub-component ─────────────────────────────────────────────────────

function InfoRow({
  label,
  value,
  badge,
  badgePublic,
}: {
  label: string
  value?: string | number | null
  badge?: string
  badgePublic?: boolean
}) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-value">
        {value ?? '尚未填寫'}
        {badge && (
          <span className={`privacy-badge ${badgePublic ? 'public' : 'private'}`}>
            {badge}
          </span>
        )}
      </span>

      <style jsx>{`
        .info-row {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 12px 0;
          border-bottom: 1px solid #f0f3f6;
        }
        .info-row:nth-last-child(-n + 2) {
          border-bottom: none;
        }
        .info-label {
          font-size: 12px;
          font-weight: 600;
          color: #124365;
          font-family: 'Noto Sans TC';
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .info-value {
          font-size: 15px;
          color: #222;
          font-family: 'Noto Sans TC';
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .privacy-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 20px;
          font-family: 'Noto Sans TC';
        }
        .privacy-badge.public {
          background: #e6f6ee;
          color: #1a7f45;
        }
        .privacy-badge.private {
          background: #f5f5f5;
          color: #888;
        }
      `}</style>
    </div>
  )
}
