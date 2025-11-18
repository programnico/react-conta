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
  resetPagination,
  openForm,
  closeForm
} from '@/store/slices/productSlice'
import type { Product, CreateProductRequest, ProductFilters } from '../types'

export const useProductsRedux = () => {
  const dispatch = useDispatch<AppDispatch>()
  const state = useSelector((state: RootState) => state.products)

  const {
    products,
    loading,
    error,
    validationErrors,
    filters,
    selectedProduct,
    needsReload,
    pagination,
    isFormOpen,
    formMode
  } = state

  // Fallback para loadingStates si no existe en el store actual
  const loadingStates = state.loadingStates || {
    fetching: false,
    creating: false,
    updating: false,
    deleting: false,
    searching: false
  }

  // Action creators
  const loadProducts = useCallback(
    (params?: { [key: string]: any }) => {
      const { page, per_page, pageSize, ...filterParams } = params || {}

      return dispatch(
        fetchProducts({
          page: page || 1,
          pageSize: per_page || pageSize || 15,
          filters: filterParams as ProductFilters
        })
      )
    },
    [dispatch]
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

  // Form actions
  const openFormAction = useCallback(
    (mode: 'create' | 'edit', product?: Product) => {
      dispatch(openForm({ mode, product }))
    },
    [dispatch]
  )

  const closeFormAction = useCallback(() => {
    dispatch(closeForm())
  }, [dispatch])

  return {
    // State
    products,
    loading,
    loadingStates,
    error,
    validationErrors,
    filters,
    selectedProduct,
    needsReload,
    pagination,
    isFormOpen,
    formMode,

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
    resetPagination: resetPaginationAction,
    openForm: openFormAction,
    closeForm: closeFormAction
  }
}
