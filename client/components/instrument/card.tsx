import React from 'react'
import Link from 'next/link'
import { FaHeart } from 'react-icons/fa'
import { formatPrice } from '@/lib/utils/formatPrice'

export default function InstrumentCard({
  id: _id,
  puid,
  name,
  price,
  discount: _discount,
  category_name,
  img_small,
  sales,
}: {
  id?: number
  puid?: string
  name?: string
  price?: number
  discount?: number
  category_name?: string
  img_small?: string
  sales?: number
}) {
  //   const categoryName = category.find((v, i) => {
  //     return categoryID === v.id
  //   })
  //   //   'categoryName.name:',
  //   //   categoryName ? categoryName.name : 'Category not found'
  //   // )
  const toLocalePrice = formatPrice(price)
  return (
    <>
      <Link href={`/instrument/${category_name}/${puid}`}>
        <div className="product-card">
          <FaHeart
            size={24}
            style={{
              position: 'absolute',
              zIndex: '30',
              color: '#b9b9b9',
              right: '14px',
              top: '8px',
            }}
          />
          <div style={{ padding: '10px', width: '100%' }}>
            <div className="product-image-wrapper">
              <img
                src={`/instrument/${category_name}/small/${img_small}`}
                alt={name}
                className="product-image"
              />
            </div>
          </div>

          <div className="product-details">
            <h3 className="product-title">{name}</h3>
            <p className="product-price">NT${toLocalePrice}</p>
            <p className="product-sold">已售出 {sales}</p>
          </div>
        </div>
        <style jsx>{`
          .product-card {
            max-width: 240px;
            width: 240px;
            min-height: 350px; /* 保證卡片高度和內容一致 */
            border-radius: 5px;
            border: 1px solid #b9b9b9;
            background-color: #fff;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            position: relative;
            @media screen and (max-width: 576px) {
              width: 190px;
            }
          }
          .product-image-wrapper {
            display: flex;
            justify-content: center;
            overflow: hidden;
            position: relative;
            height: 160px;
            width: 100%;
             {
              /* width: 100%; */
            }
          }
          .product-image {
            width: 100%;
            height: 100%; /* 保證圖片填充整個容器 */
            object-fit: contain;
            object-position: center;
          }
          .icon-image {
            position: absolute;
            width: 20px;
            bottom: 12px;
            right: 12px;
          }
          .product-details {
            display: flex;
            flex-direction: column;
            gap: 6px;
            flex: 1;
            color: #1d1d1d;
            font-weight: 400;
            padding: 14px 12px;
          }
          .product-title {
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
          .product-price {
            font-size: 18px;
            font-family: Noto Sans TC, sans-serif;
            font-weight: 700;
            min-height: 36px;
          }
          .product-sold {
            color: #5a5a5a;
            text-align: right;
            font-size: 14px;
            font-family: Noto Sans TC, sans-serif;
            margin-top: auto;
             {
              /* margin-top: 46px; */
            }
          }
          .products-container {
            flex: 0 0 50%;
          }
        `}</style>
      </Link>
    </>
  )
}

// Usage of ProductCard component with hypothetical data
// function ProductsContainer() {
//   const products = [
//     {
//       productName: 'Fender Telecaster model 1970',
//       productPrice: 'NT$ 22,680',
//       productSold: 10,
//       productImage: 'path/to/telecaster.jpg',
//       iconImage: 'path/to/icon.jpg',
//     },
//     // Add more products as needed
//   ]

//   return (
//     <section className="products-container">
//       {products.map((product, index) => (
//         <InstrumentCard
//           key={index}
//           productName={product.productName}
//           productPrice={product.productPrice}
//           productSold={product.productSold}
//           productImage={product.productImage}
//           iconImage={product.iconImage}
//         />
//       ))}
//     </section>
//   )
// }
