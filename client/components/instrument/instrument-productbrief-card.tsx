import React from 'react'
import { FavoriteButton } from '@/components/common/FavoriteButton'
import { FaPlus } from 'react-icons/fa'
import { FaMinus } from 'react-icons/fa6'
import { FaStar } from 'react-icons/fa'
import { useRouter } from 'next/router'
import { formatPrice } from '@/lib/utils/formatPrice'
//收藏的功能

//跳轉頁面
interface InstrumentData {
  id?: number
  name?: string
  price?: number
  stock?: number
  info?: string
  sales?: number
  img?: string
}

interface Review {
  stars: number
}

export default function ProductBriefCard({
  data = {} as InstrumentData,
  reviews = [],
  quantity = 1,
  setQuantity = (() => {}) as (qty: number) => void,
  addInstrumentItem = (() => {}) as (item: InstrumentData, qty: number) => void,
  notifyBuy = (() => {}) as (name: string) => void,
  className: _className,
  increment: _increment,
  decrement: _decrement,
  remove: _remove,
}: {
  data?: InstrumentData
  reviews?: Review[]
  quantity?: number
  setQuantity?: (qty: number) => void
  addInstrumentItem?: (item: InstrumentData, qty: number) => void
  notifyBuy?: (name: string) => void
  className?: string
  increment?: (..._args: unknown[]) => void
  decrement?: (..._args: unknown[]) => void
  remove?: (..._args: unknown[]) => void
}) {
  const router = useRouter()
  // name={InstrumentDetail[0].name}
  // sales={InstrumentDetail[0].sales}
  // price={InstrumentDetail[0].price}
  // discount={InstrumentDetail[0].discount}
  // stock={InstrumentDetail[0].stock}
  // info={InstrumentDetail[0].info}

  // ----------------------加入右上角購物車的功能
  const toLocalePrice = formatPrice(data.price)
  return (
    <>
      <div className="Right sticky-top">
        <div className="prodBriefing sticky-top ">
          <div className="prodMainName">{data.name}</div>
          <div className="Rating">
            <div className="star">
              <FaStar size={20} color="#faad14" />
              <div
                className="ratingNumber"
                style={{ color: reviews.length > 0 ? '' : '#666666' }}
              >
                {reviews.length > 0 ? (
                  <>{reviews.map((v) => v.stars / reviews.length)}</>
                ) : (
                  '尚無評價'
                )}
              </div>
              <div className="commentNumber">({reviews.length})</div>
            </div>
            <div className="sales">已售出 {data.sales}</div>
          </div>
          <div className="productPrice">
            <div className="price">NT$ {toLocalePrice}</div>
            {/* 收藏功能 */}
            <FavoriteButton />
          </div>
          <div className="Intro" style={{ textAlign: 'justify' }}>
            {data.info}
          </div>
          {/* 數量選擇器 */}
          {/* 庫存等於0時應該顯示 暫無庫存*/}

          <div>
            {data.stock === 0 ? (
              <h5 className="mt-2">暫無庫存</h5>
            ) : (
              <div className="quantitySelector">
                <div
                  className="btn decrease-btn flex items-center justify-center"
                  role="presentation"
                  onClick={() => {
                    if (quantity > 1) {
                      setQuantity(quantity - 1)
                    }
                  }}
                >
                  <FaMinus color="#666666" />
                </div>
                <div className="quantity">{quantity}</div>
                <div
                  className={`increase-btn flex items-center justify-center cursor-pointer font-medium ${
                    data.stock === 0 ? 'noStock' : 'hasStock'
                  }`}
                  role="presentation"
                  onClick={() => {
                    setQuantity(quantity + 1)
                  }}
                >
                  <FaPlus color="#fff" />
                </div>
              </div>
            )}
          </div>

          <div className="shoppingBtn">
            <div
              className="cartBtn"
              role="presentation"
              style={{
                backgroundColor: data.stock > 0 ? '' : '#666666',
                cursor: data.stock > 0 ? 'pointer' : 'default',
              }}
              onClick={() => {
                if (data.stock > 0) {
                  addInstrumentItem(data, quantity)
                  notifyBuy(data.name)
                }
              }}
            >
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/c240e4bc8653fe6179383ea22f1eb80902c70eec255a944e9d8e0efbf823c4e3?"
                className="cartIcon"
                alt=""
              />

              <div className="cart" role="presentation">
                加入購物車
              </div>
            </div>

            <div
              className="buyBtn"
              style={{
                backgroundColor: data.stock > 0 ? '' : '#1581cc',
                cursor: data.stock > 0 ? 'pointer' : 'default',
              }}
              role="button"
              tabIndex={0}
              onClick={() => {
                if (data.stock > 0) {
                  addInstrumentItem(data, quantity)
                  router.push('/cart/check')
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && data.stock > 0) {
                  addInstrumentItem(data, quantity)
                  router.push('/cart/check')
                }
              }}
            >
              <div className="buy">立即購買</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>
        {`
          .Right {
            top: 80px;
            z-index: 30;
          }

          .prodBriefing {
            /* background-color: #ff9595; */
            margin-left: 45px;
            top: 120px;
          }
          .prodMainName {
            color: var(--dark, #1d1d1d);
            /* font: 700 40px Noto Sans TC, sans-serif; */
            font-weight: 700;
            font-size: 40px;
          }
          /*  */
          .font-family {
            font-family:
              Noto Sans TC,
              sans-serif;
          }
          /*  */

          .Rating {
            justify-content: space-between;
            display: flex;
            margin-top: 10px;
            width: 100%;
            gap: 20px;
            font-weight: 400;
          }

          .star {
            justify-content: center;
            align-items: center;
            display: flex;
            gap: 10px;
            white-space: nowrap;
          }

          .ratingNumber {
            color: var(--yellow, #faad14);
            align-self: stretch;
            font:
              24px Noto Sans TC,
              sans-serif;
          }

          .commentNumber {
            color: var(--body, #b9b9b9);
            align-self: stretch;
            flex-grow: 1;
            margin: auto 0;
            font:
              16px Noto Sans TC,
              sans-serif;
          }
          .sales {
            color: var(--secondary, #5a5a5a);
            margin: auto 0;
            font:
              16px Noto Sans TC,
              sans-serif;
          }
          .productPrice {
            justify-content: space-between;
            display: flex;
            margin-top: 10px;
            gap: 20px;
          }
          .price {
            color: var(--dark, #1d1d1d);
            white-space: nowrap;
            padding: 9px 21px 2px 0;
            font:
              700 28px Noto Sans TC,
              sans-serif;
          }
          .likesIcon {
            justify-content: center;
            align-items: center;
            border-radius: 5px;
            border: 1px solid var(--body, #b9b9b9);
            display: flex;
            aspect-ratio: 1;
            width: 34px;
            height: 34px;
            margin: auto 0;
            padding: 0 7px;
            transition: 0.2s;
            color: #b9b9b9;
            &:hover {
              color: #ec3f3f;
            }
          }
          .quantitySelector {
            display: flex;
            align-items: center;
            margin-top: 20px;
          }
          .decrease-btn {
            height: 40px;
            width: 40px;
            border-radius: 5px 0px 0px 5px;
            border: 1px solid var(--body, #b9b9b9);
          }
          .quantity {
            display: flex;
            width: 78px;
            height: 40px;
            justify-content: center;
            align-items: center;
            border: 1px solid var(--body, #b9b9b9);
          }
          .increase-btn {
            height: 40px;
            width: 40px;
            border-radius: 0px 5px 5px 0px;
          }
          .hasStock {
            background-color: #18a1ff;
          }
          .hasStock:hover {
            background-color: #1581cc;
          }
          .noStock {
            background-color: #b9b9b9;
          }
          .shoppingBtn {
            display: flex;
            margin-top: 20px;
            justify-content: space-evenly;
            gap: 12px;
            font-size: 16px;
            color: var(--white, #fff);
            font-weight: 700;
          }
          .cartBtn {
            display: flex;
            justify-content: center;
            border-radius: 5px;
            background-color: var(--body, #b9b9b9);
            gap: 12px;
            padding-block: 8px;
            flex: 1 0 0;
            cursor: pointer;
            transition: 0.3s;
            &:hover {
              background-color: #666666;
            }
          }
          .buyBtn {
            display: flex;
            justify-content: center;
            border-radius: 5px;
            background-color: #18a1ff;
            gap: 12px;
            padding-block: 8px;
            flex: 1 0 0;
            cursor: pointer;
            transition: 0.3s;
            &:hover {
              background-color: #1581cc;
            }
          }
        `}
      </style>
    </>
  )
}
