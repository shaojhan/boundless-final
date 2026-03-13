import { useState } from 'react'
import styles from './navbar.module.scss'
import { useRouter } from 'next/router'
import { IoCart, IoMenu, IoMoon, IoSunny } from 'react-icons/io5'
import { useDarkMode } from '@/hooks/useDarkMode'
import Image from 'next/image'
import logo from '@/assets/logo.svg'
import logoMb from '@/assets/logo_mb.svg'
import Link from 'next/link'
import { ImExit } from 'react-icons/im'
import { RiUser3Line, RiSettings4Line } from 'react-icons/ri'
// sweetalert
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { Toaster } from 'react-hot-toast'

// 會員認證hook
import { useAuth } from '@/hooks/user/use-auth'
import { useAvatarImage } from '@/hooks/useAvatarImage'

// 購物車小badge 測試
import { useCart } from '@/hooks/use-cart'

export default function Navbar({
  menuMbToggle,
}: {
  menuMbToggle?: (..._args: unknown[]) => void
}) {
  const { calcTotalItems, cartNull, items } = useCart()
  const { isDark, toggle: toggleDark } = useDarkMode()
  // ----------------------會員登入狀態 & 會員資料獲取  ----------------------
  //從hook 獲得使用者登入的資訊  儲存在變數LoginUserData裡面
  const { LoginUserData, handleLogout } = useAuth()

  const avatarImage = useAvatarImage()

  //--------------------------登入狀態下 點擊右上角叫出小視窗-------------------
  // 定義狀態來追蹤 className
  const [avatarActive, setavatarActive] = useState(false)

  // 點擊事件處理函式
  const handleClick = () => {
    // 更改狀態，切換 className
    setavatarActive(!avatarActive)
  }
  // 根據狀態設置不同的 className 針對右上角小視窗
  const avatarActivestatus = avatarActive ? '' : 'menu-active'
  //----------------------------sweetalert--------------------------------------
  //登出
  const router = useRouter()
  const mySwal = withReactContent(Swal)
  const logoutAlert = () => {
    mySwal
      .fire({
        position: 'center',
        icon: 'success',
        iconColor: '#1581cc',
        title: '登出成功，將為您跳轉到首頁',
        showConfirmButton: false,
        timer: 2000,
      })
      .then(() =>
        setTimeout(() => {
          router.push(`/`)
        }, 2000),
      )
  }
  const cartState = items.length > 0

  return (
    <>
      <Toaster
        containerStyle={{
          top: 80,
          zIndex: 101,
        }}
      />
      <header className="w-full flex justify-between items-center">
        <Link href="/" className="hidden lg:block ">
          <Image src={logo} alt="logo" className="logo" />
        </Link>
        <Link href="/" className="lg:hidden">
          <Image src={logoMb} alt="logo-mobile" className=" logo-mb" />
        </Link>

        <nav className="navbar-wrapper">
          <ul className="navbar hidden lg:flex justify-between flex-row">
            <li>
              <Link href="/lesson">探索課程</Link>
            </li>
            <li>
              <Link href="/instrument">樂器商城</Link>
            </li>
            <li>
              <Link href="/jam/recruit-list">Let&apos;s JAM!</Link>
            </li>
            <li>
              <Link href="/article/article-list">樂友論壇</Link>
            </li>
            <li>
              <button
                onClick={toggleDark}
                aria-label="切換暗黑模式"
                className="dark-toggle"
              >
                {isDark ? <IoSunny size={22} /> : <IoMoon size={22} />}
              </button>
            </li>
            <li className="ml-6 cart-icon">
              <div
                className="cart"
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (cartState && calcTotalItems() !== 0) {
                    router.push(`/cart/check`)
                  } else {
                    cartNull()
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (cartState && calcTotalItems() !== 0) {
                      router.push(`/cart/check`)
                    } else {
                      cartNull()
                    }
                  }
                }}
              >
                <IoCart size={30} className="cart-icon" />
                {cartState && calcTotalItems() !== 0 ? (
                  <span className="button__badge">{calcTotalItems()}</span>
                ) : (
                  ''
                )}
              </div>
            </li>
            <li className="login-state flex justify-center">
              {LoginUserData.id ? (
                <div
                  className="user-img "
                  onClick={handleClick}
                  role="presentation"
                >
                  <Image
                    src={avatarImage}
                    alt="user-photo"
                    fill={true}
                    sizes="(max-width: 150px)"
                  />
                </div>
              ) : (
                <Link className="" href="/login">
                  登入/註冊
                </Link>
              )}

              {/* 用戶頭像 */}
              <div className="user-img hidden">
                <Image
                  src="/jam/amazingshow.jpg"
                  alt="user-photo"
                  fill={true}
                  sizes="(max-width: 150px)"
                />
              </div>
            </li>
          </ul>
          {/* 手機版 navbar */}
          <div className="navbar-mb lg:hidden flex justify-end items-center">
            <div
              className="p-0 mr-6 cart-icon"
              role="button"
              tabIndex={0}
              onClick={() => {
                if (cartState && calcTotalItems() !== 0) {
                  router.push(`/cart/check`)
                } else {
                  cartNull()
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (cartState && calcTotalItems() !== 0) {
                    router.push(`/cart/check`)
                  } else {
                    cartNull()
                  }
                }
              }}
            >
              <div className="cart">
                <IoCart size={30} className="cart-icon" />
                {cartState && calcTotalItems() !== 0 ? (
                  <span className="button__badge">{calcTotalItems()}</span>
                ) : (
                  ''
                )}
              </div>
            </div>

            <button
              onClick={toggleDark}
              aria-label="切換暗黑模式"
              className="dark-toggle mr-4"
            >
              {isDark ? <IoSunny size={22} /> : <IoMoon size={22} />}
            </button>
            <IoMenu size={30} className="ml-6" onClick={menuMbToggle} />
          </div>
          {/* 登入狀態下 點擊右上角叫出小視窗          */}
          <div
            className={`avatar-menu hidden sm:flex flex-col ${avatarActivestatus}`}
          >
            {/* 用戶資訊區塊 */}
            <div className="mm-header">
              <div className="mm-avatar">
                <Image
                  src={avatarImage}
                  alt="user-avatar"
                  fill={true}
                  sizes="(max-width: 56px)"
                />
              </div>
              <div className="mm-user-info">
                <span className="mm-greeting">歡迎回來</span>
                <span className="mm-username">
                  {LoginUserData.nickname
                    ? LoginUserData.nickname
                    : LoginUserData.name}
                </span>
              </div>
            </div>
            <div className="mm-divider" />
            <Link className="mm-item-right" href="/user/user-info">
              <RiUser3Line size={16} className="mm-item-icon" />
              會員中心
            </Link>
            {LoginUserData.isAdmin && (
              <Link className="mm-item-right" href="/admin">
                <RiSettings4Line size={16} className="mm-item-icon" />
                管理後台
              </Link>
            )}
            <div className="mm-divider" />
            <div
              onClick={async () => {
                await handleLogout()
                logoutAlert()
              }}
              role="presentation"
              className={`mm-item-right logout-btn ${styles.logoutLink}`}
            >
              <ImExit size={15} className="mm-item-icon" />
              登出
            </div>
          </div>
        </nav>
      </header>

      <style jsx>{`
        .navbar-wrapper {
          position: relative;
          z-index: 120; /* 設置 z-index */
        }

        .cart {
          display: block;
          padding: 5px 12px;
          border-radius: 10px;
          color: #fff;
          font-size: 20px;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          &:hover {
            color: #124365;
            background-color: #fff;
          }
        }
        .avatar-menu {
          width: 200px;
          position: absolute;
          top: 64px;
          right: -12px;
          background-color: #fff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          animation: dropIn 0.18s ease;

          &::before {
            content: '';
            position: absolute;
            top: -6px;
            right: 28px;
            width: 12px;
            height: 12px;
            background: #fff;
            border-left: 1px solid rgba(0, 0, 0, 0.08);
            border-top: 1px solid rgba(0, 0, 0, 0.08);
            transform: rotate(45deg);
          }

          .mm-header {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 14px 16px;
            background: linear-gradient(135deg, #f0f7ff 0%, #e8f4ff 100%);
          }

          .mm-avatar {
            position: relative;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            overflow: hidden;
            flex-shrink: 0;
            border: 2px solid #1581cc;
          }

          .mm-user-info {
            display: flex;
            flex-direction: column;
            min-width: 0;
          }

          .mm-greeting {
            font-size: 11px;
            color: #888;
            font-weight: 400;
          }

          .mm-username {
            font-size: 14px;
            font-weight: 600;
            color: #1a1a1a;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 110px;
          }

          .mm-divider {
            width: 100%;
            height: 1px;
            background: rgba(0, 0, 0, 0.07);
          }

          .mm-item-right {
            width: 100%;
            padding: 10px 16px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 500;
            color: #333;
            cursor: pointer;
            font-size: 14px;
            text-decoration: none;
            transition: background 0.15s, color 0.15s;
            white-space: nowrap;
            &:hover {
              background-color: #f5f5f5;
              color: #1581cc;
            }
          }

          .mm-item-icon {
            font-size: 15px;
            flex-shrink: 0;
          }

          .logout-btn {
            color: #e53e3e;
            &:hover {
              background-color: #fff5f5;
              color: #c53030;
            }
          }
        }
        .menu-active {
          top: -999px;
          opacity: 0;
          pointer-events: none;
        }
        @keyframes dropIn {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .dark-toggle {
          background: none;
          border: none;
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 5px 8px;
          border-radius: 8px;
          &:hover {
            background-color: rgba(255, 255, 255, 0.15);
          }
        }
        .cart-icon {
          position: relative;
        }
        .button__badge {
          background-color: #fa3e3e;
          border-radius: 10px;
          color: white;
          padding: 3px 6px;
          font-size: 10px;
          position: absolute;
          top: 1px;
          right: 5px;
        }
      `}</style>
    </>
  )
}
