import Link from 'next/link'
import { formatPrice } from '@/lib/utils/formatPrice'

export default function CourseCard({
  lesson_category_id,
  luid,
  name,
  average_rating,
  review_count,
  price,
  teacher_name,
  img_small,
  img: _img,
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
  img_small?: string
  img?: string
  length?: number
  sales?: number
  discount?: number
  id?: number
}) {
  const priceStr = formatPrice(price)
  return (
    <>
      <Link href={`/lesson/${lesson_category_id}/${luid}`}>
        <div className="course-container">
          <div className="course-image-container">
            <img
              className="course-image"
              loading="lazy"
              src={`/課程與師資/lesson_small/${img_small}`}
              alt="/課程與師資/lesson_small/${img_small}"
            />
          </div>
          <div className="course-details">
            <h2 className="course-title">{name}</h2>
            <p className="course-instructor">by {teacher_name}老師</p>
            <div className="course-meta">
              <div className="rating">
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/b8287886cc0f8e59d93376690dc57f4af99a9e899badb88e0d2ed47fdb08d035?apiKey=8130f93a2c9b4a89bbf1aefc4624aa21&"
                  alt="評分"
                  className="rating-image"
                />
                <span className="rating-value">{average_rating}</span>
                <span className="rating-count">({review_count})</span>
              </div>
              <div className="course-duration">
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/65fa44297b430826617ac8cc6a4cf7e2cf251e32574954239a3cb8b5c74c8ca0?apiKey=8130f93a2c9b4a89bbf1aefc4624aa21&"
                  alt="時長"
                  className="duration-image"
                />
                <span className="duration"> {length}小時</span>
              </div>
              <div className="course-lessons">
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/7edc804c22425366cdf141d0bbb568563dd1e41c3e6dcb24b9c75c37810df947?apiKey=8130f93a2c9b4a89bbf1aefc4624aa21&"
                  alt="課時數"
                  className="lessons-image"
                />
                <span className="lessons">{sales}</span>
              </div>
            </div>
            <div className="course-price-container">
              <span className="course-price">NT$ {priceStr}</span>
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/f63b958d31f22ceac9729085dc4ee70e1cc6d5a2dab24fdc0543dd3b1c72eac0?apiKey=8130f93a2c9b4a89bbf1aefc4624aa21&"
                alt="加入購物車"
                className="cart-image"
              />
            </div>
          </div>
        </div>
        <style jsx>{`
          .course-container {
            background-color: #fff;
            display: flex;
            gap: 8px;
            font-size: 13px;
            font-weight: 400;
            padding: 10px 6px;
            align-items: center;
            width: 390px;
            height: 147px;
            border-bottom: 1px solid #b9b9b9;
          }
          .course-image-container {
            object-fit: hidden;
            width: 120px;
            height: 120px;
            border-radius: 5px;
          }
          .course-image {
            width: 120px;
            height: 120px;
            object-fit: hidden;
            margin: auto 0;
            flex: 1 0 0;
            align-self: stretch;
          }
          .course-details {
            display: flex;
            flex-grow: 1;
            flex-direction: column;
          }
          .course-title {
            color: var(--dark, #1d1d1d);
            font-family:
              Noto Sans TC,
              sans-serif;
            font-size: 16px;
            margin: 0;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
          .course-instructor {
            color: var(--secondary, #5a5a5a);
            margin-top: 6px;
          }
          .course-meta {
            display: flex;
            margin-top: 6px;
            gap: 12px;
            white-space: nowrap;
          }
          .rating,
          .course-duration,
          .course-lessons {
            display: flex;
            gap: 5px;
            align-items: center;
          }
          .rating-value,
          .rating-count {
            color: var(--yellow, #faad14);
          }
          .duration,
          .lessons {
            color: var(--secondary, #5a5a5a);
          }
          .course-price-container {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            align-items: center;
            margin-top: 6px;
          }
          .course-price {
            color: var(--dark, #1d1d1d);
            font-weight: 700;
            font-size: 18px;
          }
        `}</style>
      </Link>
    </>
  )
}
