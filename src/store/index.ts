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
import productReducer from './slices/productSlice'
import chartOfAccountsReducer from './slices/chartOfAccountsSlice'
import usersReducer from './slices/usersSlice'

// Persist configuration
const persistConfig = {
  key: 'root',
  version: 2, // Increment version to force migration due to loadingStates addition
  storage,
  whitelist: ['auth', 'roles', 'purchases', 'suppliers', 'products', 'chartOfAccounts', 'users'], // Persist auth, roles, purchases, suppliers, products, chartOfAccounts and users state
  migrate: (state: any) => {
    // Migration for version 2: ensure loadingStates exists in supplier slice
    if (state && state.suppliers && !state.suppliers.loadingStates) {
      state.suppliers.loadingStates = {
        fetching: false,
        creating: false,
        updating: false,
        deleting: false,
        searching: false
      }
    }
    return state
  }
}

// Root reducer with modular structure
const rootReducer = combineReducers({
  // Global state (always available)
  auth: authReducer,
  roles: rolesReducer,

  // Feature modules (loaded as needed)
  purchases: purchaseReducer,
  suppliers: supplierReducer,
  products: productReducer,
  chartOfAccounts: chartOfAccountsReducer,
  users: usersReducer
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
