// store/selectors/productSelectors.ts
import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../index'
import type { ProductStats, Product } from '@/features/product/types'

// Base selectors
export const selectProductState = (state: RootState) => {
  const productState = (state as any).products

  // Handle legacy state or corrupted state
  if (!productState || typeof productState.loading !== 'object' || productState.loading === null) {
    return {
      products: [],
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

  return productState
}

export const selectProducts = createSelector([selectProductState], state => state.products)

export const selectProductLoading = createSelector([selectProductState], state => {
  // Handle corrupted loading state
  if (typeof state.loading !== 'object' || state.loading === null) {
    return {
      products: false,
      creating: false,
      updating: false,
      deleting: false,
      searching: false,
      any: false
    }
  }

  return {
    products: state.loading.list || false,
    creating: state.loading.create || false,
    updating: state.loading.update || false,
    deleting: state.loading.delete || false,
    searching: state.loading.search || false,
    any:
      state.loading.list ||
      state.loading.create ||
      state.loading.update ||
      state.loading.delete ||
      state.loading.search ||
      false
  }
})

export const selectProductError = createSelector([selectProductState], state => state.error)

export const selectProductFilters = createSelector([selectProductState], state => state.filters)

export const selectProductPagination = createSelector([selectProductState], state => state.pagination)

export const selectProductById = createSelector(
  [selectProducts, (state: RootState, productId: number) => productId],
  (products: Product[], productId: number) => products.find((product: Product) => product.id === productId)
)

export const selectProductStats = createSelector([selectProducts], (products: Product[]) => {
  const stats: ProductStats = {
    total: products.length,
    active: products.filter((p: Product) => p.is_active).length,
    inactive: products.filter((p: Product) => !p.is_active).length,
    lowStock: products.filter((p: Product) => parseFloat(p.stock_quantity) < 10).length,
    categories: new Set(products.map((p: Product) => p.category)).size
  }

  return stats
})

export const selectIsAnyProductLoading = createSelector([selectProductLoading], loading => loading.any)
