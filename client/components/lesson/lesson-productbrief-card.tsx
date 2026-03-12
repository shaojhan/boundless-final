import { useRouter } from 'next/router'
import { FavoriteButton } from '@/components/common/FavoriteButton'
import { formatPrice } from '@/lib/utils/formatPrice'
import { FaStar, FaShoppingCart, FaBook } from 'react-icons/fa'
import { GoClock } from 'react-icons/go'
import { MdOutlinePeopleAlt } from 'react-icons/md'

export default function ProductBriefCard({
  id,
  average_rating,
  review_count,
  img,
  img_small,
  type,
  lesson_category_id,
  name,
  homework,
  sales,
  price,
  discount,
  discount_state,
  length,
  info,
  onshelf_time,
  addLessonItem = (() => {}) as (item: object) => void,
  notifyBuy = (() => {}) as (name: string) => void,
  className: _className,
}: {
  id?: number
  average_rating?: number
  review_count?: number
  img?: string
  img_small?: string
  type?: number
  lesson_category_id?: number
  name?: string
  homework?: number
  sales?: number
  price?: number
  discount?: number
  discount_state?: number
  length?: number
  info?: string
  onshelf_time?: string
  addLessonItem?: (item: object) => void
  notifyBuy?: (name: string) => void
  className?: string
}) {
  const router = useRouter()
  const toLocalePrice = formatPrice(price)

  const cartItem = {
    id,
    img,
    img_small,
    type,
    lesson_category_id,
    name,
    homework,
    sales,
    price,
    discount,
    discount_state,
    length,
    info,
    onshelf_time,
  }

  return (
    <div className="sticky top-24 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      {/* Course thumbnail */}
      <div className="w-full aspect-video bg-gray-100">
        <img
          src={`/課程與師資/lesson_img/${img}`}
          className="w-full h-full object-cover"
          alt={name || 'Course'}
        />
      </div>

      <div className="p-5 space-y-4">
        {/* Course title */}
        <h2 className="text-lg font-bold text-gray-900 leading-snug">{name}</h2>

        {/* Rating & sales */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <FaStar className="text-yellow-400" size={14} />
            <span className="text-yellow-500 font-semibold text-sm">
              {Math.round(average_rating ?? 0)}
            </span>
            <span className="text-gray-400 text-xs">({review_count})</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <MdOutlinePeopleAlt size={14} />
            <span>{sales} 人購買</span>
          </div>
        </div>

        {/* Price & favorite */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900">
            NT$ {toLocalePrice}
          </div>
          <FavoriteButton pid={id} />
        </div>

        {/* Course meta */}
        <div className="flex gap-5 text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <GoClock size={14} className="text-blue-500" />
            <span>{length} 小時</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FaBook size={13} className="text-blue-500" />
            <span>{homework} 份作業</span>
          </div>
        </div>

        {/* Short intro */}
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
          {info}
        </p>

        {/* Divider */}
        <hr className="border-gray-100" />

        {/* CTA buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              notifyBuy(name ?? '')
              addLessonItem(cartItem)
            }}
            className="w-full flex items-center justify-center gap-2 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2.5 rounded-lg transition-colors text-sm cursor-pointer"
          >
            <FaShoppingCart size={14} />
            加入購物車
          </button>
          <button
            onClick={() => {
              addLessonItem(cartItem)
              router.push('/cart/check')
            }}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 rounded-lg transition-colors text-sm cursor-pointer"
          >
            立即購買
          </button>
        </div>
      </div>
    </div>
  )
}
