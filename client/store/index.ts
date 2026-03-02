import { configureStore, combineReducers } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import authReducer from './slices/authSlice'
import cartReducer from './slices/cartSlice'
import jamReducer from './slices/jamSlice'
import { authPersistConfig, cartPersistConfig } from './persistConfig'

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  cart: persistReducer(cartPersistConfig, cartReducer),
  jam: jamReducer,
})

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
