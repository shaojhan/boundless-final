import createWebStorage from 'redux-persist/lib/storage/createWebStorage'
import { createMigrate } from 'redux-persist'

const createNoopStorage = () => {
  return {
    getItem(_key: string) {
      return Promise.resolve(null)
    },
    setItem(_key: string, value: string) {
      return Promise.resolve(value)
    },
    removeItem(_key: string) {
      return Promise.resolve()
    },
  }
}

const storage =
  typeof window !== 'undefined'
    ? createWebStorage('local')
    : createNoopStorage()

export const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user'],
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cartMigrations: Record<number, (state: any) => any> = {
  1: (state) => ({
    ...state,
    items: (state?.items ?? []).map((item: Record<string, unknown>) => {
      if (item.type === 1 || item.type === 2) return item
      // Backfill type based on whether instrument_category_id is a number
      const type = typeof item.instrument_category_id === 'number' ? 1 : 2
      return { ...item, type }
    }),
  }),
}

export const cartPersistConfig = {
  key: 'cart',
  storage,
  version: 1,
  migrate: createMigrate(cartMigrations, { debug: false }),
  whitelist: ['items', 'lessonDiscount', 'instrumentDiscount'],
}
