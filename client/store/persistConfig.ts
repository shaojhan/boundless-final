import storage from 'redux-persist/lib/storage'

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
