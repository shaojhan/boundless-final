import { apiBaseUrl } from '@/configs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { debounce } from 'lodash'
import { useAuth } from '@/hooks/user/use-auth'
import { useJam } from '@/hooks/use-jam'
import toast from 'react-hot-toast'
import Navbar from '@/components/common/navbar'
import NavbarMb from '@/components/common/navbar-mb'
import Footer from '@/components/common/footer'
import MemberInfo from '@/components/jam/member-info'
import Apply from '@/components/jam/apply'
import Link from 'next/link'
import Head from 'next/head'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import 'animate.css'
// icons
import { IoHome } from 'react-icons/io5'
import { FaChevronRight } from 'react-icons/fa6'
// scss
import styles from '@/pages/jam/jam.module.scss'
import { useMenuToggle } from '@/hooks/useMenuToggle'

export default function Info() {
  const router = useRouter()
  const { setInvalidJam, notEnough, checkCancel, notifyAccept, notifyReject } =
    useJam()
  // ----------------------會員登入狀態 & 會員資料獲取  ----------------------
  //從hook 獲得使用者登入的資訊  儲存在變數LoginUserData裡面
  const { LoginUserData } = useAuth()
  //登出功能

  // sweetalert
  const mySwal = withReactContent(Swal)

  const [genre, setGenre] = useState([])
  const [player, setPlayer] = useState([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [jam, setJam] = useState<any>({
    id: 0,
    juid: '',
    title: '',
    degree: 0,
    created_time: '',
    genre: [],
    player: [],
    region: '',
    band_condition: '',
    description: '',
    former: {},
    member: [],
  })

  // -------------------------------------------------- 申請資料 --------------------------------------------------
  const [applies, setApplies] = useState([])
  // 進入頁面者是否有申請此樂團
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [myApplyState, setMyApplyState] = useState<any>(0)
  // 根據申請狀態顯示不同內容
  const switchSentence = (applyState) => {
    switch (applyState) {
      case 0:
        return (
          <div
            className="b-btn-disable"
            style={{
              paddingInline: '38px',
              backgroundColor: '#666666',
            }}
            role="presentation"
          >
            已送出申請
          </div>
        )
      case 1:
        return (
          <Link
            className="b-btn b-btn-primary"
            style={{
              paddingInline: '38px',
            }}
            href="/user/user-jam"
          >
            至會員中心正式加入
          </Link>
        )
      case 2:
        return (
          <div
            className="b-btn-disable"
            style={{
              paddingInline: '38px',
              backgroundColor: '#666666',
            }}
            role="presentation"
          >
            已被拒絕
          </div>
        )
      case 3:
        return (
          <div
            className="b-btn-disable"
            style={{
              paddingInline: '38px',
              backgroundColor: '#666666',
            }}
            role="presentation"
          >
            已取消申請
          </div>
        )
      case 4:
        return (
          <div
            className="b-btn-disable"
            style={{
              paddingInline: '38px',
              backgroundColor: '#666666',
            }}
            role="presentation"
          >
            不得再次申請
          </div>
        )
      default:
        return null
    }
  }
  // -------------------------------------------------- 手機版本  --------------------------------------------------
  // 主選單
  const { showMenu, menuMbToggle } = useMenuToggle()

  // -------------------------------------------------- 讓player代碼對應樂器種類 --------------------------------------------------
  // 設定本頁可選的職位選項
  const playerOption = player.filter((v) => {
    return (
      v.id ===
      jam.player.find((jv) => {
        return jv === v.id
      })
    )
  })
  const playerName = jam.player.map((p) => {
    const matchedPlayer = player.find((pd) => pd.id === p) // 物件
    return matchedPlayer.name
  })
  // 累加重複的樂器種類 吉他變成吉他*2
  const countPlayer = playerName.reduce((accumulator, count) => {
    if (!accumulator[count]) {
      accumulator[count] = 1
    } else {
      accumulator[count]++
    }
    return accumulator
  }, {})
  const playerResult = Object.entries(countPlayer).map(([player, count]) => {
    return (count as number) > 1 ? `${player}*${count}` : player
  })

  // -------------------------------------------------- 預計人數 --------------------------------------------------
  const nowNumber = jam.member.length + 1
  const totalNumber = jam.member.length + jam.player.length + 1
  // -------------------------------------------------- genre對應 --------------------------------------------------
  const genreName = jam.genre.map((g) => {
    const matchedgenre = genre.find((gd) => gd.id === g)
    return matchedgenre.name
  })

  // -------------------------------------------------- 創立時間資料中，單獨取出日期 --------------------------------------------------
  // 調出的時間是ISO格式，顯示時需要轉換成本地時區
  const createdDate = new Date(jam.created_time)
    .toLocaleString()
    .split(' ')[0]
    .replace(/\//g, '-')
  // -------------------------------------------------- 計算倒數時間
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [countDown, setCountDown] = useState<any>({
    day: 0,
    hour: 0,
    minute: 0,
    second: 0,
  })

  function calcTimeLeft() {
    const now = Date.now()
    // 創立日期 + 30天 - 目前時間 = 剩餘時間
    const createdTime = new Date(jam.created_time).getTime()
    const interval = createdTime + 30 * 24 * 60 * 60 * 1000 - now
    const cdDay = Math.floor(interval / (1000 * 60 * 60 * 24))
    const cdHour = Math.floor(
      (interval % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    )
    const cdMinute = Math.floor((interval % (1000 * 60 * 60)) / (1000 * 60))
    const cdSecond = Math.floor((interval % (1000 * 60)) / 1000)
    const countDownObj = {
      day: cdDay,
      hour: cdHour,
      minute: cdMinute,
      second: cdSecond,
      raw: interval,
    }
    return countDownObj
  }

  // -------------------------------------------------- 剩餘時間是否小於5天
  const [timeWarningState, setTimeWarningState] = useState(false)
  useEffect(() => {
    setTimeWarningState(
      (Date.now() - new Date(jam.created_time).getTime()) /
        (1000 * 60 * 60 * 24) >=
        25,
    )
  }, [jam.created_time])

  // ---------------------------------------------- 入團申請表單 ---------------------------------------------------------
  const [complete, setComplete] = useState(2)
  // ----------------------------------------- 擔任職位
  // 控制表單狀態
  const [myPlayer, setMyPlayer] = useState('')
  // ----------------------------------------- 描述
  const [message, setMessage] = useState('')
  const [messageCheck, setMessageCheck] = useState(true)
  // ----------------------------------------- 檢查登入狀態，未登入不得提交表單
  const checkLogin = (LoginUserData) => {
    if (
      !LoginUserData ||
      LoginUserData.status === 'error' ||
      LoginUserData.length == 0
    ) {
      toast('請先登入', {
        icon: 'ℹ️',
        style: {
          border: '1px solid #666666',
          padding: '16px',
          color: '#1d1d1d',
        },
        duration: 2000,
      })
      return false
    } else {
      return true
    }
  }

  // ----------------------------------------- 檢查不雅字詞
  const checkBadWords = debounce(() => {
    const badWords = /幹|屎|尿|屁|糞|靠北|靠腰|雞掰|王八|你媽|妳媽|淫/g
    setMessageCheck(message.search(badWords) < 0 ? true : false)
  }, 250)

  // ----------------------------------------- 檢查表單是否填妥
  const checkComplete = () => {
    if (messageCheck === false || message === '') {
      setComplete(0)
      return false
    }
    if (myPlayer === '') {
      setComplete(0)
      return false
    }
    setComplete(1)
    return true
  }

  // ----------------------------------------- 送出申請表單
  const sendApply = async (myPlayer, message) => {
    if (!checkComplete()) {
      return false
    }
    let formData = new FormData()
    formData.append('juid', jam.juid)
    formData.append('former_uid', jam.former.uid)
    formData.append('applier_uid', LoginUserData.uid)
    formData.append('applier_play', myPlayer)
    formData.append('message', message)
    // 確認formData內容
    // for (let [key, value] of formData.entries()) {
    // }
    const res = await fetch(`${apiBaseUrl}/jam/apply`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })
    const result = await res.json()
    if (result.status === 'success') {
      notifySuccess()
    }
  }

  // ----------------------------------------- 申請成功後，彈出訊息框
  const notifySuccess = () => {
    mySwal
      .fire({
        position: 'center',
        icon: 'success',
        iconColor: '#1581cc',
        title: '申請成功，請靜候審核結果',
        showConfirmButton: false,
        timer: 3000,
      })
      .then(() =>
        setTimeout(() => {
          window.location.reload()
        }, 3000),
      )
  }

  // --------------------------------------------------- 決定審核結果 -------------------------------------------------
  const sendResult = async (id, state) => {
    let formData = new FormData()
    formData.append('id', id)
    formData.append('state', state)
    const res = await fetch(`${apiBaseUrl}/jam/decideApply`, {
      method: 'PUT',
      body: formData,
      credentials: 'include',
    })
    const result = await res.json()
    if (result.status === 'success') {
      if (result.state === 1) {
        notifyAccept()
      } else if (result.state === 2) {
        notifyReject()
      }
    } else if (result.status === 'cancel') {
      checkCancel()
    }
  }
  // ----------------------------------------------- 立即成團 ----------------------------------------------------
  const formRightNow = async () => {
    let formData = new FormData()
    formData.append('juid', jam.juid)
    const res = await fetch(`${apiBaseUrl}/jam/formRightNow`, {
      method: 'PUT',
      body: formData,
      credentials: 'include',
    })
    const result = await res.json()
    if (result.status === 'success') {
      return true
    }
  }

  // 成團提醒&成功訊息
  const notifyFormRightNow = () => {
    if (jam.member.length === 0) {
      // 顯示人數不足提示
      notEnough()
    } else {
      mySwal
        .fire({
          title: '確定以現有成員立即成團？',
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
            const res = await formRightNow()
            if (res) {
              mySwal.fire({
                title: '恭喜樂團成立！為您導向新資訊頁',
                icon: 'success',
                iconColor: '#1581cc',
                showConfirmButton: false,
                timer: 2500,
              })
              setTimeout(() => {
                router.push(`/jam/jam-list/${jam.juid}`)
              }, 2500)
            }
          }
        })
    }
  }
  // ----------------------------------------------- 解散樂團 ----------------------------------------------------
  const sendDisband = async () => {
    // 組合出所有樂團內的成員uid，用於清空所有my_jam欄位
    let ids = []
    ids.push(jam.former.uid)
    for (let i = 0; i < jam.member.length; i++) {
      ids.push(jam.member[i].uid)
    }
    let formData = new FormData()
    formData.append('ids', JSON.stringify(ids))
    formData.append('juid', jam.juid)
    const res = await fetch(`${apiBaseUrl}/jam/disband`, {
      method: 'PUT',
      body: formData,
      credentials: 'include',
    })
    const result = await res.json()
    if (result.status === 'success') {
      return true
    } else {
      return false
    }
  }

  // 解散警示&成功訊息
  const warningDisband = () => {
    mySwal
      .fire({
        title: '即將解散樂團',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ec3f3f',
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
          const res = await sendDisband()
          if (res) {
            mySwal.fire({
              title: '樂團已解散，即將回到招募列表',
              icon: 'success',
              iconColor: '#1581cc',
              showConfirmButton: false,
              timer: 2500,
            })
            setTimeout(() => {
              router.push('/jam/recruit-list')
            }, 2500)
          }
        }
      })
  }

  // ----------------------------------------------- 退出樂團 ----------------------------------------------------
  const sendQuit = async () => {
    // 獲得該使用者在樂團的職位，用於復原招募樂手
    const quitMemberPlay = jam.member.find((v) => {
      return (v.id = LoginUserData.id)
    }).play

    let formData = new FormData()
    formData.append('id', LoginUserData.id)
    formData.append('juid', jam.juid)
    formData.append('playname', quitMemberPlay)
    const res = await fetch(`${apiBaseUrl}/jam/quit`, {
      method: 'PUT',
      body: formData,
      credentials: 'include',
    })
    const result = await res.json()
    if (result.status === 'success') {
      return true
    } else {
      return false
    }
  }

  // 退出警示&成功訊息
  const warningQuit = () => {
    mySwal
      .fire({
        title: '確定退出樂團？',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ec3f3f',
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
          const res = await sendQuit()
          if (res) {
            mySwal.fire({
              title: '已退出，即將回到招募列表',
              icon: 'success',
              iconColor: '#1581cc',
              showConfirmButton: false,
              timer: 2500,
            })
            setTimeout(() => {
              router.push('/jam/recruit-list')
            }, 2500)
          }
        }
      })
  }

  // ------------------------------------------------- 獲取資料 ---------------------------------------------------
  const getSingleData = async (juid) => {
    try {
      const res = await fetch(
        // 加入uid是為了檢查該使用者是否有申請此樂團，以及其申請狀態
        `/jam/singleJam/${juid}/${LoginUserData.uid}`,
      )
      // res.json()是解析res的body的json格式資料，得到JS的資料格式
      const data = await res.json()
      if (data.status === 'success') {
        setPlayer(data.playerData)
        setGenre(data.genreData)
        setJam(data.jamData)
        setApplies(data.applyData)
        if (data.myApplyState.length > 0) {
          setMyApplyState(data.myApplyState[0])
        }
        // 若該樂團已成立，導向成團後的資訊頁面
      } else if (data.status === 'formed') {
        router.push(`/jam/jam-list/${juid}`)
      } else if (data.status === 'error') {
        setInvalidJam(false)
        router.push(`/jam/recruit-list`)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // ----------------------------- useEffect -----------------------------
  // 初次渲染後，向伺服器要求資料，設定到狀態中
  useEffect(() => {
    if (router.isReady) {
      const { juid } = router.query
      getSingleData(juid)
    }
  }, [router.isReady, LoginUserData.uid])

  useEffect(() => {
    setCountDown(calcTimeLeft())
    // 每秒更新一次倒數計時
    const timer = setInterval(() => {
      setCountDown(calcTimeLeft())
    }, 1000)

    // 清除計時器
    return () => clearInterval(timer)
  }, [jam.created_time])

  // 申請表單填寫
  useEffect(() => {
    // 跳出未填寫完畢警告後再次輸入，消除警告
    setComplete(2)
    // 檢查不雅字詞
    checkBadWords.cancel() // 取消上一次的延遲
    checkBadWords()
  }, [myPlayer, message])

  return (
    <>
      <Head>
        <title>JAM資訊</title>
      </Head>
      <Navbar menuMbToggle={menuMbToggle} />
      <div
        className="container mx-auto px-6 relative"
        style={{ minHeight: '95svh' }}
      >
        {/* 手機版主選單/navbar */}
        <div
          className={`menu-mb sm:hidden flex flex-col items-center ${showMenu ? 'menu-mb-show' : ''}`}
        >
          <NavbarMb />
        </div>
        <div className={`${styles.row} flex flex-wrap -mx-3`}>
          {/* 麵包屑 */}
          <div className="breadcrumb-wrapper-ns">
            <ul className="flex items-center p-0 m-0">
              <IoHome size={20} />
              <li style={{ marginLeft: '8px' }}>Let&apos;s JAM!</li>
              <FaChevronRight />
              <Link href="/jam/recruit-list">
                <li style={{ marginLeft: '10px' }}>團員募集</li>
              </Link>

              <FaChevronRight />
              <li style={{ marginLeft: '10px' }}>JAM資訊</li>
            </ul>
          </div>
          {/*   ---------------------- 主要內容  ---------------------- */}
          <div className={`${styles.jamMain} w-full px-6 sm:w-2/3 px-6`}>
            <div className={`${styles.jamLeft}`}>
              {/*   ---------------------- 樂團資訊  ---------------------- */}
              <section className={`${styles.jamLeftSection}`}>
                <div
                  className={`${styles.jamTitle} flex justify-between items-center`}
                >
                  <div>JAM資訊</div>
                  <div className={`${styles.cardBadge} ${styles.degree}`}>
                    {jam.degree == '1' ? '新手練功' : '老手同樂'}
                  </div>
                </div>
                {/* -------------------------- 主旨 -------------------------- */}
                <div className={`${styles.formItem} flex flex-wrap -mx-3`}>
                  <div
                    className={`${styles.itemTitle} w-full px-6 sm:w-1/6 px-6`}
                  >
                    主旨
                  </div>
                  <div
                    className={`${styles.infoText} w-full px-6 sm:w-5/6 px-6`}
                  >
                    {jam.title}
                  </div>
                </div>
                {/* -------------------------- 發起日期 -------------------------- */}
                <div className={`${styles.formItem} flex flex-wrap -mx-3`}>
                  <div
                    className={`${styles.itemTitle} w-full px-6 sm:w-1/6 px-6`}
                  >
                    發起日期
                  </div>
                  <div
                    className={`${styles.infoText} w-full px-6 sm:w-5/6 px-6`}
                  >
                    {createdDate}
                  </div>
                </div>
                {/* -------------------------- 音樂風格 -------------------------- */}
                <div className={`${styles.formItem} flex flex-wrap -mx-3`}>
                  <div
                    className={`${styles.itemTitle} w-full px-6 sm:w-1/6 px-6`}
                  >
                    音樂風格
                  </div>
                  <div
                    className={`${styles.itemInputWrapper} w-full px-6 sm:w-5/6 px-6`}
                  >
                    <div
                      className="flex flex-wrap"
                      style={{ gap: '8px', flex: '1 0 0' }}
                    >
                      {genreName.map((v, i) => {
                        return (
                          <div
                            key={i}
                            className={`${styles.cardBadge} ${styles.genere}`}
                          >
                            {v}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
                {/* -------------------------- 徵求樂手 -------------------------- */}
                <div className={`${styles.formItem} flex flex-wrap -mx-3`}>
                  <div
                    className={`${styles.itemTitle} w-full px-6 sm:w-1/6 px-6`}
                  >
                    徵求樂手
                  </div>
                  <div
                    className={`${styles.itemInputWrapper} w-full px-6 sm:w-5/6 px-6`}
                  >
                    <div
                      className="flex flex-wrap"
                      style={{ gap: '8px', flex: '1 0 0' }}
                    >
                      {playerResult.map((v, i) => {
                        return (
                          <div
                            key={i}
                            className={`${styles.cardBadge} ${styles.player}`}
                          >
                            {v}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
                {/* -------------------------- 預計人數 -------------------------- */}
                <div className={`${styles.formItem} flex flex-wrap -mx-3`}>
                  <div
                    className={`${styles.itemTitle} w-full px-6 sm:w-1/6 px-6`}
                  >
                    預計人數
                  </div>
                  <div
                    className={`${styles.infoText} w-full px-6 sm:w-5/6 px-6`}
                  >
                    <span style={{ color: '#1581cc' }}>{nowNumber}</span> /{' '}
                    {totalNumber} 人
                  </div>
                </div>
                {/* -------------------------- 地區 -------------------------- */}
                <div className={`${styles.formItem} flex flex-wrap -mx-3`}>
                  <div
                    className={`${styles.itemTitle} w-full px-6 sm:w-1/6 px-6`}
                  >
                    地區
                  </div>
                  <div
                    className={`${styles.infoText} w-full px-6 sm:w-5/6 px-6`}
                  >
                    {jam.region}
                  </div>
                </div>
                {/* -------------------------- 其他條件 -------------------------- */}
                <div className={`${styles.formItem} flex flex-wrap -mx-3`}>
                  <div
                    className={`${styles.itemTitle} w-full px-6 sm:w-1/6 px-6`}
                  >
                    其他條件
                  </div>
                  <div
                    className={`${styles.infoText} w-full px-6 sm:w-5/6 px-6`}
                  >
                    {jam.band_condition == '' ? '無' : jam.band_condition}
                  </div>
                </div>
                {/* -------------------------- 描述 -------------------------- */}
                <div className={`${styles.formItem} flex flex-wrap -mx-3`}>
                  <div
                    className={`${styles.itemTitle} w-full px-6 sm:w-1/6 px-6`}
                  >
                    描述
                  </div>
                  <div
                    className={`${styles.infoText} w-full px-6 sm:w-5/6 px-6`}
                    style={{ textAlign: 'justify' }}
                  >
                    {jam.description}
                  </div>
                </div>
                {LoginUserData.id === jam.former.id ? (
                  <div className="flex justify-center">
                    <Link
                      className="b-btn b-btn-primary"
                      style={{ paddingInline: '38px' }}
                      href="/jam/recruit-list/edit"
                    >
                      修改表單
                    </Link>
                  </div>
                ) : (
                  ''
                )}
              </section>
              {/* -------------------------- 入團申請 -------------------------- */}
              {/* 是否有所屬樂團? */}
              {LoginUserData.my_jam ? (
                <div>
                  {/* 是否屬於此樂團? */}
                  {LoginUserData.my_jam === jam.juid ? (
                    <>
                      {/* 是否是發起人? */}
                      {LoginUserData.id === jam.former.id ? (
                        <>
                          {/* 發起人進入所屬樂團頁面 */}
                          <hr style={{ margin: '6px' }} />
                          <section className={`${styles.jamLeftSection} mt-2`}>
                            <div className={`${styles.jamTitle}`}>申請一覽</div>
                            {applies.map((v) => {
                              return (
                                <Apply
                                  key={v.id}
                                  id={v.id}
                                  applier={v.applier}
                                  message={v.message}
                                  play={v.play}
                                  created_time={v.created_time}
                                  state={v.state}
                                  sendResult={sendResult}
                                />
                              )
                            })}
                          </section>
                        </>
                      ) : (
                        <>
                          <hr style={{ margin: '6px' }} />
                          <div className="flex justify-center">
                            <div
                              className="b-btn b-btn-danger mt-1"
                              style={{ paddingInline: '38px' }}
                              role="presentation"
                              onClick={() => {
                                warningQuit()
                              }}
                            >
                              退出
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    ''
                  )}
                </div>
              ) : (
                <>
                  {/* 無所屬樂團，顯示申請表單 */}
                  <hr style={{ margin: '6px' }} />
                  <section className={`${styles.jamLeftSection}`}>
                    <div className={`${styles.jamTitle}`}>
                      入團申請
                      <div
                        className={`${styles.noticeText}`}
                        style={{ color: '#666666' }}
                      >
                        ※ 可同時申請多個 JAM，但最終只能擇一加入。
                      </div>
                    </div>
                    {/* -------------------------- 擔任職位 -------------------------- */}
                    <div className={`${styles.formItem} flex flex-wrap -mx-3`}>
                      <label
                        className={`${styles.itemTitle} w-full px-6 sm:w-1/6 px-6`}
                        htmlFor="myPlayer"
                      >
                        擔任職位
                      </label>
                      <div
                        className={`${styles.itemInputWrapper} w-full px-6 sm:w-5/6 px-6`}
                      >
                        <select
                          className="form-select"
                          style={{ width: 'auto' }}
                          value={myPlayer}
                          name="myPlayer"
                          id="myPlayer"
                          disabled={myApplyState ? true : false}
                          onChange={(e) => {
                            setMyPlayer(e.target.value)
                          }}
                        >
                          <option value="" disabled>
                            請選擇
                          </option>
                          {playerOption.map((v) => {
                            return (
                              <option key={v.id} value={v.id}>
                                {v.name}
                              </option>
                            )
                          })}
                        </select>
                      </div>
                    </div>
                    {/* -------------------------- 想說的話 -------------------------- */}
                    <div className={`${styles.formItem} flex flex-wrap -mx-3`}>
                      <label
                        className={`${styles.itemTitle} w-full px-6 sm:w-1/6 px-6`}
                        htmlFor="message"
                      >
                        想說的話
                      </label>
                      <div
                        className={`${styles.itemInputWrapper} w-full px-6 sm:w-5/6 px-6`}
                      >
                        <textarea
                          className={`${styles.textArea} form-control`}
                          placeholder="建議可以提到自己喜歡的音樂、入團動機等，上限150字"
                          name="message"
                          id="message"
                          maxLength={150}
                          disabled={myApplyState ? true : false}
                          onChange={(e) => {
                            setMessage(e.target.value)
                          }}
                        />
                        {messageCheck ? (
                          ''
                        ) : (
                          <div
                            className={`${styles.warningText} mt-1 hidden sm:block`}
                          >
                            偵測到不雅字詞
                          </div>
                        )}
                      </div>
                      {messageCheck ? (
                        ''
                      ) : (
                        <div
                          className={`${styles.warningText} block sm:hidden p-0`}
                        >
                          偵測到不雅字詞
                        </div>
                      )}
                    </div>

                    <div className="flex justify-center">
                      {myApplyState ? (
                        <>{switchSentence(myApplyState.state)}</>
                      ) : (
                        <div
                          className="b-btn b-btn-primary"
                          style={{ paddingInline: '38px' }}
                          role="presentation"
                          onClick={() => {
                            if (checkLogin(LoginUserData)) {
                              sendApply(myPlayer, message)
                            }
                          }}
                        >
                          提交
                        </div>
                      )}
                    </div>
                    {complete === 0 ? (
                      <div
                        className="flex justify-center"
                        style={{ marginTop: '-8px' }}
                      >
                        <div className={`${styles.warningText}`}>
                          請遵照規則，並填寫所有必填內容
                        </div>
                      </div>
                    ) : (
                      ''
                    )}
                  </section>
                </>
              )}
            </div>
          </div>

          {/*   ---------------------- 成員名單  ---------------------- */}
          <div
            className={`${styles.jamRightWrapper} w-full px-6 sm:w-1/3 px-6`}
          >
            <div className={`${styles.jamRight}`}>
              <div className={`${styles.jamTitle}`}>期限倒數</div>
              <div
                style={{
                  color: timeWarningState ? '#ec3f3f' : '#1d1d1d',
                  fontSize: '20px',
                }}
              >
                {countDown.raw <= 0
                  ? '發起失敗'
                  : `${countDown.day} 天 ${countDown.hour} 小時 ${countDown.minute} 分 ${countDown.second} 秒`}
              </div>
              <div
                className={`${styles.jamTitle}`}
                style={{ marginBlock: '10px' }}
              >
                成員名單
              </div>
              <div className="flex items-center mb-2">
                <div className={`${styles.itemTitle} mr-6`}>發起人</div>
                <MemberInfo
                  uid={jam.former.uid}
                  name={jam.former.name}
                  nickname={jam.former.nickname}
                  img={jam.former.img}
                  play={jam.former.play}
                />
              </div>
              <div className="flex">
                <div className={`${styles.itemTitle} mr-6 mt-1`}>參加者</div>
                <div className="flex flex-col gap-2">
                  {jam.member[0] ? (
                    jam.member.map((v) => {
                      return (
                        <MemberInfo
                          key={v.uid}
                          uid={v.uid}
                          name={v.name}
                          nickname={v.nickname}
                          img={v.img}
                          play={v.play}
                        />
                      )
                    })
                  ) : (
                    <span className="font-medium mt-1">尚無人參加</span>
                  )}
                </div>
              </div>
              {LoginUserData.id === jam.former.id ? (
                <div className="flex justify-center gap-12 mt-6">
                  <div
                    className="b-btn b-btn-danger px-6"
                    role="presentation"
                    onClick={() => {
                      warningDisband()
                    }}
                  >
                    解散樂團
                  </div>
                  <div
                    className="b-btn b-btn-primary px-6"
                    role="presentation"
                    onClick={() => {
                      notifyFormRightNow()
                    }}
                  >
                    立即成團
                  </div>
                </div>
              ) : (
                ''
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
