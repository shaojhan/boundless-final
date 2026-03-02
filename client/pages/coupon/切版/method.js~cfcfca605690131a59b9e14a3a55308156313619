import React, { useState } from 'react'
// import couponsData from '@/data/coupon.json'

function CouponList() {
  const [coupons, setCoupons] = useState(couponsData)
  const [selectedKind, setSelectedKind] = useState('全部')

  // 根據類別篩選產品
  const filterCoupons = (kind) => {
    if (kind === '全部') {
      setCoupons(couponsData)
    } else {
      const filteredCoupons = couponsData.filter(
        (coupon) => coupon.kind === kind
      )
      setCoupons(filteredCoupons)
    }
    setSelectedKind(kind)
  }

  return (
    <div>
      {/* 分類選擇器 */}
      <div>
        <button onClick={() => filterCoupons('全部')}>全部</button>
        <button onClick={() => filterCoupons('樂器')}>樂器</button>
        <button onClick={() => filterCoupons('課程')}>課程</button>
      </div>

      {/* 商品列表 */}
      <ul>
        {coupons.map((coupon) => (
          <li key={coupon.id}>
            <div>Name: {coupon.name}</div>
            <div>Discount: {coupon.discount}</div>
            <div>Kind: {coupon.kind}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default CouponList
