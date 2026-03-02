import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit'

export interface CartItem {
  id: number
  type: 1 | 2 // 1=instrument, 2=lesson
  price: number
  qty: number
  [key: string]: unknown
}

interface CartState {
  items: CartItem[]
  lessonDiscount: number
  instrumentDiscount: number
}

const initialState: CartState = {
  items: [],
  lessonDiscount: 0,
  instrumentDiscount: 0,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addInstrumentItem(
      state,
      action: PayloadAction<{ item: CartItem; qty: number }>,
    ) {
      const { item, qty } = action.payload
      const existing = state.items.find((v) => v.id === item.id)
      if (existing) {
        existing.qty += qty
      } else {
        state.items.push({ ...item, qty })
      }
    },
    addLessonItem(state, action: PayloadAction<{ item: CartItem }>) {
      const { item } = action.payload
      const existing = state.items.find((v) => v.id === item.id)
      if (!existing) {
        state.items.push({ ...item, qty: 1 })
      }
    },
    removeItem(state, action: PayloadAction<{ id: number }>) {
      state.items = state.items.filter((v) => v.id !== action.payload.id)
    },
    incrementItem(state, action: PayloadAction<{ id: number; qty?: number }>) {
      const { id, qty = 1 } = action.payload
      const item = state.items.find((v) => v.id === id)
      if (item) item.qty += qty
    },
    decrementItem(state, action: PayloadAction<{ id: number }>) {
      const { id } = action.payload
      const item = state.items.find((v) => v.id === id)
      if (item) item.qty -= 1
    },
    setLessonDiscount(state, action: PayloadAction<number>) {
      state.lessonDiscount = action.payload
    },
    setInstrumentDiscount(state, action: PayloadAction<number>) {
      state.instrumentDiscount = action.payload
    },
    clearCart(state) {
      state.items = []
      state.lessonDiscount = 0
      state.instrumentDiscount = 0
    },
  },
})

export const {
  addInstrumentItem,
  addLessonItem,
  removeItem,
  incrementItem,
  decrementItem,
  setLessonDiscount,
  setInstrumentDiscount,
  clearCart,
} = cartSlice.actions

export default cartSlice.reducer

// ─── Selectors ───────────────────────────────────────────────────────────────

interface RootCartState {
  cart: CartState
}

export const selectItems = (state: RootCartState) => state.cart.items
export const selectLessonDiscount = (state: RootCartState) =>
  state.cart.lessonDiscount
export const selectInstrumentDiscount = (state: RootCartState) =>
  state.cart.instrumentDiscount

export const selectLessonData = createSelector(selectItems, (items) =>
  items.filter((v) => v.type === 2),
)

export const selectInstrumentData = createSelector(selectItems, (items) =>
  items.filter((v) => v.type === 1),
)

export const selectCalcLessonItems = (state: RootCartState) =>
  state.cart.items.filter((v) => v.type === 2).length

export const selectCalcInstrumentItems = (state: RootCartState) =>
  state.cart.items
    .filter((v) => v.type === 1)
    .reduce((sum, v) => sum + v.qty, 0)

export const selectCalcTotalItems = (state: RootCartState) =>
  state.cart.items.length

export const selectCalcLessonPrice = (state: RootCartState) =>
  state.cart.items
    .filter((v) => v.type === 2)
    .reduce((sum, v) => sum + v.price, 0)

export const selectCalcInstrumentPrice = (state: RootCartState) =>
  state.cart.items
    .filter((v) => v.type === 1)
    .reduce((sum, v) => sum + v.qty * v.price, 0)

export const selectCalcTotalPrice = (state: RootCartState) => {
  const lessonTotal = state.cart.items
    .filter((v) => v.type === 2)
    .reduce((sum, v) => sum + v.price, 0)
  const instrumentTotal = state.cart.items
    .filter((v) => v.type === 1)
    .reduce((sum, v) => sum + v.qty * v.price, 0)
  return lessonTotal + instrumentTotal
}

export const selectCalcLessonDiscount = (state: RootCartState) => {
  const lessonDiscount = state.cart.lessonDiscount
  const lessonPrice = state.cart.items
    .filter((v) => v.type === 2)
    .reduce((sum, v) => sum + v.price, 0)
  if (lessonDiscount === 0) return 0
  return lessonDiscount < 1
    ? lessonPrice - lessonDiscount * lessonPrice
    : lessonDiscount
}

export const selectCalcInstrumentDiscount = (state: RootCartState) => {
  const instrumentDiscount = state.cart.instrumentDiscount
  const instrumentPrice = state.cart.items
    .filter((v) => v.type === 1)
    .reduce((sum, v) => sum + v.qty * v.price, 0)
  if (instrumentDiscount === 0) return 0
  return instrumentDiscount < 1
    ? instrumentPrice - instrumentPrice * instrumentDiscount
    : instrumentDiscount
}

export const selectCalcTotalDiscount = (state: RootCartState) => {
  const lessonDiscount = state.cart.lessonDiscount
  const instrumentDiscount = state.cart.instrumentDiscount
  const lessonPrice = state.cart.items
    .filter((v) => v.type === 2)
    .reduce((sum, v) => sum + v.price, 0)
  const instrumentPrice = state.cart.items
    .filter((v) => v.type === 1)
    .reduce((sum, v) => sum + v.qty * v.price, 0)

  const ld =
    lessonDiscount === 0
      ? 0
      : lessonDiscount < 1
        ? lessonPrice - lessonDiscount * lessonPrice
        : lessonDiscount

  const id =
    instrumentDiscount === 0
      ? 0
      : instrumentDiscount < 1
        ? instrumentPrice - instrumentPrice * instrumentDiscount
        : instrumentDiscount

  return parseInt(String(id)) + parseInt(String(ld))
}
