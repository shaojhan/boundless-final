import uStyles from './user-layout.module.scss'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '@/components/common/navbar'
import Footer from '@/components/common/footer'
import Link from 'next/link'
import Image from 'next/image'
import Head from 'next/head'
import NavbarMb from '@/components/common/navbar-mb'

import { useAuth } from '@/hooks/user/use-auth'
import { authFetch, getAccessToken } from '@/lib/api-client'
import { useAvatarImage } from '@/hooks/useAvatarImage'

import { townData } from '@/lib/utils/cityData'
import playerData from '@/data/player.json'
import genreData from '@/data/genre.json'
import { countries, townships } from '@/data/cart/twzipcode-data'

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import { IoHome } from 'react-icons/io5'
import { FaChevronRight } from 'react-icons/fa6'
import { IoClose, IoCamera } from 'react-icons/io5'
import { useMenuToggle } from '@/hooks/useMenuToggle'

export default function UserInfoEdit() {
  const { auth, LoginUserData } = useAuth()
  const router = useRouter()
  const avatarImage = useAvatarImage()

  const [userData, setuserData] = useState({
    id: '',
    uid: '',
    name: '',
    email: '',
    password: '',
    phone: '',
    postcode: '',
    country: '',
    township: '',
    address: '',
    birthday: '',
    genre_like: '',
    play_instrument: '',
    info: '',
    img: '',
    gender: '',
    nickname: '',
    google_uid: '',
    photo_url: '',
    privacy: '',
    my_lesson: '',
    my_jam: '',
    updated_time: '',
    valid: '',
  })

  const [countryIndex, setCountryIndex] = useState(-1)

  const getLoginUserProfile = async () => {
    if (!auth?.user?.id) return
    try {
      const response = await authFetch(`/api/user/profile/${auth.user.id}`)
      const LoginUserProfile = await response.json()
      setuserData(LoginUserProfile)
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error)
    }
  }

  useEffect(() => {
    if (LoginUserData) {
      getLoginUserProfile()
    }
  }, [])

  // birthday formatting
  let finalbirthday = '2000-01-01'
  if (userData.birthday) {
    const inputDate = new Date(userData.birthday)
    const year = inputDate.getFullYear()
    const month = String(inputDate.getMonth() + 1).padStart(2, '0')
    const day = String(inputDate.getDate()).padStart(2, '0')
    finalbirthday = `${year}-${month}-${day}`
  }
  useEffect(() => {
    setuserData({ ...userData, birthday: finalbirthday })
  }, [finalbirthday])

  // genre
  let genreLike1: string | undefined,
    genreLike2: string | undefined,
    genreLike3: string | undefined
  if (LoginUserData.genre_like) {
    const arr = LoginUserData.genre_like.split(',')
    genreLike1 = arr[0]
    genreLike2 = arr[1]
    genreLike3 = arr[2]
  }
  const [genreSelect1, setgenreSelect1] = useState('')
  const [genreSelect2, setgenreSelect2] = useState('')
  const [genreSelect3, setgenreSelect3] = useState('')
  useEffect(() => {
    let finalGenreLike = ''
    if (genreSelect1 && genreSelect1 !== '9999' && genreSelect2 && genreSelect2 !== '9999' && genreSelect3 && genreSelect3 !== '9999') {
      finalGenreLike = `${genreSelect1},${genreSelect2},${genreSelect3}`
    } else if (genreSelect1 && genreSelect1 !== '9999' && genreSelect2 && genreSelect2 !== '9999') {
      finalGenreLike = `${genreSelect1},${genreSelect2}`
    } else if (genreSelect1 && genreSelect1 !== '9999') {
      finalGenreLike = `${genreSelect1}`
    }
    setuserData({ ...userData, genre_like: finalGenreLike })
  }, [genreSelect1, genreSelect2, genreSelect3])

  // instrument
  let playInstrument1: string | undefined,
    playInstrument2: string | undefined,
    playInstrument3: string | undefined
  if (LoginUserData.play_instrument) {
    const arr = LoginUserData.play_instrument.split(',')
    playInstrument1 = arr[0]
    playInstrument2 = arr[1]
    playInstrument3 = arr[2]
  }
  const [playSelect1, setplaySelect1] = useState('')
  const [playSelect2, setplaySelect2] = useState('')
  const [playSelect3, setplaySelect3] = useState('')
  useEffect(() => {
    let finalPlayInstrument = ''
    if (playSelect1 && playSelect1 !== '9999' && playSelect2 && playSelect2 !== '9999' && playSelect3 && playSelect3 !== '9999') {
      finalPlayInstrument = `${playSelect1},${playSelect2},${playSelect3}`
    } else if (playSelect1 && playSelect1 !== '9999' && playSelect2 && playSelect2 !== '9999') {
      finalPlayInstrument = `${playSelect1},${playSelect2}`
    } else if (playSelect1 && playSelect1 !== '9999') {
      finalPlayInstrument = `${playSelect1}`
    }
    setuserData({ ...userData, play_instrument: finalPlayInstrument })
  }, [playSelect1, playSelect2, playSelect3])

  // privacy
  let privacyBD = '', privacyPhone = '', privacyEmail = ''
  if (LoginUserData.privacy) {
    const arr = LoginUserData.privacy.split(',')
    privacyBD = arr[0]
    privacyPhone = arr[1]
    privacyEmail = arr[2]
  }
  const [privacySelect1, setprivacySelect1] = useState('9999')
  const [privacySelect2, setprivacySelect2] = useState('9999')
  const [privacySelect3, setprivacySelect3] = useState('9999')
  useEffect(() => {
    setuserData({ ...userData, privacy: `${privacySelect1},${privacySelect2},${privacySelect3}` })
  }, [privacySelect1, privacySelect2, privacySelect3])

  // avatar upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [uploadError, setUploadError] = useState('')

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setSelectedFile(file)
    setUploadStatus('idle')
    setUploadError('')
    if (file) {
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleAvatarSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      setUploadError('請先選擇圖片')
      return
    }
    if (!auth?.user?.id) {
      setUploadError('尚未登入，請重新整理頁面')
      return
    }
    setUploadStatus('uploading')
    setUploadError('')
    try {
      const formData = new FormData()
      formData.append('myFile', selectedFile)
      formData.append('name', String(auth.user.id))
      const token = getAccessToken()
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3005'
      const res = await fetch(`${apiBase}/api/user/upload1`, {
        method: 'POST',
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      })
      if (!res.ok) {
        throw new Error(`伺服器回應 ${res.status}`)
      }
      const result = await res.json()
      if (result.status === 'success') {
        setUploadStatus('success')
        setSelectedFile(null)
        // keep previewUrl so the new avatar shows immediately
      } else {
        throw new Error(result.message ?? '上傳失敗')
      }
    } catch (err) {
      setUploadStatus('error')
      setUploadError(err instanceof Error ? err.message : '上傳失敗，請稍後再試')
    }
  }

  // profile form submit
  const mySwal = withReactContent(Swal)

  const postForm = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!auth?.user?.id) return
    try {
      const res = await authFetch(`/api/user/editProfile/${auth.user.id}`, {
        method: 'POST',
        body: JSON.stringify(userData),
      })
      const result = await res.json()
      if (result.status === 'success') {
        mySwal
          .fire({
            position: 'center',
            icon: 'success',
            iconColor: '#1581cc',
            title: '修改成功',
            showConfirmButton: false,
            timer: 1500,
          })
          .then(() => setTimeout(() => {
            router.push('/user/user-info').then(() => window.location.reload())
          }, 1500))
      } else {
        mySwal.fire({ icon: 'error', title: result.message ?? '儲存失敗，請稍後再試' })
      }
    } catch {
      mySwal.fire({ icon: 'error', title: '網路錯誤，請稍後再試' })
    }
  }

  const { showMenu, menuMbToggle, showSidebar, sidebarToggle, setShowSidebar } = useMenuToggle()

  // shared input class
  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400'
  const selectCls = 'border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400'

  return (
    <>
      <Head><title>修改會員資訊</title></Head>
      <Navbar menuMbToggle={menuMbToggle} />

      <div className="container mx-auto px-6 relative">
        <div className={`menu-mb sm:hidden flex flex-col items-center ${showMenu ? 'menu-mb-show' : ''}`}>
          <NavbarMb />
        </div>

        <div className="flex flex-wrap -mx-3">
          {/* sidebar */}
          <div className="sidebar-wrapper hidden sm:block sm:w-1/6 px-6">
            <div className="sidebar">
              <div className="sidebar-user-info">
                <div className="sidebar-user-info-imgBox">
                  <Image src={avatarImage} alt="user avatar" fill priority sizes="(max-width: 150px)" unoptimized />
                </div>
                <div className="sidebar-user-info-text">
                  <div className="sidebar-user-info-name">{LoginUserData.nickname}</div>
                  <div className="sidebar-user-info-band">{LoginUserData.my_jamname}</div>
                </div>
              </div>
              <ul className="flex flex-col">
                <li key={1}><Link href="/user/user-info">會員資訊</Link></li>
                <li key={2}>
                  <Link href={LoginUserData.jamstate == '1' ? `/jam/recruit-list/${LoginUserData.my_jam}` : '/user/user-jam'}>
                    我的樂團
                  </Link>
                </li>
                <li key={3}><Link href="/user/user-order">我的訂單</Link></li>
                <li key={4}><Link href="/user/user-article">我的文章</Link></li>
                <li key={5}><Link href="/user/user-coupon">我的優惠券</Link></li>
              </ul>
            </div>
          </div>

          {/* main */}
          <div className="w-full px-6 sm:w-5/6 page-control">
            {/* mobile sidebar */}
            <div className={`sidebar-mb sm:hidden ${showSidebar ? 'sidebar-mb-show' : ''} ${uStyles.sidebarMbTop}`}>
              <div className="sm-close">
                <IoClose size={32} onClick={() => setShowSidebar(false)} />
              </div>
              <Link href="/user/user-info" className="sm-item active">會員資訊</Link>
              <Link href={LoginUserData.jamstate == '1' ? `/jam/recruit-list/${LoginUserData.my_jam}` : '/user/user-jam'} className="sm-item">
                我的樂團
              </Link>
              <Link href="/user/user-order" className="sm-item">我的訂單</Link>
              <Link href="/user/user-article" className="sm-item">我的文章</Link>
              <Link href="/user/user-coupon" className="sm-item">我的優惠券</Link>
            </div>

            {/* breadcrumb */}
            <div className="top-function-container">
              <div className="breadcrumb-wrapper-ns">
                <ul className="flex items-center p-0 m-0">
                  <IoHome size={20} />
                  <li className={uStyles.bcItem1}>會員中心</li>
                  <FaChevronRight />
                  <li className={uStyles.bcItem2}>編輯資訊</li>
                </ul>
              </div>
              <div className="top-function-flex">
                <div className="search-sidebarBtn">
                  <div className={`flex sm:hidden items-center b-btn b-btn-body ${uStyles.sidebarTrigger}`} role="presentation" onClick={sidebarToggle}>
                    選單
                  </div>
                </div>
              </div>
            </div>

            {/* page content */}
            <main className="edit-page">

              {/* ── avatar card ── */}
              <section className="edit-card">
                <h3 className="section-title">頭像</h3>
                <div className="avatar-section">
                  <div className="avatar-wrap">
                    <Image
                      src={previewUrl ?? avatarImage}
                      alt="avatar preview"
                      fill
                      sizes="100px"
                      unoptimized
                    />
                  </div>
                  <form onSubmit={handleAvatarSubmit} className="avatar-form">
                    <input type="hidden" name="name" value={LoginUserData.id} />
                    <label className="file-label">
                      <IoCamera size={16} />
                      選擇圖片
                      <input
                        type="file"
                        name="myFile"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                    {selectedFile && (
                      <div className="avatar-filename">{selectedFile.name}</div>
                    )}
                    <button
                      type="submit"
                      className={`btn-upload ${uploadStatus === 'uploading' ? 'btn-upload-loading' : ''}`}
                      disabled={uploadStatus === 'uploading'}
                    >
                      {uploadStatus === 'uploading' ? '上傳中…' : '上傳頭像'}
                    </button>
                    {uploadStatus === 'success' && (
                      <span className="upload-msg upload-ok">✓ 上傳成功</span>
                    )}
                    {uploadStatus === 'error' && (
                      <span className="upload-msg upload-err">✗ {uploadError}</span>
                    )}
                  </form>
                </div>
              </section>

              {/* ── basic info ── */}
              <section className="edit-card">
                <h3 className="section-title">基本資料</h3>
                <div className="form-grid">
                  <div className="form-field">
                    <label className="field-label">真實姓名</label>
                    <input
                      type="text"
                      className={inputCls}
                      placeholder="真實姓名"
                      maxLength={14}
                      value={userData.name}
                      onChange={(e) => setuserData({ ...userData, name: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label className="field-label">暱稱</label>
                    <input
                      type="text"
                      className={inputCls}
                      placeholder="暱稱（上限 14 字）"
                      maxLength={14}
                      value={userData.nickname}
                      onChange={(e) => setuserData({ ...userData, nickname: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label className="field-label">性別</label>
                    <select
                      className={selectCls}
                      value={userData.gender}
                      onChange={(e) => setuserData({ ...userData, gender: e.target.value })}
                    >
                      <option value="">請選擇</option>
                      <option value="1">男</option>
                      <option value="2">女</option>
                      <option value="3">其他</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="field-label">生日</label>
                    <input
                      type="date"
                      className={inputCls}
                      value={finalbirthday}
                      onChange={(e) => setuserData({ ...userData, birthday: e.target.value })}
                    />
                  </div>
                </div>
              </section>

              {/* ── music preference ── */}
              <section className="edit-card">
                <h3 className="section-title">音樂偏好</h3>
                <div className="form-field mb-4">
                  <label className="field-label">喜歡曲風（最多三項）</label>
                  <div className="select-row">
                    {([
                      { val: genreSelect1 !== '' ? genreSelect1 : genreLike1, setter: setgenreSelect1, other2: genreLike2, other3: genreLike3, s2: genreSelect2, s3: genreSelect3, set2: setgenreSelect2, set3: setgenreSelect3 },
                      { val: genreSelect2 !== '' ? genreSelect2 : genreLike2, setter: setgenreSelect2, other2: genreLike1, other3: genreLike3, s2: genreSelect1, s3: genreSelect3, set2: setgenreSelect1, set3: setgenreSelect3 },
                      { val: genreSelect3 !== '' ? genreSelect3 : genreLike3, setter: setgenreSelect3, other2: genreLike1, other3: genreLike2, s2: genreSelect1, s3: genreSelect2, set2: setgenreSelect1, set3: setgenreSelect2 },
                    ] as const).map((item, idx) => (
                      <select
                        key={idx}
                        className={selectCls}
                        value={item.val ?? '9999'}
                        onChange={(e) => {
                          item.setter(e.target.value)
                          if (item.s2 === '') item.set2(item.other2 ?? '')
                          if (item.s3 === '') item.set3(item.other3 ?? '')
                        }}
                      >
                        <option value="9999">無</option>
                        {genreData.map((v) => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </select>
                    ))}
                  </div>
                </div>
                <div className="form-field">
                  <label className="field-label">演奏樂器（最多三項）</label>
                  <div className="select-row">
                    {([
                      { val: playSelect1 !== '' ? playSelect1 : playInstrument1, setter: setplaySelect1, other2: playInstrument2, other3: playInstrument3, s2: playSelect2, s3: playSelect3, set2: setplaySelect2, set3: setplaySelect3 },
                      { val: playSelect2 !== '' ? playSelect2 : playInstrument2, setter: setplaySelect2, other2: playInstrument1, other3: playInstrument3, s2: playSelect1, s3: playSelect3, set2: setplaySelect1, set3: setplaySelect3 },
                      { val: playSelect3 !== '' ? playSelect3 : playInstrument3, setter: setplaySelect3, other2: playInstrument1, other3: playInstrument2, s2: playSelect1, s3: playSelect2, set2: setplaySelect1, set3: setplaySelect2 },
                    ] as const).map((item, idx) => (
                      <select
                        key={idx}
                        className={selectCls}
                        value={item.val ?? '9999'}
                        onChange={(e) => {
                          item.setter(e.target.value)
                          if (item.s2 === '') item.set2(item.other2 ?? '')
                          if (item.s3 === '') item.set3(item.other3 ?? '')
                        }}
                      >
                        <option value="9999">無</option>
                        {playerData.map((v) => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </select>
                    ))}
                  </div>
                </div>
              </section>

              {/* ── contact ── */}
              <section className="edit-card">
                <h3 className="section-title">聯絡資訊</h3>
                <div className="form-grid">
                  <div className="form-field">
                    <label className="field-label">手機</label>
                    <input
                      type="tel"
                      className={inputCls}
                      placeholder="電話號碼"
                      maxLength={20}
                      value={userData.phone}
                      onChange={(e) => setuserData({ ...userData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-field mt-4">
                  <label className="field-label">地址</label>
                  <div className="address-row">
                    <input
                      type="text"
                      className={`${inputCls} postcode-input`}
                      placeholder="郵遞區號"
                      maxLength={3}
                      value={userData.postcode}
                      onChange={(e) => setuserData({ ...userData, postcode: e.target.value })}
                    />
                    <select
                      className={selectCls}
                      value={userData.country}
                      onChange={(e) => {
                        setuserData({ ...userData, country: e.target.value })
                        setCountryIndex(e.target.selectedIndex + 1)
                      }}
                    >
                      <option disabled value="">縣市</option>
                      {countries.map((v, i) => (
                        <option key={i} value={v}>{v}</option>
                      ))}
                    </select>
                    <select
                      className={selectCls}
                      value={userData.township}
                      onChange={(e) => setuserData({ ...userData, township: e.target.value })}
                    >
                      <option value="">鄉鎮區</option>
                      {countryIndex === -1
                        ? townData.map((v, i) => <option key={i} value={v}>{v}</option>)
                        : townships[countryIndex - 2]?.map((v, i) => <option key={i} value={v}>{v}</option>)
                      }
                    </select>
                    <input
                      type="text"
                      className={`${inputCls} flex-1`}
                      placeholder="詳細地址"
                      maxLength={100}
                      value={userData.address}
                      onChange={(e) => setuserData({ ...userData, address: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-field mt-4">
                  <label className="field-label">公開資訊設定</label>
                  <p className="field-hint">勾選後該資訊將對其他用戶可見</p>
                  <div className="privacy-row">
                    {[
                      { id: 'privacyBD', label: '生日', defaultChecked: privacyBD === '1', onChange: (checked: boolean) => {
                        setprivacySelect1(checked ? '1' : '0')
                        if (privacySelect2 === '9999') setprivacySelect2(privacyPhone)
                        if (privacySelect3 === '9999') setprivacySelect3(privacyEmail)
                      }},
                      { id: 'privacyPhone', label: '手機', defaultChecked: privacyPhone === '1', onChange: (checked: boolean) => {
                        setprivacySelect2(checked ? '1' : '0')
                        if (privacySelect1 === '9999') setprivacySelect1(privacyBD)
                        if (privacySelect3 === '9999') setprivacySelect3(privacyEmail)
                      }},
                      { id: 'privacyEmail', label: '電子信箱', defaultChecked: privacyEmail === '1', onChange: (checked: boolean) => {
                        setprivacySelect3(checked ? '1' : '0')
                        if (privacySelect1 === '9999') setprivacySelect1(privacyBD)
                        if (privacySelect2 === '9999') setprivacySelect2(privacyPhone)
                      }},
                    ].map((item) => (
                      <label key={item.id} className="privacy-toggle" htmlFor={item.id}>
                        <input
                          type="checkbox"
                          id={item.id}
                          className="privacy-checkbox"
                          defaultChecked={item.defaultChecked}
                          onChange={(e) => item.onChange(e.target.checked)}
                        />
                        <span className="privacy-label-text">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </section>

              {/* ── bio ── */}
              <section className="edit-card">
                <h3 className="section-title">自我介紹</h3>
                <textarea
                  className={`${inputCls} bio-textarea`}
                  placeholder="介紹一下自己吧…"
                  defaultValue={userData.info}
                  onChange={(e) => setuserData({ ...userData, info: e.target.value })}
                />
              </section>

              {/* ── actions ── */}
              <div className="form-actions">
                <Link href="/user/user-info" className="btn-cancel">
                  返回
                </Link>
                <button className="btn-submit" onClick={postForm}>
                  儲存變更
                </button>
              </div>

            </main>
          </div>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        /* sidebar */
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
        .sidebar-user-info-band { margin-bottom: 20px; }

        /* page */
        .edit-page {
          padding: 8px 0 48px;
          max-width: 860px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* card */
        .edit-card {
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

        /* avatar */
        .avatar-section {
          display: flex;
          align-items: center;
          gap: 24px;
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
        .avatar-form {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        :global(.file-label) {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 1.5px solid #b9b9b9;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #555;
          font-family: 'Noto Sans TC';
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
        }
        :global(.file-label:hover) {
          border-color: #0d3652;
          color: #0d3652;
        }
        .avatar-filename {
          font-size: 13px;
          color: #666;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .btn-upload {
          padding: 8px 18px;
          background: #18a1ff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          font-family: 'Noto Sans TC';
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-upload:hover:not(:disabled) { background: #0d8de6; }
        .btn-upload-loading { opacity: 0.7; cursor: not-allowed; }
        .upload-msg {
          font-size: 13px;
          font-weight: 600;
          font-family: 'Noto Sans TC';
        }
        .upload-ok { color: #1a7f45; }
        .upload-err { color: #ec3f3f; }

        /* form grid */
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px 20px;
        }
        .form-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .field-label {
          font-size: 12px;
          font-weight: 700;
          color: #124365;
          font-family: 'Noto Sans TC';
          letter-spacing: 0.03em;
        }
        .field-hint {
          font-size: 12px;
          color: #999;
          margin: 0 0 8px;
          font-family: 'Noto Sans TC';
        }

        /* selects */
        .select-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        /* address */
        .address-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
        }
        .postcode-input {
          width: 80px;
          flex-shrink: 0;
        }

        /* privacy */
        .privacy-row {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
        .privacy-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 8px 16px;
          border: 1.5px solid #e8edf2;
          border-radius: 8px;
          transition: border-color 0.15s;
          font-family: 'Noto Sans TC';
          font-size: 14px;
          color: #333;
          user-select: none;
        }
        .privacy-toggle:hover { border-color: #18a1ff; }
        .privacy-checkbox {
          accent-color: #18a1ff;
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        /* bio */
        .bio-textarea {
          height: 160px;
          resize: vertical;
        }

        /* actions */
        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding-top: 4px;
        }
        .btn-cancel {
          display: inline-flex;
          align-items: center;
          padding: 10px 28px;
          border: 1.5px solid #b9b9b9;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          color: #555;
          font-family: 'Noto Sans TC';
          text-decoration: none;
          transition: border-color 0.15s, color 0.15s;
        }
        .btn-cancel:hover { border-color: #333; color: #333; }
        .btn-submit {
          padding: 10px 32px;
          background: #18a1ff;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          font-family: 'Noto Sans TC';
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-submit:hover { background: #0d8de6; }

        /* RWD */
        @media (max-width: 576px) {
          .edit-card { padding: 16px 16px 20px; }
          .form-grid { grid-template-columns: 1fr; }
          .address-row { flex-direction: column; align-items: stretch; }
          .postcode-input { width: 100%; }
          .select-row { flex-direction: column; }
          .form-actions { justify-content: stretch; }
          .btn-cancel, .btn-submit { flex: 1; justify-content: center; }
        }
      `}</style>
    </>
  )
}
