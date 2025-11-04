// store/selectors/productSelectors.ts
import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../index'
import type { ProductStats, Product } from '@/features/product/types'

// Base selectors
export const selectProductState = (state: RootState) => {
  const productState = (state as any).products

  // Handle legacy state or corrupted state
  if (!productState) {
    return {
      products: [],
      loading: false,
      error: null,
      validationErrors: null,
      filters: {},
      selectedProduct: null,
      meta: null
    }
  }

  return productState
}

export const selectProducts = createSelector([selectProductState], state => state.products)

export const selectProductLoading = createSelector([selectProductState], state => state.loading)

export const selectProductError = createSelector([selectProductState], state => state.error)

export const selectProductValidationErrors = createSelector([selectProductState], state => state.validationErrors)

export const selectProductFilters = createSelector([selectProductState], state => state.filters)

export const selectSelectedProduct = createSelector([selectProductState], state => state.selectedProduct)

export const selectProductMeta = createSelector([selectProductState], state => state.meta)

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
