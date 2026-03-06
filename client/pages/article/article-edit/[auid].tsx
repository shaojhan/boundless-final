import { useEffect, useState } from 'react'
import { apiBaseUrl } from '@/configs'
import { useRouter } from 'next/router'
import { useDetailFetch } from '@/hooks/useDetailFetch'
import { useFormSubmit } from '@/hooks/useFormSubmit'
import Navbar from '@/components/common/navbar'
import NavbarMb from '@/components/common/navbar-mb'
import Footer from '@/components/common/footer'
import Link from 'next/link'
import Image from 'next/image'
// icons
import { IoHome } from 'react-icons/io5'
import { FaChevronRight } from 'react-icons/fa6'
import { Tiptap } from '@/components/article/tiptapEditor'
// import Details from '@/components/article/Details'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { useFilterToggle } from '@/hooks/useFilterToggle'
import { useMenuToggle } from '@/hooks/useMenuToggle'
export default function Auid() {
  // ----------------------手機版本  ----------------------
  // 主選單
  const { showMenu, menuMbToggle } = useMenuToggle()

  // ----------------------跟後端要資料  ----------------------
  //-----------------------動態路由
  //  由router中獲得動態路由(屬性名稱pid，即檔案[pid].js)的值，router.query中會包含pid屬性
  // 1. 執行(呼叫)useRouter，會回傳一個路由器
  // 2. router.isReady(布林值)，true代表本元件已完成水合作用(hydration)，可以取得router.query的值
  const router = useRouter()
  const mySwal = withReactContent(Swal)

  // ----------------------全部資料----------------------
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [articleDetail, setArticleDetail] = useState({} as any)
  const auid = router.isReady ? (router.query.auid as string) : null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawData } = useDetailFetch<any>(
    auid ? `${apiBaseUrl}/article/${auid}` : null,
  )
  useEffect(() => {
    if (!rawData) return
    setArticleDetail(rawData[0])
  }, [rawData])

  // ----------------------Tiptap傳到後端  ----------------------
  const [content, setContent] = useState('')
  const handleDescriptionChange = (newContent) => {
    setContent(newContent)
  }

  // 送出更改
  const { submit: submitForm } = useFormSubmit<{ status: string }>(
    auid ? `${apiBaseUrl}/article/edit/${auid}` : '',
    {
      method: 'PUT',
      onSuccess: (result) => {
        if (result.status === 'success') notifySuccess(auid)
      },
    },
  )
  const sendForm = async (content: string) => {
    const formData = new FormData()
    formData.append('content', content)
    await submitForm(formData)
  }
  // 發起成功後，彈出訊息框，並跳轉到資訊頁面
  const notifySuccess = (auid) => {
    mySwal
      .fire({
        position: 'center',
        icon: 'success',
        iconColor: '#1581cc',
        title: '編輯成功，將為您跳轉回文章',
        showConfirmButton: false,
        timer: 3000,
      })
      .then(() =>
        setTimeout(() => {
          router.push(`/article/article-list/${auid}`)
        }, 3000),
      )
  }

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
          <div className="breadcrumb-wrapper-ns">
            <ul className="flex items-center p-0 m-0">
              <IoHome size={20} />
              <li style={{ marginLeft: '8px' }}>樂友論壇</li>
              <FaChevronRight />
              <Link href="/article/article-list">
                <li style={{ marginLeft: '10px' }}>文章資訊</li>
              </Link>
              <FaChevronRight />
              <Link href="/article/article-list">
                <li style={{ marginLeft: '10px' }}>文章內文</li>
              </Link>
            </ul>
          </div>
          <div className="">
            {/* 主內容 */}
            <main className="content">
              <h1 className="text-center">{articleDetail.title}</h1>
              <div className="">
                <Tiptap
                  setDescription={handleDescriptionChange}
                  initialContent={articleDetail.content}
                />
              </div>
              <div className="main-img">
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3005'}/article/${articleDetail.img}`}
                  alt=""
                  className="big-pic object-contain w-full"
                  fill
                />
              </div>
              <div className="article-label flex pt-6 pl-6">
                <div className="bg-dark text-gray-100 pt-1 pb-1 pl-2 pr-2 mr-6">
                  標籤
                </div>
                <div className="pt-1 pb-1 pl-2 pr-2">
                  {articleDetail.category_name}
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="page-button flex justify-between pt-12 pb-6">
          <Link href={`/article/article-list/${auid}`} className="btn">
            上一步
          </Link>
          <button
            onClick={() => {
              sendForm(content)
            }}
            type="button"
            className="inline-flex items-center justify-center px-4 py-2 rounded font-medium cursor-pointer transition-colors bg-primary text-white hover:bg-deep-primary"
          >
            確認更新
          </button>
        </div>
      </div>
      <Footer />

      <style jsx>{`
        .wrapper {
          padding-left: 20px;
          padding-right: 20px;
        }
        .nav-category {
          display: flex;
          justify-content: between;
        }
        @media screen and (max-width: 576px) {
          .nav-category {
            display: none;
          }
        }
        main {
          padding-left: 55px;
          padding-right: 55px;
          @media screen and (max-width: 576px) {
            padding-inline: 10px;
            padding-top: 0;
          }
        }
        h1 {
          padding-top: 5;
        }
        @media screen and (max-width: 576px) {
          h1 {
            padding-top: 0;
          }
        }
        .breadcrumb-wrapper {
          margin-top: 50px;
          margin-left: 50px;
        }
        @media screen and (max-width: 576px) {
          .breadcrumb-wrapper {
            margin-top: 30px;
            margin-left: 10px;
          }
        }
        .main-img {
          position: relative;
          weight: 1000px;
          height: 500px;
          margin-top: 10px;
        }
        .big-pic {
          position: absolute;
          top: 0;
          left: 0;
        }
        @media screen and (max-width: 576px) {
          .main-img {
            weight: 576px;
            height: 300px;
          }
        }
      `}</style>
    </>
  )
}
