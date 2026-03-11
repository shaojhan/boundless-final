import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { CartItem } from '@/store/slices/cartSlice'
import { useAuth } from '@/hooks/user/use-auth'
import CouponClass from '@/API/Coupon'
import type { CouponItem } from '@/types/api'
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

  // 從 API 取得登入使用者個人持有的有效折價券
  const { LoginUserData } = useAuth()
  const [lessonCoupons, setLessonCoupons] = useState<CouponItem[]>([])
  const [instrumentCoupons, setInstrumentCoupons] = useState<CouponItem[]>([])

  const refreshCoupons = (id: number) => {
    CouponClass.FindAll(id).then((data) => {
      const valid = data.filter((c) => c.valid === 1)
      setLessonCoupons(valid.filter((c) => c.kind === 2))
      setInstrumentCoupons(valid.filter((c) => c.kind === 1))
    })
  }

  useEffect(() => {
    if (!LoginUserData?.id) return
    refreshCoupons(LoginUserData.id)
  }, [LoginUserData?.id])

  // ── Actions ──────────────────────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addInstrumentItem = (item: any, qty: number) => {
    dispatch(addInstrumentItemAction({ item: { ...item, type: 1 } as CartItem, qty }))
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addLessonItem = (item: any) => {
    dispatch(addLessonItemAction({ item: { ...item, type: 2 } as CartItem }))
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

  const handleLessonSelector = (raw: string) => {
    if (raw === 'none') {
      localStorage.removeItem('LessonCouponRaw')
      localStorage.removeItem('LessonCoupon')
      localStorage.removeItem('LessonCouponCUID')
      dispatch(setLessonDiscountAction(0))
      return
    }
    const { discount, cuid } = JSON.parse(raw) as {
      discount: number
      cuid: number
    }
    localStorage.setItem('LessonCouponRaw', raw)
    localStorage.setItem('LessonCoupon', String(discount))
    localStorage.setItem('LessonCouponCUID', String(cuid))
    dispatch(setLessonDiscountAction(discount))
  }

  const handleInstrumentSelector = (raw: string) => {
    if (raw === 'none') {
      localStorage.removeItem('InstrumentCouponRaw')
      localStorage.removeItem('InstrumentCoupon')
      localStorage.removeItem('InstrumentCouponCUID')
      dispatch(setInstrumentDiscountAction(0))
      return
    }
    const { discount, cuid } = JSON.parse(raw) as {
      discount: number
      cuid: number
    }
    localStorage.setItem('InstrumentCouponRaw', raw)
    localStorage.setItem('InstrumentCoupon', String(discount))
    localStorage.setItem('InstrumentCouponCUID', String(cuid))
    dispatch(setInstrumentDiscountAction(discount))
  }

  const redeemCoupon = async (
    coupon_code: string,
  ): Promise<{ success: boolean; message: string }> => {
    if (!LoginUserData?.id) return { success: false, message: '請先登入' }
    try {
      const result = await CouponClass.Redeem(LoginUserData.id, coupon_code)
      if (result.success) {
        refreshCoupons(LoginUserData.id)
      }
      return result
    } catch {
      return { success: false, message: '兌換失敗，請稍後再試' }
    }
  }

  const confirmOrderSubmit = () => {
    dispatch(clearCart())
    localStorage.removeItem('LessonCoupon')
    localStorage.removeItem('LessonCouponRaw')
    localStorage.removeItem('LessonCouponCUID')
    localStorage.removeItem('InstrumentCoupon')
    localStorage.removeItem('InstrumentCouponRaw')
    localStorage.removeItem('InstrumentCouponCUID')
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
    handleInstrumentSelector,
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
    redeemCoupon,
    confirmOrderSubmit,
    cartNull,
    notifyBuy,
    alreadyBought,
  }
}
