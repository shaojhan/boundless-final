import Link from 'next/link'
import Image from 'next/image'
import { FaStar } from 'react-icons/fa'
import { GoClock } from 'react-icons/go'
import { MdOutlinePeopleAlt } from 'react-icons/md'
import { formatPrice } from '@/lib/utils/formatPrice'

export default function CourseCard({
  lesson_category_id,
  luid,
  name,
  average_rating,
  review_count,
  price,
  teacher_name,
  img,
  img_small: _img_small,
  length,
  sales,
  discount: _discount,
  id: _id,
}: {
  lesson_category_id?: number
  luid?: string
  name?: string
  average_rating?: number
  review_count?: number
  price?: number
  teacher_name?: string
  img?: string
  img_small?: string
  length?: number
  sales?: number
  discount?: number
  id?: number
}) {
  const priceStr = formatPrice(price)
  return (
    <>
      <Link href={`/lesson/${lesson_category_id}/${luid}`}>
        <article className="course-card">
          <div className="course-image-wrapper">
            <Image
              className="course-image"
              loading="lazy"
              src={`/課程與師資/lesson_img/${img}`}
              alt="Course Preview"
              fill
            />
            {/* <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/f63b958d31f22ceac9729085dc4ee70e1cc6d5a2dab24fdc0543dd3b1c72eac0?apiKey=8130f93a2c9b4a89bbf1aefc4624aa21&"
              alt=""
              className="icon-image"
            /> */}
          </div>

          <section className="course-details">
            <h3 className="course-title mb-1">{name}</h3>
            <p className="course-instructor">by {teacher_name} 老師</p>
            <div className="course-info">
              <div className="rating">
                <FaStar size={18} color="#faad14" />
                <span className="rating-value">{average_rating}</span>
                <span className="review-count">({review_count})</span>
              </div>
              <div>
                <span className="duration-time">
                  <GoClock size={16} color="#5a5a5a" />
                  {length}小時
                </span>
              </div>
            </div>
            {/* {isDiscount ? (
              <div className="course-price">
                <del>NT$ 4,000</del>
                <div style={{ color: '#ec3f3f' }}>{discount}NT$ 3,800</div>
              </div>
            ) : (
              <div className="course-price">
                <div>NT$ {price}4,000</div>
              </div>
            )} */}
            <div className="course-price">
              <div>NT$ {priceStr}</div>
            </div>
            <div className="students">
              <MdOutlinePeopleAlt size={16} color="#5a5a5a" />
              <span>{sales}</span>
            </div>
          </section>
        </article>
        <style jsx>{`
          .course-card {
            width: 240px;
            min-height: 403px;
            border-radius: 5px;
            border: 1px solid #b9b9b9;
            background-color: #fff;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
          .course-image-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            overflow: hidden;
            position: relative;
            aspect-ratio: 1.33;
            width: 100%;
            height: 166px; /*設定希望高度 */
          }
          .course-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
          }
          .icon-image {
            position: absolute;
            width: 20px;
            bottom: 12px;
            right: 12px;
          }
          .course-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .rating {
            display: flex;
            align-items: center;
            gap: 5px;
          }

          .course-details {
            display: flex;
            flex-direction: column;
            gap: 6px;
            flex: 1;
            color: #1d1d1d;
            font-weight: 400;
            padding: 14px 12px;
          }
          .course-title {
            font-size: 16px;
            font-family: Noto Sans TC, sans-serif;
            margin: 0;
            line-height: 1.35;
            min-height: 44px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .course-instructor {
            font-size: 14px;
            color: #5a5a5a;
            margin-bottom: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .duration-time {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 14px;
          }
          .students {
            display: flex;
            align-items: center;
            justify-content: end;
            gap: 5px;
            font-size: 14px;
            margin-top: auto;
          }

          .course-price {
            font-size: 18px;
            font-family: Noto Sans TC, sans-serif;
            font-weight: 700;
            min-height: 36px;
          }
          .enrolled-students {
            text-align: right;
            color: #5a5a5a;
            font-size: 14px;
            font-family: Noto Sans TC, sans-serif;
             {
              /* margin-top: 46px; */
            }
          }
          /* Add your existing styles here */
        `}</style>
      </Link>
    </>
  )
}
