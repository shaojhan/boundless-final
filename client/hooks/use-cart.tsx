import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import CouponData from '@/data/cart/coupons.json'
import { useRouter } from 'next/router'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { CartItem } from '@/store/slices/cartSlice'
import {
  addInstrumentItem as addInstrumentItemAction,
  addLessonItem as addLessonItemAction,
  removeItem,
  incrementItem,
  decrementItem,
  setLessonDiscount as setLessonDiscountAction,
  setInstrumentDiscount as setInstrumentDiscountAction,
  clearCart,
  selectItems,
  selectLessonData,
  selectInstrumentData,
  selectLessonDiscount,
  selectInstrumentDiscount,
  selectCalcLessonItems,
  selectCalcInstrumentItems,
  selectCalcTotalItems,
  selectCalcLessonPrice,
  selectCalcInstrumentPrice,
  selectCalcTotalPrice,
  selectCalcLessonDiscount,
  selectCalcInstrumentDiscount,
  selectCalcTotalDiscount,
} from '@/store/slices/cartSlice'

export function useCart() {
  const dispatch = useDispatch()
  const router = useRouter()
  const mySwal = withReactContent(Swal)

  // ── State ────────────────────────────────────────────────────────────────
  const items = useSelector(selectItems)
  const instrumentData = useSelector(selectInstrumentData)
  const lessonData = useSelector(selectLessonData)
  const lessonDiscount = useSelector(selectLessonDiscount)
  const instrumentDiscount = useSelector(selectInstrumentDiscount)

  // Pre-computed selector values（包裝成函式以維持原有 API：calcXxx()）
  const _lessonItems = useSelector(selectCalcLessonItems)
  const _instrumentItems = useSelector(selectCalcInstrumentItems)
  const _totalItems = useSelector(selectCalcTotalItems)
  const _lessonPrice = useSelector(selectCalcLessonPrice)
  const _instrumentPrice = useSelector(selectCalcInstrumentPrice)
  const _totalPrice = useSelector(selectCalcTotalPrice)
  const _lessonDiscount = useSelector(selectCalcLessonDiscount)
  const _instrumentDiscount = useSelector(selectCalcInstrumentDiscount)
  const _totalDiscount = useSelector(selectCalcTotalDiscount)

  // 靜態優惠券清單（從 JSON 讀取，不進 Redux）
  const lessonCoupons = CouponData.filter((v: { kind: number }) => v.kind === 2)
  const instrumentCoupons = CouponData.filter(
    (v: { kind: number }) => v.kind === 1,
  )

  // ── Actions ──────────────────────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addInstrumentItem = (item: any, qty: number) => {
    dispatch(addInstrumentItemAction({ item: item as CartItem, qty }))
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addLessonItem = (item: any) => {
    dispatch(addLessonItemAction({ item: item as CartItem }))
  }

  const remove = (_items: unknown, id: number) => {
    dispatch(removeItem({ id }))
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const increment = (item: any, qty: number) => {
    dispatch(incrementItem({ id: item.id, qty }))
  }

  const increment_cart = (_items: unknown, id: number) => {
    dispatch(incrementItem({ id, qty: 1 }))
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const decrement = (item: any) => {
    dispatch(decrementItem({ id: item.id }))
  }

  const decrement_cart = (_items: unknown, id: number) => {
    dispatch(decrementItem({ id }))
  }

  const handleLessonSelector = (e: number | string) => {
    localStorage.setItem('LessonCoupon', String(e))
    dispatch(setLessonDiscountAction(e as number))
  }

  const handleLessonCUIDSelector = (_cuid: unknown) => {
    localStorage.setItem('LessonCouponCUID', '18')
  }

  const handleInstrumentSelector = (e: number | string) => {
    localStorage.setItem('InstrumentCoupon', String(e))
    dispatch(setInstrumentDiscountAction(e as number))
  }

  const handleInstrumentCUIDSelector = (_cuid: unknown) => {
    localStorage.setItem('InstrumentCouponCUID', '2')
  }

  const confirmOrderSubmit = () => {
    dispatch(clearCart())
    localStorage.removeItem('LessonCoupon')
    localStorage.removeItem('InstrumentCoupon')
    mySwal
      .fire({
        position: 'center',
        icon: 'success',
        iconColor: '#1581cc',
        title: '結帳成功！',
        showConfirmButton: false,
        timer: 2000,
      })
      .then(() =>
        setTimeout(() => {
          router.push('/user/user-order')
        }, 2000),
      )
  }

  // ── Toast helpers ────────────────────────────────────────────────────────

  const cartNull = () => {
    toast('購物車是空的哦', {
      icon: 'ℹ️',
      style: {
        border: '1px solid #666666',
        padding: '16px',
        color: '#1d1d1d',
      },
      duration: 2000,
    })
  }

  const alreadyBought = () => {
    toast('購物車中已存在該商品', {
      icon: 'ℹ️',
      style: {
        border: '1px solid #666666',
        padding: '16px',
        color: '#1d1d1d',
      },
      duration: 2000,
    })
  }

  const notifyBuy = (name: string) => {
    toast.success(`${name} 已加入購物車`, {
      style: {
        border: '1px solid #666666',
        padding: '16px',
        color: '#1d1d1d',
      },
      iconTheme: {
        primary: '#1581cc',
        secondary: '',
      },
      duration: 2000,
    })
  }

  // ── Return（API 與原 CartProvider 完全相同）────────────────────────────
  return {
    items,
    instrumentData,
    instrumentCoupons,
    instrumentDiscount,
    lessonData,
    lessonCoupons,
    lessonDiscount,
    handleLessonSelector,
    handleLessonCUIDSelector,
    handleInstrumentSelector,
    handleInstrumentCUIDSelector,
    addLessonItem,
    addInstrumentItem,
    increment,
    increment_cart,
    decrement,
    decrement_cart,
    remove,
    calcInstrumentItems: () => _instrumentItems,
    calcInstrumentPrice: () => _instrumentPrice,
    calcInstrumentDiscount: () => _instrumentDiscount,
    calcLessonItems: () => _lessonItems,
    calcLessonPrice: () => _lessonPrice,
    calcLessonDiscount: () => _lessonDiscount,
    calcTotalItems: () => _totalItems,
    calcTotalPrice: () => _totalPrice,
    calcTotalDiscount: () => _totalDiscount,
    confirmOrderSubmit,
    cartNull,
    notifyBuy,
    alreadyBought,
  }
}
