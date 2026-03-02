import React from 'react'
import LessonConfirm from '@/pages/cart/confirm-lesson-items.module.scss'
import { formatPrice } from '@/lib/utils/formatPrice'

export default function ConfirmLessonItems({ lessonData }) {
  return (
    <>
      {lessonData.map((v) => {
        return (
          <div className={`${LessonConfirm.lesson_item}`}>
            <div className={`${LessonConfirm.lesson_item_name} h6`}>
              {v.name}
            </div>
            <div className={`${LessonConfirm.lesson_item_price} h6`}>
              ${formatPrice(v.price)}
            </div>
            <div className={`${LessonConfirm.lesson_item_payment} h6`}>
              ${formatPrice(v.price)}
            </div>
          </div>
        )
      })}
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
