import React from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'
import { ImExit } from 'react-icons/im'
// sweetalert
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

// 會員認證hook
import { useAuth } from '@/hooks/user/use-auth'
import { useAvatarImage } from '@/hooks/useAvatarImage'

export default function NavbarMb() {
  // ----------------------會員登入狀態 & 會員資料獲取  ----------------------
  //從hook 獲得使用者登入的資訊  儲存在變數LoginUserData裡面
  const { LoginUserData, handleLogout } = useAuth()

  const avatarImage = useAvatarImage()

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

  return (
    <>
      {/* 用戶資訊 */}
      {LoginUserData.id ? (
        <>
          <div className="menu-mb-user-info flex items-center flex-col mb-6">
            <div className="mb-photo-wrapper mb-2">
              <Image src={avatarImage} alt="user photo mb" fill />
            </div>
            <div>
              {LoginUserData.nickname
                ? LoginUserData.nickname
                : LoginUserData.name}
            </div>
          </div>
          <Link
            className="mm-item"
            href="/user/user-info"
            style={{ borderTop: '1px solid #b9b9b9' }}
          >
            會員中心
          </Link>
        </>
      ) : (
        <Link className="mm-item" href="/login">
          登入/註冊
        </Link>
      )}

      <Link className="mm-item" href="/lesson">
        探索課程
      </Link>
      <Link className="mm-item" href="/instrument">
        樂器商城
      </Link>
      <Link className="mm-item" href="/jam/recruit-list">
        Let &apos;s JAM!
      </Link>
      <Link className="mm-item" href="/article/article-list">
        樂友論壇
      </Link>
      {LoginUserData.id ? (
        <div
          className="mm-item"
          style={{ color: '#1581cc' }}
          onClick={async () => {
            await handleLogout()
            logoutAlert()
          }}
        >
          登出
          <ImExit size={20} className="ml-2" />
        </div>
      ) : (
        ''
      )}
    </>
  )
}
