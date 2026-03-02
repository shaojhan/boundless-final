import React from 'react'
import Lesson from '@/pages/cart/lesson-item.module.scss'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils/formatPrice'

//react icons
import { FaTrash } from 'react-icons/fa6'

export default function LessonList({ items, lessonData, remove }) {
  return (
    <>
      <div className={`${Lesson.cartItemGroup}`}>
        {lessonData.map((v) => {
          return (
            <div className={`${Lesson.lessonItem}`} key={v.id}>
              <div className={`${Lesson.lesson_item_pic}`}>
                <Image
                  className={`${Lesson.lesson_item_pic_div}`}
                  src={`/課程與師資/lesson_img/${v.img}`}
                  alt={v.name}
                  sizes="100vw"
                  priority={false}
                  fill
                />
              </div>
              <div className={`${Lesson.lesson_item_name} h6`}>{v.name}</div>
              <div className={`${Lesson.lesson_item_price} h6`}>
                ${formatPrice(v.price)}
              </div>
              <div className={`${Lesson.lesson_button} h6`}>
                <button
                  type="button"
                  className={`${Lesson.delete_btn} btn`}
                  onClick={() => {
                    remove(items, v.id)
                  }}
                >
                  <div>
                    <FaTrash />
                  </div>
                  <div>刪除</div>
                </button>
              </div>
            </div>
          )
        })}
      </div>
      <style jsx>{`
        .h6 {
          font-family: 'Noto Sans TC';
          font-size: 18px;
          font-style: normal;
          font-weight: 400;
          line-height: normal;
        }
      `}</style>
    </>
  )
}
