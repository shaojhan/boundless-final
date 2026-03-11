import uStyles from './user-layout.module.scss'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/common/navbar'
import NavbarMb from '@/components/common/navbar-mb'
import Footer from '@/components/common/footer'
import Link from 'next/link'
import Image from 'next/image'
import Head from 'next/head'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
// 會員認證hook
import { useAuth } from '@/hooks/user/use-auth'
import { useJam } from '@/hooks/use-jam'
import { useAvatarImage } from '@/hooks/useAvatarImage'
// icons
import { IoHome } from 'react-icons/io5'
import { FaChevronRight } from 'react-icons/fa6'
import { FaExternalLinkAlt } from 'react-icons/fa'
import { IoClose } from 'react-icons/io5'
import { useMenuToggle } from '@/hooks/useMenuToggle'

export default function UserJam() {
  const router = useRouter()
  const { cancelSuccess, deleteSuccess } = useJam()
  // ----------------------會員登入狀態 & 會員資料獲取  ----------------------
  //從hook 獲得使用者登入的資訊  儲存在變數LoginUserData裡面
  const { LoginUserData } = useAuth()
  const [myApply, setMyApply] = useState([])
  //登出功能

  const mySwal = withReactContent(Swal)

  const avatarImage = useAvatarImage()

  // ----------------------會員登入狀態  ----------------------
  // ----------------------手機版本  ----------------------
  // 主選單
  const { showMenu, menuMbToggle, showSidebar, sidebarToggle, setShowSidebar } =
    useMenuToggle()
  // ----------------------假資料  ----------------------
  // sidebar假資料
  // const sidebarData = [
  //   '會員資訊',
  //   '我的樂團',
  //   '我的訂單',
  //   '我的文章',
  //   '我的收藏',
  //   '我的優惠券 ',
  //   '我的課程',
  //   '我的訊息',
  // ]

  // 正式加入
  const joinJam = async (user_id, user_uid, juid, applier_play) => {
    let formData = new FormData()
    formData.append('user_id', user_id)
    formData.append('user_uid', user_uid)
    formData.append('juid', juid)
    formData.append('applier_play', applier_play)
    try {
      const res = await fetch(`/jam/joinJam`, {
        method: 'PUT',
        body: formData,
        credentials: 'include',
      })
      const result = await res.json()
      return result
    } catch {
      alert('加入失敗')
    }
  }

  // 加入提醒&成功訊息
  const notifyJoin = (user_id, user_uid, juid, applier_play) => {
    mySwal
      .fire({
        title: '確定加入此樂團？',
        icon: 'question',
        iconColor: '#1581cc',
        showCancelButton: true,
        confirmButtonColor: '#1581cc',
        cancelButtonColor: '#666666',
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        showClass: {
          popup: `
            animate__animated
            animate__fadeInUp
            animate__faster
          `,
        },
        hideClass: {
          popup: `
            animate__animated
            animate__fadeOutDown
            animate__faster
          `,
        },
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const res = await joinJam(user_id, user_uid, juid, applier_play)
          if (res.status === 'success') {
            mySwal.fire({
              title: '加入成功，導向樂團資訊頁',
              icon: 'success',
              iconColor: '#1581cc',
              showConfirmButton: false,
              timer: 2500,
            })
            setTimeout(() => {
              router.push(`/jam/recruit-list/${juid}`)
            }, 2500)
          } else if (res.status === 'form_success') {
            mySwal.fire({
              title: '樂團成立！即將導向新資訊頁',
              text: '謝謝你，關鍵人物！',
              icon: 'success',
              iconColor: '#1581cc',
              showConfirmButton: false,
              timer: 2500,
            })
            setTimeout(() => {
              router.push(`/jam/jam-list/${juid}`)
            }, 2500)
          }
        }
      })
  }

  // 取消申請
  const cancelApply = async (id) => {
    let formData = new FormData()
    formData.append('id', id)
    try {
      const res = await fetch(`/jam/cancelApply`, {
        method: 'PUT',
        body: formData,
        credentials: 'include',
      })
      const result = await res.json()
      if (result.status === 'success') {
        cancelSuccess()
      }
    } catch (e) {
      console.error(e)
    }
  }
  // 刪除申請
  const deleteApply = async (id) => {
    let formData = new FormData()
    formData.append('id', id)
    try {
      const res = await fetch(`/jam/deleteApply`, {
        method: 'PUT',
        body: formData,
        credentials: 'include',
      })
      const result = await res.json()
      if (result.status === 'success') {
        deleteSuccess()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const getMyApply = async (uid) => {
    try {
      const res = await fetch(`/jam/getMyApply/${uid}`)
      const datas = await res.json()
      if (datas.status === 'success') {
        setMyApply(datas.data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const switchSentence = (state) => {
    switch (state) {
      case 0:
        return <span>審核中</span>
      case 1:
        return (
          <span className={`font-semibold ${uStyles.primary}`}>
            通過
          </span>
        )
      case 2:
        return <span className={uStyles.rejected}>拒絕</span>
      default:
        return null
    }
  }

  const switchOption = (state, id, juid, applier_play) => {
    switch (state) {
      case 0:
        return (
          <div
            role="presentation"
            className={`b-btn b-btn-body ${uStyles.btnSm}`}
            onClick={() => {
              cancelApply(id)
            }}
          >
            取消
          </div>
        )
      case 1:
        return (
          <div
            role="presentation"
            className={`b-btn b-btn-primary ${uStyles.btnSm}`}
            onClick={() => {
              notifyJoin(
                LoginUserData.id,
                LoginUserData.uid,
                juid,
                applier_play,
              )
            }}
          >
            加入
          </div>
        )
      case 2:
        return (
          <div
            role="presentation"
            className={`b-btn b-btn-body ${uStyles.btnSm}`}
            onClick={() => {
              deleteApply(id)
            }}
          >
            刪除
          </div>
        )
      default:
        return null
    }
  }
  // 若有樂團，則會直接導向所屬樂團
  useEffect(() => {
    if (LoginUserData.my_jam) {
      router.push(`../jam/recruit-list/${LoginUserData.my_jam}`)
    }
    getMyApply(LoginUserData.uid)
    // 必須確定LoginUserData.uid已經讀入
  }, [LoginUserData.uid])
  return (
    <>
      <Head>
        <title>我的樂團</title>
      </Head>
      <Toaster
        containerStyle={{
          top: 80,
          zIndex: 101,
        }}
      />
      <Navbar menuMbToggle={menuMbToggle} />
      {/* 先把HEROSECTION隱藏 */}
      {/* <div
        className="page-shero hidden sm:block"
        style={{ paddingTop: '60px' }}
      >
        <Image src={jamHero} className="object-cover w-full" alt="cover" />
      </div> */}
      <div className="container mx-auto px-6 relative">
        {/* 手機版主選單/navbar */}
        <div
          className={`menu-mb sm:hidden flex flex-col items-center ${showMenu ? 'menu-mb-show' : ''}`}
        >
          {/* 用戶資訊 */}
          <NavbarMb />
        </div>
        <div className="flex flex-wrap -mx-3">
          {/* sidebar */}
          <div className="sidebar-wrapper hidden sm:block sm:w-1/6 px-6">
            <div className="sidebar">
              <div className="sidebar-user-info">
                <div className="sidebar-user-info-imgBox">
                  <Image
                    src={avatarImage}
                    alt="user photo mb"
                    fill
                    priority //不加的話Next 會問是否要加優先級
                    sizes="(max-width: 150px)"
                  ></Image>
                </div>
                <div className="sidebar-user-info-text">
                  <div className="sidebar-user-info-name">
                    {LoginUserData.nickname}
                  </div>
                  <div className="sidebar-user-info-band">
                    {LoginUserData.my_jamname}
                  </div>
                </div>
                {/* 更換大頭貼的功能暫定併回會員資訊 故不再sidebar顯示 */}
                {/* <div className="sidebar-user-info-Camera-img">
                  <Image src={avatar} alt="user photo mb" fill></Image>
                </div> */}
              </div>
              <ul className="flex flex-col">
                {/* {sidebarData.map((item, index) => {
                  return (
                    <li key={index}>
                      <Link href={`#`}>{item}</Link>
                    </li>
                  )
                })} */}

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

          {/*   ----------------------頁面內容  ---------------------- */}
          <div className="w-full px-6 sm:w-5/6 px-6 page-control">
            {/* 手機版sidebar */}
            <div
              className={`sidebar-mb sm:hidden ${showSidebar ? 'sidebar-mb-show' : ''}`}
            >
              <div className="sm-close">
                <IoClose
                  size={32}
                  onClick={() => {
                    setShowSidebar(false)
                  }}
                />
              </div>

              <Link href={`/user/user-info`} className="sm-item ">
                會員資訊
              </Link>
              <Link
                href={
                  LoginUserData.jamstate == '1'
                    ? `/jam/recruit-list/${LoginUserData.my_jam}`
                    : `/user/user-jam`
                }
                className="sm-item active"
              >
                我的樂團
              </Link>
              <Link href={`/user/user-order`} className="sm-item">
                我的訂單
              </Link>
              <Link href={`/user/user-article`} className="sm-item">
                我的文章
              </Link>
              <Link href={`/user/user-coupon`} className="sm-item">
                我的優惠券
              </Link>
            </div>
            {/*  ---------------------- 頂部功能列  ---------------------- */}

            <div className="user-top-container">
              {/*  ---------------------- 麵包屑  ---------------------- */}
              <div className="breadcrumb-wrapper">
                <ul className="flex items-center p-0 m-0">
                  <IoHome size={20} />
                  <li className={uStyles.bcItem1}>會員中心</li>
                  <FaChevronRight />
                  <li className={uStyles.bcItem2}>我的樂團</li>
                </ul>
              </div>

              <div className="top-function-flex">
                {/*  ---------------------- 搜尋欄  ---------------------- */}
                <div className="search-sidebarBtn">
                  <div
                    className={`flex sm:hidden items-center b-btn b-btn-body ${uStyles.sidebarTrigger}`}
                    role="presentation"
                    onClick={sidebarToggle}
                  >
                    選單
                  </div>
                </div>
              </div>
            </div>
            {/* 主內容 */}
            <main className="content">
              <div className="container mx-auto px-6 custom-container">
                <div
                  className={uStyles.bgWhite}
                >
                  <div className="user-content">
                    <div className="user-content-top">
                      <div className="user-title-userInfo">樂團申請</div>
                    </div>
                    <div className={`noticeText ${uStyles.secondary}`}>
                      ※ 非招募中、已取消的申請資料不會列出。
                    </div>

                    <div className="user-notifyList">
                      <div className="user-notifyList-item flex flex-wrap -mx-3 flex-nowrap">
                        <div
                          className={`font-medium text-center w-1/6 px-6 ${uStyles.deepPrimary}`}
                        >
                          連結
                        </div>
                        <div
                          className={`font-medium text-center w-1/3 px-6 ${uStyles.deepPrimary}`}
                        >
                          主旨
                        </div>
                        <div
                          className={`font-medium text-center w-1/6 px-6 ${uStyles.deepPrimary}`}
                        >
                          職位
                        </div>
                        <div
                          className={`font-medium text-center w-1/6 px-6 ${uStyles.deepPrimary}`}
                        >
                          狀態
                        </div>
                        <div
                          className={`font-medium text-center w-1/6 px-6 ${uStyles.deepPrimary}`}
                        >
                          操作
                        </div>
                      </div>
                      <hr className={uStyles.hrDark} />
                      {myApply.map((v) => {
                        return (
                          <div
                            className="user-notifyList-item flex flex-wrap -mx-3 flex-nowrap my-6"
                            key={v.id}
                          >
                            <div
                              className={`flex justify-center w-1/6 px-6 ${uStyles.deepPrimary}`}
                            >
                              <Link
                                href={`/jam/recruit-list/${v.juid}`}
                                className={`b-btn b-btn-primary ${uStyles.btnSm}`}
                              >
                                <FaExternalLinkAlt />
                              </Link>
                            </div>
                            <div
                              className={`text-center w-1/3 px-6 ${uStyles.noPadH}`}
                            >
                              {v.title}
                            </div>
                            <div
                              className={`text-center w-1/6 px-6 ${uStyles.noPadH}`}
                            >
                              {v.applier_playname}
                            </div>
                            <div
                              className={`text-center w-1/6 px-6 ${uStyles.noPadH}`}
                            >
                              {switchSentence(v.state)}
                            </div>
                            <div
                              className={`flex justify-center w-1/6 px-6 ${uStyles.deepPrimary}`}
                            >
                              {switchOption(
                                v.state,
                                v.id,
                                v.juid,
                                v.applier_play,
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
      <Footer />

      <style jsx>{`
        .content {
          min-height: calc(100svh - 120px);
          padding-bottom: 30px;
          @media screen and (max-width: 576px) {
            padding-top: 30px;
            padding-inline: 20px;
            min-height: calc(100svh - 146px);
          }
        }
        .noticeText {
          margin-block: 10px;
          padding: 0;
          color: '#666666';
          font-size: 16px;
          font-weight: 400;
        }
        .user-top-container {
          width: 100%;
          background-color: #fff;
          padding-block: 20px 0px;
          position: -webkit-sticky;
          position: sticky;
          top: 10px;
          z-index: 100;
          @media screen and (max-width: 576px) {
            top: 60px;
            padding-block: 20px 18px;
            padding-inline: 12px;
            box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.25);
          }
        }
        /* -------------------user sidebar-------------------- */
        .sidebar-user-info {
          display: flex;
          padding: 0px 12px;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
          align-self: stretch;

          /* position: relative; */

          .sidebar-user-info-imgBox {
            width: 100px;
            height: 100px;
            border-radius: 100px;

            /* react Image 要加上這兩條參數 家在外層容器的css , Image本身要fill */

            position: relative;
            overflow: hidden;
          }
          .sidebar-user-info-text {
            display: flex;

            width: 140px;
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
            color: var(--dark, #1d1d1d);
            text-align: start;

            /* h5 */
            font-family: 'Noto Sans TC';
            font-size: 20px;
            font-style: normal;
            font-weight: 400;
            line-height: normal;
            .sidebar-user-info-band {
              margin-bottom: 20px;
            }
          }

          .sidebar-user-info-Camera-img {
            width: 30px;
            height: 30px;
            position: absolute;
            left: 85px;
            top: 70px;
            fill: var(--light-gray, #cfcfcf);
          }
        }

        /* -------------------user sidebar-------------------- */
        /* --------------- user-contect-notify--------------- */
        hr {
          margin: 10px;
        }
        .custom-container {
          padding: 0;
          color: #000;

          & p {
            font-family: 'Noto Sans TC';
            font-style: normal;
            font-weight: 400;
            line-height: normal;
            overflow: hidden;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            color: #000;
            text-overflow: ellipsis;
          }
          & h5 {
            font-family: 'Noto Sans TC';
            font-size: 20px;
            font-style: normal;
            font-weight: 400;
            line-height: normal;
            color: var(--primary-deep, #124365);
          }

          .user-orderList-pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            align-self: stretch;
          }
        }

        .user-content {
          display: flex;
          padding: 20px 10px;
          flex-direction: column;
          align-items: flex-start;
          border-radius: 5px;
          background: var(--gray-30, rgba(185, 185, 185, 0.3));

          .user-content-top {
            display: flex;
            align-items: flex-start;
            align-self: stretch;
            color: var(--primary-deep, #124365);
            text-align: center;
            justify-content: space-between;
            font-family: 'Noto Sans TC';
            font-size: 28px;
            font-style: normal;
            font-weight: 700;
            line-height: normal;

            .user-notify-newBtn {
              display: none;
            }
          }
          /*----------------------notify css----------------------- */
          .user-notifyList {
            width: 100%;
            overflow: auto;
          }

          .user-notifyList-item {
            align-items: center;
            padding-left: 4px;
            margin-inline: auto;
            /*height: 60px; */

            .user-notifyList-item-notifyLabel {
              display: -webkit-box;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 1;
              overflow: hidden;
            }
            .user-notifyList-item-type {
              /*text-align: end;*/
            }
            .user-notifyList-item-message {
              color: var(--primary-deep, #124365);
            }
          }

          /*----------------------notify css----------------------- */

          .user-orderList-pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            align-self: stretch;
          }
        }

        /* RWD讓SIDEBAR消失 測試用記得刪 */
        @media screen and (max-width: 576px) {
          body {
            padding-inline: 20px;
          }

          .custom-container {
            overflow: hidden;

            .user-content {
              width: 390px;
              padding: 10px;
              overflow: hidden;
            }
          }

          .user-content {
            .user-notifyList-item {
              padding-left: 0px;
              font-size: 16px;

              .user-notifyList-item-notifyLabel {
                -webkit-line-clamp: 2;
              }

              .user-notifyList-item-type {
                font-size: 16px;
              }
            }
          }
        }
        /* RWD讓SIDEBAR消失 測試用記得刪 */
      `}</style>
    </>
  )
}
