import { apiBaseUrl } from '@/configs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '@/components/common/navbar'
import NavbarMb from '@/components/common/navbar-mb'
import Footer from '@/components/common/footer'
import Link from 'next/link'
import { IoHome } from 'react-icons/io5'
import { FaChevronRight } from 'react-icons/fa6'
import { IoCloseOutline } from 'react-icons/io5'
import { debounce } from 'lodash'
// sweetalert
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
//data
// tiptap
import { Tiptap } from '@/components/article/tiptapEditor'
// 會員認證hook
import { useAuth } from '@/hooks/user/use-auth'
import { useFilterToggle } from '@/hooks/useFilterToggle'
import { useMenuToggle } from '@/hooks/useMenuToggle'

export default function Publish() {
  const mySwal = withReactContent(Swal)
  // ----------------------表單  ----------------------

  // ----------------------會員登入狀態 & 會員資料獲取  ----------------------
  //從hook 獲得使用者登入的資訊  儲存在變數LoginUserData裡面
  const { LoginUserData } = useAuth()
  //登出功能

  // 舊版會警告 因為先渲染但沒路徑 bad
  // const avatarImage = `/user/${LoginUserData.img}`
  // const avatargoogle = `${LoginUserData.photo_url}`
  // const avatarDefault = `/user/avatar_userDefault.jpg`

  // ----------------------會員登入狀態  ----------------------

  // ---------------------- 標題 ----------------------
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [titleCheck, setTitleCheck] = useState(true)
  const [img, _setImg] = useState('') // 照片預覽
  // ----------------------Tiptap  ----------------------
  const [content, setContent] = useState('')
  const handleDescriptionChange = (newContent) => {
    setContent(newContent)
  }

  // ---------------------- 圖片上傳 ----------------------
  const [file, setFile] = useState(null)
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFile(file)
    } else {
      setFile(null)
    }
  }

  // 文章分類
  const [category_id, setCategory] = useState('1')

  // ---------------------- 文章摘要 ----------------------
  const [descriptionCheck, setDescriptionCheck] = useState(true)
  // 表單完成狀態 0: 有欄位尚未填寫或不符規定, 1: 填寫完成, 2: 填寫中
  const [complete, setComplete] = useState(2)
  // 檢查不雅字詞
  const checkBadWords = debounce(() => {
    const badWords = /幹|屎|尿|屁|糞|靠北|靠腰|雞掰|王八|你媽|妳媽|淫/g
    setTitleCheck(title.search(badWords) < 0 ? true : false)
    setDescriptionCheck(content.search(badWords) < 0 ? true : false)
    // 檢查 主旨/條件/描述
  }, 250)
  // 檢查表單是否填妥
  const checkComplete = () => {
    if (titleCheck === false || title === '') {
      setComplete(0)
      return false
    }
    if (category_id === '') {
      setComplete(0)
      return false
    }
    if (descriptionCheck === false || content === '') {
      setComplete(0)
      return false
    }
    setComplete(1)
    return true
  }

  // 表單送出
  const sendForm = async (title, category_id, content, file, user_id) => {
    if (!checkComplete()) {
      return false
    }
    let formData = new FormData()
    formData.append('title', title)
    formData.append('category_id', category_id)
    formData.append('content', content)
    formData.append('myFile', file)
    formData.append('user_id', user_id)

    const res = await fetch(`${apiBaseUrl}/article/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })
    const result = await res.json()
    if (result.status === 'success') {
      notifySuccess(result.auid)
    }
  }
  // 發起成功後，彈出訊息框，並跳轉到資訊頁面
  const notifySuccess = (auid) => {
    mySwal
      .fire({
        position: 'center',
        icon: 'success',
        iconColor: '#1581cc',
        title: '發布成功，將為您跳轉到文章',
        showConfirmButton: false,
        timer: 3000,
      })
      .then(() =>
        setTimeout(() => {
          router.push(`/article/article-list/${auid}`)
        }, 3000),
      )
  }
  // ---------------------- 偵測表單輸入變化，並執行檢查
  useEffect(() => {
    // 跳出未填寫完畢警告後再次輸入，消除警告
    setComplete(2)
    // 檢查不雅字詞
    checkBadWords.cancel() // 取消上一次的延遲
    checkBadWords()
  }, [title, category_id, content, img])

  // ----------------------手機版本  ----------------------
  // 主選單
  const { showMenu, menuMbToggle } = useMenuToggle()

  // ----------------------假資料  ----------------------

  useFilterToggle()

  return (
    <>
      <Navbar menuMbToggle={menuMbToggle} />
      <div className="container mx-auto px-6 relative">
        {/* 手機版主選單/navbar */}
        <div
          className={`menu-mb sm:hidden flex flex-col items-center ${showMenu ? 'menu-mb-show' : ''}`}
        >
          <NavbarMb />
        </div>
        <div className="flex flex-wrap -mx-3">
          {/* 麵包屑 */}
          <div className="breadcrumb-wrapper-ns w-full">
            <ul className="flex items-center p-0 m-0">
              <IoHome size={20} />
              <li style={{ marginLeft: '8px' }}>樂友論壇</li>
              <FaChevronRight />
              <Link href="/article/article-list">
                <li style={{ marginLeft: '10px' }}>文章資訊</li>
              </Link>
              <FaChevronRight />
              <li style={{ marginLeft: '10px' }}>文章發布</li>
            </ul>
          </div>
          <div className="w-full">
            {/* 主內容 */}
            {/* Close button */}
            <div className="flex justify-end py-4">
              <Link
                href={`/article/article-list`}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <IoCloseOutline size={36} />
              </Link>
            </div>
            {/* setting title */}
            <div className="set-rwd py-6 items-start">
              <div className="rwd-title">
                <h3>自訂文章標題</h3>
              </div>
              <div className="rwd-content">
                <p className="text-secondary text-sm mb-3">
                  上限15個字，系統已經先擷取，你也可以自行修改標題。(
                  {title.length}/15)
                </p>
                <textarea
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  id="exampleFormControlTextarea1"
                  rows={3}
                  onChange={(e) => {
                    setTitle(e.target.value)
                  }}
                  placeholder="輸入文章標題..."
                  maxLength={15}
                  defaultValue={''}
                />
                {titleCheck ? null : (
                  <div className="bad-words mt-1">偵測到不雅字詞</div>
                )}
              </div>
            </div>
            <hr />
            {/* TipTap — full-width section */}
            <div className="py-6">
              <h3 className="mb-4">自訂文章內文</h3>
              <Tiptap
                setDescription={handleDescriptionChange}
                initialContent=""
              />
              {descriptionCheck ? null : (
                <div className="bad-words mt-1">偵測到不雅字詞</div>
              )}
            </div>
            <hr />
            {/* setting category */}
            <div className="set-rwd py-6 items-center">
              <div className="rwd-title">
                <h3>設定文章分類</h3>
              </div>
              <div className="rwd-content">
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                  aria-label="Default select example"
                  onChange={(e) => {
                    setCategory(e.target.value)
                  }}
                  value={category_id}
                >
                  <option value="1">樂評</option>
                  <option value="2">技術</option>
                </select>
              </div>
            </div>
            <hr />
            {/* setting img */}
            <div className="set-rwd py-6 items-start">
              <div className="rwd-title">
                <h3>自訂文章縮圖</h3>
              </div>
              <div className="rwd-content">
                <p className="text-secondary text-sm mb-3">
                  選擇或上傳照片作為文章縮圖(同時也是社群分享文章連結時的縮圖)。
                </p>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  type="file"
                  name="myFile"
                  id="myFile"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <p className="text-secondary text-sm mt-3">
                  建議尺寸: 寬1200 x 高630 像素的等比例圖片 <br />
                  大小限制: 5 MB &nbsp;|&nbsp; 格式限制: jpeg(jpg)、PNG、GIF
                </p>
              </div>
            </div>
            {/* pagination */}
            <div className="flex justify-between pt-8 pb-6">
              <Link
                href={`/article/article-list`}
                className="inline-flex items-center justify-center px-4 py-2 rounded font-medium cursor-pointer border border-gray-400 text-gray-600 hover:bg-gray-100"
              >
                上一步
              </Link>
              <button
                onClick={() => {
                  sendForm(title, category_id, content, file, LoginUserData.id)
                }}
                type="button"
                className="inline-flex items-center justify-center px-4 py-2 rounded font-medium cursor-pointer transition-colors bg-primary text-white hover:bg-deep-primary"
              >
                確認更新
              </button>
            </div>
          </div>
          {complete === 0 ? (
            <div
              className="flex bad-words justify-center"
              style={{ marginTop: '-8px' }}
            >
              <div>請遵照規則，並填寫所有必填內容</div>
            </div>
          ) : (
            ''
          )}
        </div>
      </div>
      <Footer />

      <style jsx>{`
        .wrapper {
          min-height: calc(100vh);
          padding: 0 35px;
        }
        .set-content button {
          background-color: white;
          color: var(--secondary);
          font-weight: 500;
          border-color: var(--secondary);
          border-width: 2px;
        }
        /* set-content,set-img, set-tag */
        .set-rwd {
          display: flex;
          flex-direction: row;
          gap: 24px;
        }
        .rwd-title {
          width: 30%;
          flex-shrink: 0;
          padding-top: 4px;
        }
        .rwd-content {
          flex: 1;
        }
        .bad-words {
          color: red;
          font-size: 0.875rem;
        }
        @media screen and (max-width: 576px) {
          .set-rwd {
            flex-direction: column;
            gap: 8px;
          }
          .rwd-title {
            width: 100%;
          }
        }
      `}</style>
    </>
  )
}
