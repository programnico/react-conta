// store/index.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from './storage'

// Shared/Global reducers
import authReducer from '@/shared/store/authSlice'
import rolesReducer from '@/shared/store/rolesSlice'

// Feature reducers
import purchaseReducer from './slices/purchaseSlice'
import supplierReducer from './slices/supplierSlice'

// Persist configuration
const persistConfig = {
  key: 'root',
  version: 1, // Keep version 1 to preserve existing sessions
  storage,
  whitelist: ['auth', 'roles', 'purchases', 'suppliers'] // Persist auth, roles, purchases and suppliers state
}

// Root reducer with modular structure
const rootReducer = combineReducers({
  // 🌟 Global state (always available)
  auth: authReducer,
  roles: rolesReducer,

  // 🏢 Feature modules (loaded as needed)
  purchases: purchaseReducer,
  suppliers: supplierReducer

  // Future modules:
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
