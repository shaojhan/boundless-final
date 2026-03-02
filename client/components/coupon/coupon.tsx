import React from 'react'
import styles from '@/components/coupon/coupon.module.scss'

export default function Coupon({
  id: _id,
  name,
  type,
  kind,
  discount,
  valid,
  limit_time,
  created_time: _created_time,
  className: _className,
}: {
  id?: number
  name?: string
  type?: number
  kind?: number
  discount?: number
  valid?: number | boolean
  limit_time?: string
  created_time?: string
  className?: string
}) {
  return (
    <>
      <div className={`${styles.couponCard} card mb-6 mx-1`}>
        <div className="flex">
          {/* 左 */}
          <div className="w-1/4">
            <img
              className={`${styles.couponImg} my-6 p-2`}
              src={`/coupon/${valid ? 'logoWhite.jpg' : 'logoValid.jpg'}`}
              alt="..."
            />
          </div>
          <div className="w-3/4">
            <div className="mx-2 p-4 flex justify-between">
              <div>
                <div className="text-lg p-1 font-bold card-title">{name}</div>
                <div className="text-2xl px-4 py-2">
                  {kind === 2 ? '課程' : '樂器'}
                </div>
              </div>
              <div className="flex justify-center items-center">
                <div className="text-2xl font-bold salesType">
                  {type === 1 ? discount : IsINT(discount * 10) + '折'}
                </div>
              </div>
            </div>
            {/* 下 */}
            <div>
              <p className="px-4 py-1">
                <small className="text-gray-400">到期日{limit_time}</small>
              </p>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{``}</style>
    </>
  )
}
const IsINT = function (int) {
  if (int % 10 === 0) {
    return int / 10
  } else {
    return int
  }
}
