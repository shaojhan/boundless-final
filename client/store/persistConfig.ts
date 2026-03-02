import createWebStorage from 'redux-persist/lib/storage/createWebStorage'

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
  typeof window !== 'undefined' ? createWebStorage('local') : createNoopStorage()

export const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'loginUserData', 'status'],
}

export const cartPersistConfig = {
  key: 'cart',
  storage,
  whitelist: ['items', 'lessonDiscount', 'instrumentDiscount'],
}
