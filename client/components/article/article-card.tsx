import bookmarkIconFill from '@/assets/fillbookmark.svg'
import bookmarkIcon from '@/assets/emptybookmark.svg'
import { FaBookmark } from 'react-icons/fa'
import Image from 'next/image'
import Link from 'next/link'
import Datetime from '@/components/article/datetime'

export default function Articlecard({
  id,
  auid,
  title,
  user_id: _user_id,
  content,
  img,
  published_time,
  fav,
  handleToggleFav,
  category_name,
  comment_likes,
  article_author_name,
  article_author_img,
  author: _author,
  articles: _articles,
}: {
  id?: number
  auid?: string | number
  title?: string
  user_id?: number
  content?: string
  img?: string
  published_time?: string
  fav?: boolean
  handleToggleFav?: (id: number) => void
  category_name?: string
  comment_likes?: number
  article_author_name?: string
  article_author_img?: string
  author?: unknown
  articles?: unknown
}) {
  return (
    <>
      <div className="article-card">
        {/* info區塊 */}
        <div className="article-info flex justify-between items-center mb-6">
          <img
            className="article-author"
            src={`${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3005'}/user/${article_author_img}`}
            alt="空的圖"
          />
          <span className="info-p text-secondary">{article_author_name}</span>
          <span className="info-p text-secondary">
            <Datetime published_time={published_time} />
          </span>
        </div>
        {/* article區塊 */}
        <Link href={`/article/article-list/${auid}`}>
          <div className="content flex">
            <div className="text mr-1">
              <h5 className="font-bold clamped-text">{title}</h5>
              <p className="text-secondary">{content}</p>
            </div>
            <img
              className="article-image"
              src={`${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3005'}/article/${img}`}
              alt=""
            />
          </div>
        </Link>
        {/* views-like */}
        <div className="views-like">
          <div className="saves flex items-center">
            <FaBookmark />
            <span className="text-secondary text-center ml-1">
              {comment_likes}
            </span>
          </div>
        </div>
        {/* kind-bookmark */}
        <div className="kind-bookmark flex justify-between items-center">
          <div className="article-kind text-black bg-body px-2 pt-1 pb-1">
            {category_name}
          </div>
          <div className="bookmark">
            <Image
              src={fav ? bookmarkIconFill : bookmarkIcon}
              alt=""
              width={25}
              height={25}
              onClick={() => {
                handleToggleFav(id)
              }}
            />
          </div>
        </div>
      </div>
      <style jsx>{`
        .article-card {
          width: 525px;
          height: 238px;
           {
            /* background-color: rgb(239, 184, 184); */
          }
          padding: 10px;
        }
        @media screen and (max-width: 576px) {
          .article-card {
            width: 100%;
            height: 100px;
            padding-bottom: 250px;
          }
        }
        .article-info {
          width: 250px;
        }
        .article-author {
          width: 30px;
          height: 30px;
          border-radius: 50%;
        }
        .clamped-text {
          display: -webkit-box;
          -webkit-box-orient: vertical;
          overflow: hidden;
          -webkit-line-clamp: 2;
        }
        .info-p {
          font-family: 'Noto Sans TC', sans-serif;
        }
        .text {
          width: 339px;
          height: 112px;
        }
        .text p {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
        .article-image {
          width: 162px;
          height: 102px;
          border-radius: 5%;
          object-fit: cover;
        }
        @media screen and (max-width: 576px) {
          .article-img {
            width: 30px;
          }
        }
        .views-like p {
          font-size: small;
        }
        .bookmark {
          width: 50px;
        }
      `}</style>
    </>
  )
}
