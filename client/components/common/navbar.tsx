import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { IoCart, IoMenu } from 'react-icons/io5'
import Image from 'next/image'
import logo from '@/assets/logo.svg'
import logoMb from '@/assets/logo_mb.svg'
import Link from 'next/link'
import { ImExit } from 'react-icons/im'
// sweetalert
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { Toaster } from 'react-hot-toast'

// 會員認證hook
import { useAuth } from '@/hooks/user/use-auth'
//google登入
import useFirebase from '@/hooks/user/use-firebase'
import { useAvatarImage } from '@/hooks/useAvatarImage'

// 購物車小badge 測試
import { useCart } from '@/hooks/use-cart'

export default function Navbar({
  menuMbToggle,
}: {
  menuMbToggle?: (..._args: unknown[]) => void
}) {
  const { calcTotalItems, cartNull, items } = useCart()
  const { logoutFirebase } = useFirebase()

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
            <li
              className="ml-6 cart-icon"
              onClick={() => {
                if (cartState && calcTotalItems() !== 0) {
                  router.push(`/cart/check`)
                } else {
                  cartNull()
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
              onClick={() => {
                if (cartState && calcTotalItems() !== 0) {
                  router.push(`/cart/check`)
                } else {
                  cartNull()
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

            <IoMenu size={30} className="ml-6" onClick={menuMbToggle} />
          </div>
          {/* 登入狀態下 點擊右上角叫出小視窗          */}
          <div
            className={`avatar-menu hidden  sm:flex  flex-col items-center ${avatarActivestatus}`}
          >
            {/* 用戶資訊 */}
            <div className="mm-user-info">
              歡迎，
              {LoginUserData.nickname
                ? LoginUserData.nickname
                : LoginUserData.name}
            </div>
            <Link className="mm-item-right" href="/user/user-info">
              會員中心
            </Link>
            {}
            <div
              onClick={async () => {
                await handleLogout()
                logoutFirebase()
                logoutAlert()
              }}
              //onclick 要加這個 不然ES會跳沒有給身障人士使用
              role="presentation"
              className="mm-item-right logout-btn"
              style={{ color: '#1581cc' }}
            >
              登出
              <ImExit size={16} className="ml-2 mt-1" />
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
          width: 160px;
          position: absolute;
          top: 59px;
          right: -20px;
          background-color: #fff;
          border-inline: 1px solid;
          border-bottom: 1px solid;
          border-color: #b9b9b9;
          border-radius: 0 0 3px 3px;
          a {
            color: #1581cc;
          }

          .mm-user-info {
            border-radius: 0px;
            width: 100%;
            padding-block: 8px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-weight: 400;
            color: #000;
            font-size: 16px;
          }
          .mm-item-right {
            border-radius: 0px;
            width: 100%;
            padding-block: 8px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-weight: 600;
            color: var($primary);
            cursor: pointer;
            font-size: 16px;
            &:hover {
              background-color: #ececec;
            }
          }

          .logout-btn {
            font-size: 16px;
          }
        }
        .menu-active {
          top: -580px;
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
