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
import companyReducer from './slices/companySlice'
import establishmentReducer from './slices/establishmentSlice'

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
  users: usersReducer,
  companies: companyReducer,
  establishments: establishmentReducer
  // Future modules:
  // accounting: accountingReducer,
  // administration: administrationReducer
})

// Only use persist on client side
const isClient = typeof window !== 'undefined'

// Persist configuration
const persistConfig = {
  key: 'root',
  version: 3, // Increment version to force migration due to loadingStates addition in products
  storage,
  whitelist: [
    'auth',
    'roles',
    'purchases',
    'suppliers',
    'products',
    'chartOfAccounts',
    'users',
    'companies',
    'establishments'
  ], // Persist auth, roles, purchases, suppliers, products, chartOfAccounts, users, companies and establishments state
  migrate: (state: any) => {
    return Promise.resolve(
      (() => {
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

        // Migration for version 3: ensure loadingStates exists in product slice
        if (state && state.products && !state.products.loadingStates) {
          state.products.loadingStates = {
            fetching: false,
            creating: false,
            updating: false,
            deleting: false,
            searching: false
          }

          // Also ensure pagination is unified
          if (state.products.meta) {
            state.products.pagination = {
              currentPage: state.products.meta.current_page || 1,
              rowsPerPage: state.products.meta.per_page || 15,
              totalPages: state.products.meta.last_page || 1,
              totalRecords: state.products.meta.total || 0,
              from: state.products.meta.from || 0,
              to: state.products.meta.to || 0
            }
            delete state.products.meta
          }

          // Ensure form state exists
          if (!state.products.isFormOpen) {
            state.products.isFormOpen = false
            state.products.formMode = 'create'
          }
        }

        return state
      })()
    )
  }
}

// Conditional persisted reducer
const reducer = isClient ? persistReducer(persistConfig, rootReducer) : rootReducer

// Configure store
export const store = configureStore({
  reducer: reducer as typeof rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    }),
  devTools: process.env.NODE_ENV !== 'production'
})

// Create persistor only on client side
export const persistor = isClient ? persistStore(store) : null

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
