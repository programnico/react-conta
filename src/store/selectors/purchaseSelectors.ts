// store/selectors/purchaseSelectors.ts
import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../index'
import type { PurchaseStats } from '@/features/purchase/types'

// Base selectors
export const selectPurchaseState = (state: RootState) => state.purchases
export const selectSupplierState = (state: RootState) => state.suppliers

// Purchase selectors
export const selectPurchases = createSelector([selectPurchaseState], purchaseState => {
  // Ensure we always return a valid array with valid purchases
  if (!Array.isArray(purchaseState?.purchases)) {
    return []
  }
  // Filter out null/undefined purchases and ensure they have required properties
  return purchaseState.purchases.filter(
    purchase => purchase != null && typeof purchase === 'object' && purchase.id != null
  )
})

export const selectPurchaseLoading = createSelector([selectPurchaseState], purchaseState => purchaseState.loading)

export const selectPurchaseError = createSelector([selectPurchaseState], purchaseState => purchaseState.error)

export const selectPurchaseFilters = createSelector([selectPurchaseState], purchaseState => purchaseState.filters)

export const selectPurchasePagination = createSelector([selectPurchaseState], purchaseState => purchaseState.pagination)

// Supplier selectors
export const selectSuppliers = createSelector([selectSupplierState], supplierState => {
  // Ensure we always return a valid array
  return Array.isArray(supplierState?.suppliers) ? supplierState.suppliers : []
})

export const selectSupplierLoading = createSelector([selectSupplierState], supplierState => supplierState.loading)

export const selectSupplierError = createSelector([selectSupplierState], supplierState => supplierState.error)

// Derived selectors
export const selectPurchaseById = createSelector(
  [selectPurchases, (state: RootState, id: number) => id],
  (purchases, id) => purchases.find((purchase: any) => purchase.id === id)
)

export const selectSupplierById = createSelector(
  [selectSuppliers, (state: RootState, id: number) => id],
  (suppliers, id) => suppliers.find((supplier: any) => supplier.id === id)
)

// Statistics selector
export const selectPurchaseStats = createSelector([selectPurchases], (purchases): PurchaseStats => {
  // More robust validation
  if (!purchases || !Array.isArray(purchases) || purchases.length === 0) {
    return {
      total: 0,
      pending: 0,
      approved: 0,
      received: 0,
      cancelled: 0,
      totalAmount: 0
    }
  }

  // Ensure all items have the expected structure
  const validPurchases = purchases.filter(p => p && typeof p === 'object' && p.status)

  if (validPurchases.length === 0) {
    return {
      total: 0,
      pending: 0,
      approved: 0,
      received: 0,
      cancelled: 0,
      totalAmount: 0
    }
  }

  const total = validPurchases.length
  const pending = validPurchases.filter(p => p.status === 'pending').length
  const approved = validPurchases.filter(p => p.status === 'approved').length
  const received = validPurchases.filter(p => p.status === 'received').length
  const cancelled = validPurchases.filter(p => p.status === 'cancelled').length

  const totalAmount = validPurchases.reduce((sum, p) => {
    const amount = typeof p.total_amount === 'string' ? parseFloat(p.total_amount) : p.total_amount
    return sum + (amount || 0)
  }, 0)

  return {
    total,
    pending,
    approved,
    received,
    cancelled,
    totalAmount
  }
})

// Loading state selectors
export const selectIsAnyPurchaseLoading = createSelector(
  [selectPurchaseLoading, selectSupplierLoading],
  (purchaseLoading, supplierLoading) =>
    purchaseLoading.list ||
    purchaseLoading.create ||
    purchaseLoading.update ||
    purchaseLoading.delete ||
    purchaseLoading.search ||
    supplierLoading.list ||
    supplierLoading.create ||
    supplierLoading.update ||
    supplierLoading.delete ||
    supplierLoading.search
)
