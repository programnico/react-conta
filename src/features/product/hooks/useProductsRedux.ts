// features/product/hooks/useProductsRedux.ts
import { useSelector, useDispatch } from 'react-redux'
import { useCallback } from 'react'
import { RootState, AppDispatch } from '@/store'
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  clearError,
  clearValidationErrors,
  setSelectedProduct,
  clearSelectedProduct,
  setFilters,
  clearFilters,
  setNeedsReload,
  setCurrentPage,
  setRowsPerPage,
  resetPagination
} from '@/store/slices/productSlice'
import type { Product, CreateProductRequest, ProductFilters } from '../types'

export const useProductsRedux = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { products, loading, error, validationErrors, filters, selectedProduct, needsReload, pagination, meta } =
    useSelector((state: RootState) => state.products)

  // Action creators
  const loadProducts = useCallback(
    (params?: { [key: string]: any }) => {
      // Usar la paginación del estado Redux
      const { currentPage, rowsPerPage } = pagination
      const { page = currentPage, per_page = rowsPerPage, ...filterParams } = params || {}

      return dispatch(
        fetchProducts({
          page,
          pageSize: per_page,
          filters: filterParams as ProductFilters
        })
      )
    },
    [dispatch, pagination]
  )

  const createNewProduct = (productData: CreateProductRequest) => {
    return dispatch(createProduct(productData))
  }

  const updateExistingProduct = (productData: { id: number; data: CreateProductRequest }) => {
    return dispatch(updateProduct(productData))
  }

  const deleteExistingProduct = (productId: number) => {
    return dispatch(deleteProduct(productId))
  }

  const searchProductsAction = (params: { query: string; filters?: ProductFilters; pageSize?: number }) => {
    return dispatch(searchProducts(params))
  }

  const clearErrorAction = () => {
    dispatch(clearError())
  }

  const clearValidationErrorsAction = () => {
    dispatch(clearValidationErrors())
  }

  const setSelectedProductAction = (product: Product | null) => {
    dispatch(setSelectedProduct(product))
  }

  const clearSelectedProductAction = () => {
    dispatch(clearSelectedProduct())
  }

  const setFiltersAction = (newFilters: ProductFilters) => {
    dispatch(setFilters(newFilters))
  }

  const clearFiltersAction = () => {
    dispatch(clearFilters())
  }

  const setNeedsReloadAction = useCallback(
    (needsReload: boolean) => {
      dispatch(setNeedsReload(needsReload))
    },
    [dispatch]
  )

  const setCurrentPageAction = useCallback(
    (page: number) => {
      dispatch(setCurrentPage(page))
    },
    [dispatch]
  )

  const setRowsPerPageAction = useCallback(
    (rowsPerPage: number) => {
      dispatch(setRowsPerPage(rowsPerPage))
    },
    [dispatch]
  )

  const resetPaginationAction = useCallback(() => {
    dispatch(resetPagination())
  }, [dispatch])

  return {
    // State
    products,
    loading,
    error,
    validationErrors,
    filters,
    selectedProduct,
    needsReload,
    pagination,
    meta,

    // Actions
    loadProducts,
    createProduct: createNewProduct,
    updateProduct: updateExistingProduct,
    deleteProduct: deleteExistingProduct,
    searchProducts: searchProductsAction,
    clearError: clearErrorAction,
    clearValidationErrors: clearValidationErrorsAction,
    setSelectedProduct: setSelectedProductAction,
    clearSelectedProduct: clearSelectedProductAction,
    setFilters: setFiltersAction,
    clearFilters: clearFiltersAction,
    setNeedsReload: setNeedsReloadAction,
    setCurrentPage: setCurrentPageAction,
    setRowsPerPage: setRowsPerPageAction,
    resetPagination: resetPaginationAction
  }
}
