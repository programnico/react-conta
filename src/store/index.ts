// store/index.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from './storage'

// Shared/Global reducers
import authReducer from '@/shared/store/authSlice'

// Feature reducers
import unitMergeReducer from './slices/unitMergeSlice'

// Persist configuration
const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['auth'] // Only persist auth state
}

// Root reducer with modular structure
const rootReducer = combineReducers({
  // 🌟 Global state (always available)
  auth: authReducer,

  // 🏢 Feature modules (loaded as needed)
  unitMerge: unitMergeReducer
  // Future modules:
  // purchase: purchaseReducer,
  // accounting: accountingReducer,
  // administration: administrationReducer
})

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer)

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    }),
  devTools: process.env.NODE_ENV !== 'production'
})

// Create persistor
export const persistor = persistStore(store)

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
