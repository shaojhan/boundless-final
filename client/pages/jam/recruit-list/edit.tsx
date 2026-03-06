import { apiBaseUrl } from '@/configs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { debounce } from 'lodash'
import { useDetailFetch } from '@/hooks/useDetailFetch'
import { useFormSubmit } from '@/hooks/useFormSubmit'
import { containsBadWords } from '@/lib/utils/badWords'
import { useAuth } from '@/hooks/user/use-auth'
import { useJam } from '@/hooks/use-jam'
import Navbar from '@/components/common/navbar'
import NavbarMb from '@/components/common/navbar-mb'
import Footer from '@/components/common/footer'
import MemberInfo from '@/components/jam/member-info'
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
  const { setInvalidEdit } = useJam()
  // ----------------------會員登入狀態 & 會員資料獲取  ----------------------
  //從hook 獲得使用者登入的資訊  儲存在變數LoginUserData裡面
  const { LoginUserData } = useAuth()
  //檢查token
  useEffect(() => {
    // 阻擋非法訪問
    if (!LoginUserData.my_jam) {
      setInvalidEdit(false)
      router.push('/jam/recruit-list')
      return
    }
  }, [])
  //登出功能
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
  // ---------------------- 手機版本  ----------------------
  // 主選單
  const { showMenu, menuMbToggle } = useMenuToggle()

  // ----------------------------- 讓player代碼對應樂器種類 -----------------------------
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

  // ----------------------------- 預計人數 -----------------------------
  const nowNumber = jam.member.length + 1
  const totalNumber = jam.member.length + jam.player.length + 1
  // ----------------------------- genre對應 -----------------------------
  const genreName = jam.genre.map((g) => {
    const matchedgenre = genre.find((gd) => gd.id === g)
    return matchedgenre.name
  })

  // ----------------------------- 創立時間資料中，單獨取出日期 -----------------------------
  // 調出的時間是ISO格式，顯示時需要轉換成本地時區
  const createdDate = new Date(jam.created_time)
    .toLocaleString()
    .split(' ')[0]
    .replace(/\//g, '-')
  // ----------------------------- 計算倒數時間 -----------------------------
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

  // ----------------------------- 剩餘時間是否小於5天 -----------------------------
  const [timeWarningState, setTimeWarningState] = useState(false)
  useEffect(() => {
    setTimeWarningState(
      (Date.now() - new Date(jam.created_time).getTime()) /
        (1000 * 60 * 60 * 24) >=
        25,
    )
  }, [jam.created_time])

  // ----------------------------- 入團申請表單 -----------------------------
  // 表單完成狀態 0: 有欄位尚未填寫或不符規定, 1: 填寫完成, 2: 填寫中
  const [complete, setComplete] = useState(2)
  // ---------------------- 標題 ----------------------
  const [title, setTitle] = useState('')
  const [titleCheck, setTitleCheck] = useState(true)
  // ---------------------- 其他條件 ----------------------
  const [condition, setCondition] = useState('')
  const [conditionCheck, setConditionCheck] = useState(true)
  // ---------------------- 描述 ----------------------
  const [description, setDescription] = useState('')
  const [descriptionCheck, setDescriptionCheck] = useState(true)

  // ---------------------- 表單填寫 ----------------------
  // 檢查不雅字詞
  const checkBadWords = debounce(() => {
    setTitleCheck(!containsBadWords(title))
    setConditionCheck(!containsBadWords(condition))
    setDescriptionCheck(!containsBadWords(description))
  }, 250)

  // 檢查表單是否填妥
  const checkComplete = () => {
    if (titleCheck === false || title === '') {
      setComplete(0)
      return false
    }
    if (conditionCheck === false) {
      setComplete(0)
      return false
    }
    if (descriptionCheck === false || description === '') {
      setComplete(0)
      return false
    }
    setComplete(1)
    return true
  }
  // 送出更改
  const { submit: submitForm } = useFormSubmit<{ status: string }>(
    `${apiBaseUrl}/jam/updateForm`,
    {
      method: 'PUT',
      onSuccess: (result) => {
        if (result.status === 'success') notifySuccess(LoginUserData.my_jam)
      },
    },
  )
  const sendForm = async (juid, title, condition, description) => {
    if (!checkComplete()) return false
    const formData = new FormData()
    formData.append('juid', juid)
    formData.append('title', title)
    formData.append('condition', condition)
    formData.append('description', description)
    await submitForm(formData)
  }
  // 修改成功後，彈出訊息框，並返回資訊頁面
  const notifySuccess = (juid) => {
    mySwal
      .fire({
        position: 'center',
        icon: 'success',
        iconColor: '#1581cc',
        title: '修改成功，返回資訊頁',
        showConfirmButton: false,
        timer: 3000,
      })
      .then(() =>
        setTimeout(() => {
          router.push(`/jam/recruit-list/${juid}`)
        }, 3000),
      )
  }

  // ----------------------------- useEffect -----------------------------
  // 初次渲染後，向伺服器要求資料，設定到狀態中
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawData } = useDetailFetch<any>(
    LoginUserData.my_jam && LoginUserData.uid
      ? `/jam/singleJam/${LoginUserData.my_jam}/${LoginUserData.uid}`
      : null,
  )
  useEffect(() => {
    if (!rawData || rawData.status !== 'success') return
    setPlayer(rawData.playerData)
    setGenre(rawData.genreData)
    setJam(rawData.jamData)
  }, [rawData])

  // 確定讀取完jam資料後，把值設定到對應的狀態中
  useEffect(() => {
    setTitle(jam.title)
    setCondition(jam.band_condition)
    setDescription(jam.description)
    setCountDown(calcTimeLeft())
    // 每秒更新一次倒數計時
    const timer = setInterval(() => {
      setCountDown(calcTimeLeft())
    }, 1000)

    // 清除計時器
    return () => clearInterval(timer)
  }, [jam.created_time])

  // ---------------------- 偵測表單輸入變化，並執行檢查
  useEffect(() => {
    // 跳出未填寫完畢警告後再次輸入，消除警告
    setComplete(2)
    // 檢查不雅字詞
    checkBadWords.cancel() // 取消上一次的延遲
    checkBadWords()
  }, [title, condition, description])
  return (
    <>
      <Head>
        <title>修改表單</title>
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
              <li style={{ marginLeft: '10px' }}>修改表單</li>
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
                  <div>修改表單</div>
                  <div className={`${styles.cardBadge} ${styles.degree}`}>
                    {jam.degree == '1' ? '新手練功' : '老手同樂'}
                  </div>
                </div>
                {/* -------------------------- 主旨 -------------------------- */}
                <div className={`${styles.formItem} flex flex-wrap -mx-3`}>
                  <label
                    className={`${styles.itemTitle} w-full px-6 sm:w-1/6 px-6`}
                    htmlFor="title"
                  >
                    主旨
                  </label>
                  <div
                    className={`${styles.itemInputWrapper} w-full px-6 sm:w-5/6 px-6 flex items-center`}
                  >
                    <input
                      type="text"
                      className={`${styles.itemInput} w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
                      name="title"
                      id="title"
                      placeholder="發起動機或目的，上限20字"
                      maxLength={20}
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value)
                      }}
                    />
                    {titleCheck ? (
                      ''
                    ) : (
                      <div
                        className={`${styles.warningText} ml-2 hidden sm:block`}
                      >
                        偵測到不雅字詞
                      </div>
                    )}
                  </div>
                  {titleCheck ? (
                    ''
                  ) : (
                    <div
                      className={`${styles.warningText} block sm:hidden p-0`}
                    >
                      偵測到不雅字詞
                    </div>
                  )}
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
                  <label
                    className={`${styles.itemTitle} w-full px-6 sm:w-1/6 px-6`}
                    htmlFor="condition"
                  >
                    其他條件(選填)
                  </label>
                  <div
                    className={`${styles.itemInputWrapper} w-full px-6 sm:w-5/6 px-6`}
                  >
                    <input
                      type="text"
                      className={`w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
                      name="condition"
                      id="condition"
                      placeholder="事先說好要求，有助於玩團和樂哦～上限30字"
                      maxLength={30}
                      value={condition}
                      onChange={(e) => {
                        setCondition(e.target.value)
                      }}
                    />
                    {conditionCheck ? (
                      ''
                    ) : (
                      <div
                        className={`${styles.warningText} mt-1 hidden sm:block`}
                      >
                        偵測到不雅字詞
                      </div>
                    )}
                  </div>
                  {conditionCheck ? (
                    ''
                  ) : (
                    <div
                      className={`${styles.warningText} block sm:hidden p-0`}
                    >
                      偵測到不雅字詞
                    </div>
                  )}
                </div>
                {/* -------------------------- 描述 -------------------------- */}
                <div className={`${styles.formItem} flex flex-wrap -mx-3`}>
                  <label
                    className={`${styles.itemTitle} w-full px-6 sm:w-1/6 px-6`}
                    htmlFor="description"
                  >
                    描述
                  </label>
                  <div
                    className={`${styles.itemInputWrapper} w-full px-6 sm:w-5/6 px-6`}
                  >
                    <textarea
                      className={`${styles.textArea} w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
                      placeholder="輸入清楚、吸引人的描述，讓大家瞭解你的成團動機吧！上限150字"
                      name="description"
                      id="description"
                      maxLength={150}
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value)
                      }}
                    />
                    {descriptionCheck ? (
                      ''
                    ) : (
                      <div
                        className={`${styles.warningText} mt-1 hidden sm:block`}
                      >
                        偵測到不雅字詞
                      </div>
                    )}
                  </div>
                  {descriptionCheck ? (
                    ''
                  ) : (
                    <div
                      className={`${styles.warningText} block sm:hidden p-0`}
                    >
                      偵測到不雅字詞
                    </div>
                  )}
                </div>

                <div className="flex justify-center gap-12">
                  <Link
                    className="b-btn b-btn-body"
                    style={{ paddingInline: '38px' }}
                    href={`/jam/recruit-list/${jam.juid}`}
                  >
                    取消
                  </Link>
                  <div
                    className="b-btn b-btn-primary"
                    style={{ paddingInline: '38px' }}
                    role="presentation"
                    onClick={() => {
                      sendForm(
                        LoginUserData.my_jam,
                        title,
                        condition,
                        description,
                      )
                    }}
                  >
                    送出
                  </div>
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
                <div className={`${styles.itemTitle} mr-6`}>參加者</div>
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
                    <span className="font-medium">尚無人參加</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
