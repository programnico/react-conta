// store/selectors/supplierSelectors.ts
import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../index'
import type { SupplierStats } from '@/features/supplier/types'

// Base selectors
export const selectSupplierState = (state: RootState) => {
  const supplierState = state.suppliers

  // Handle legacy state or corrupted state
  if (!supplierState || typeof supplierState.loading !== 'object' || supplierState.loading === null) {
    return {
      suppliers: [],
      loading: {
        list: false,
        create: false,
        update: false,
        delete: false,
        search: false
      },
      error: null,
      filters: {},
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        perPage: 15,
        hasNextPage: false,
        hasPreviousPage: false
      }
    }
  }

  return supplierState
}

// Supplier selectors
export const selectSuppliers = createSelector([selectSupplierState], supplierState => {
  // Ensure we always return a valid array with valid suppliers
  if (!Array.isArray(supplierState?.suppliers)) {
    return []
  }
  // Filter out null/undefined suppliers and ensure they have required properties
  return supplierState.suppliers.filter(
    supplier => supplier != null && typeof supplier === 'object' && supplier.id != null
  )
})

export const selectSupplierLoading = createSelector(
  [selectSupplierState],
  supplierState =>
    supplierState?.loading || {
      list: false,
      create: false,
      update: false,
      delete: false,
      search: false
    }
)

export const selectSupplierError = createSelector([selectSupplierState], supplierState => supplierState?.error || null)

export const selectSupplierFilters = createSelector(
  [selectSupplierState],
  supplierState => supplierState?.filters || {}
)

export const selectSupplierPagination = createSelector(
  [selectSupplierState],
  supplierState =>
    supplierState?.pagination || {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      perPage: 15,
      hasNextPage: false,
      hasPreviousPage: false
    }
)

// Derived selectors
export const selectSupplierById = createSelector(
  [selectSuppliers, (state: RootState, id: number) => id],
  (suppliers, id) => suppliers.find((supplier: any) => supplier.id === id)
)

// Statistics selector
export const selectSupplierStats = createSelector([selectSuppliers], (suppliers): SupplierStats => {
  // More robust validation
  if (!suppliers || !Array.isArray(suppliers) || suppliers.length === 0) {
    return {
      total: 0,
      active: 0,
      inactive: 0,
      local: 0,
      foreign: 0,
      byClassification: {
        none: 0,
        small: 0,
        medium: 0,
        large: 0,
        other: 0
      }
    }
  }

  // Filter valid suppliers for calculations
  const validSuppliers = suppliers.filter(supplier => supplier && typeof supplier === 'object' && supplier.id != null)

  return {
    total: validSuppliers.length,
    active: validSuppliers.filter(s => s.is_active === true).length,
    inactive: validSuppliers.filter(s => s.is_active === false).length,
    local: validSuppliers.filter(s => s.type === 'local').length,
    foreign: validSuppliers.filter(s => s.type === 'foreign').length,
    byClassification: {
      none: validSuppliers.filter(s => s.classification === 'none').length,
      small: validSuppliers.filter(s => s.classification === 'small').length,
      medium: validSuppliers.filter(s => s.classification === 'medium').length,
      large: validSuppliers.filter(s => s.classification === 'large').length,
      other: validSuppliers.filter(s => s.classification === 'other').length
    }
  }
})

// Loading states
export const selectIsAnySupplierLoading = createSelector([selectSupplierLoading], loading => {
  return Object.values(loading).some(isLoading => isLoading === true)
})
