import React from 'react'
import InstrumentConfirm from '@/pages/cart/confirm-instrument-items.module.scss'
import { formatPrice } from '@/lib/utils/formatPrice'

export default function ConfirmInstrumentItems({ instrumentData }) {
  return (
    <>
      {instrumentData.map((v) => {
        return (
          <div className={`${InstrumentConfirm.instrument_item}`}>
            <div className={`${InstrumentConfirm.instrument_item_name} h6`}>
              {v.name}
            </div>
            <div className={`${InstrumentConfirm.instrument_item_price} h6`}>
              ${formatPrice(v.price)}
            </div>
            <div className={`${InstrumentConfirm.instrument_item_quantity} h6`}>
              {v.qty}
            </div>
            <div className={`${InstrumentConfirm.instrument_item_total} h6`}>
              ${formatPrice(v.price * v.qty)}
            </div>
            <div className={`${InstrumentConfirm.instrument_item_payment} h6`}>
              ${formatPrice(v.price * v.qty)}
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
