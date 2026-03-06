import React from 'react'
import Instrument from '@/pages/cart/instrument-item.module.scss'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils/formatPrice'

//react icons
import { FaPlus } from 'react-icons/fa'
import { FaMinus } from 'react-icons/fa'
import { FaTrash } from 'react-icons/fa6'

import InstrumentCategory from '@/data/cart/instrument_category.json'

export default function InstrumentList({
  items,
  instrumentData,
  increment_cart,
  decrement_cart,
  remove,
}) {
  const instruments = items.filter((v) => {
    return v.type == 1
  })

  const categoryName = instruments.map((item) => {
    const findCategoryName = InstrumentCategory.find((v) => {
      return v.id === item.instrument_category_id
    }).name
    return findCategoryName
  })

  return (
    <>
      <div className={`${Instrument.cartItemGroup}`}>
        {instrumentData.map((v, i) => {
          return (
            <div className={`${Instrument.instrumentItem}`} key={v.id}>
              <div className={`${Instrument.instrument_item_pic}`}>
                <Image
                  className={`${Instrument.instrument_item_pic_div}`}
                  src={`/instrument/${categoryName[i]}/small/${v.img_small}`}
                  alt={v.name}
                  sizes="100vw"
                  priority={false}
                  fill
                />
              </div>
              <div className={`${Instrument.instrument_item_name} h6`}>
                {v.name}
              </div>
              <div className={`${Instrument.instrument_item_price} h6`}>
                ${formatPrice(v.price)}
              </div>
              <div className={`${Instrument.instrument_item_quantity} h6`}>
                <div className="flex">
                  <button
                    className={`${Instrument.quantity_left_minus} inline-flex items-center justify-center rounded cursor-pointer bg-gray-100 text-dark hover:bg-gray-200`}
                    onClick={() => {
                      if (v.qty === 1) {
                        remove(items, v.id)
                      } else {
                        decrement_cart(items, v.id)
                      }
                    }}
                  >
                    <FaMinus />
                  </button>
                  <input
                    type="text"
                    className={`${Instrument.input_number} w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
                    id="quantity"
                    name="quantity"
                    defaultValue={1}
                    value={v.qty}
                    min={1}
                    max={100}
                  />
                  <button
                    className={`${Instrument.quantity_right_plus} inline-flex items-center justify-center rounded cursor-pointer bg-primary text-white hover:bg-deep-primary`}
                    onClick={() => {
                      increment_cart(items, v.id)
                    }}
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>
              <div className={`${Instrument.instrument_item_total} h6`}>
                ${formatPrice(v.price * v.qty)}
              </div>
              <div className={`${Instrument.instrument_button}`}>
                <button
                  type="button"
                  className={`${Instrument.delete_btn} inline-flex items-center justify-center rounded cursor-pointer transition-colors select-none`}
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
