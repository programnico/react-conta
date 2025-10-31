// features/product/hooks/useProductsRedux.ts
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/shared/hooks/redux'
import {
  fetchProducts,
  createProduct as createProductAction,
  updateProduct as updateProductAction,
  deleteProduct as deleteProductAction,
  searchProducts,
  setProductFilters,
  clearProductFilters,
  clearProductError,
  resetProducts,
  resetProductLoadingStates,
  setCurrentPage,
  setPageSize,
  setFiltersAndResetPage
} from '@/store/slices/productSlice'
import {
  selectProducts,
  selectProductLoading,
  selectProductError,
  selectProductFilters,
  selectProductPagination,
  selectProductById,
  selectProductStats,
  selectIsAnyProductLoading
} from '@/store/selectors/productSelectors'
import { selectIsAuthenticated } from '@/shared/store/authSlice'
import type { Product, CreateProductRequest, ProductFilters } from '../types'

interface UseProductsOptions {
  autoLoad?: boolean
  initialFilters?: ProductFilters
  pageSize?: number
}

interface UseProductsReturn {
  // Data
  products: Product[]
  loading: {
    products: boolean
    creating: boolean
    updating: boolean
    deleting: boolean
    searching: boolean
    any: boolean
  }
  error: string | null

  // Pagination
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    perPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }

  // Filters & Stats
  filters: ProductFilters
  stats: any

  // Actions
  loadProducts: (page?: number, newFilters?: ProductFilters) => Promise<void>
  createProduct: (data: CreateProductRequest) => Promise<void>
  updateProduct: (id: number, data: CreateProductRequest) => Promise<void>
  deleteProduct: (id: number) => Promise<void>
  setFilters: (filters: ProductFilters) => void
  clearFilters: () => void
  searchProducts: (query: string, filters?: ProductFilters) => Promise<void>
  refreshData: () => Promise<void>
  forceResetLoadingStates: () => void

  // Pagination Actions (Redux-only, no URL manipulation)
  goToPage: (page: number) => void
  changePageSize: (size: number) => void
  setFiltersAndGoToFirstPage: (filters: ProductFilters) => void

  // Utilities
  clearError: () => void
  getProductById: (id: number) => Product | undefined
}

export function useProductsRedux(options: UseProductsOptions = {}): UseProductsReturn {
  const { autoLoad = true, initialFilters = {}, pageSize = 15 } = options

  const dispatch = useAppDispatch()
  const products = useAppSelector(selectProducts)
  const loading = useAppSelector(selectProductLoading)
  const error = useAppSelector(selectProductError)
  const pagination = useAppSelector(selectProductPagination)
  const filters = useAppSelector(selectProductFilters)
  const stats = useAppSelector(selectProductStats)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  const hasLoadedData = useRef(false)

  // Memoize loading state to prevent unnecessary rerenders
  const memoizedLoading = useMemo(() => {
    if (!loading || typeof loading !== 'object') {
      return {
        products: false,
        creating: false,
        updating: false,
        deleting: false,
        searching: false,
        any: false
      }
    }

    return loading
  }, [loading])

  const loadProducts = useCallback(
    async (page: number = 1, newFilters?: ProductFilters, customPageSize?: number) => {
      const currentFilters = newFilters || filters
      const currentPageSize = customPageSize || pagination.perPage || pageSize
      await dispatch(
        fetchProducts({
          page,
          filters: currentFilters,
          pageSize: currentPageSize
        })
      ).unwrap()
    },
    [dispatch, pageSize, filters, pagination.perPage]
  )

  const createProduct = useCallback(
    async (data: CreateProductRequest) => {
      try {
        await dispatch(createProductAction(data)).unwrap()
      } catch (error) {
        dispatch(resetProductLoadingStates())
        throw error
      }
    },
    [dispatch]
  )

  const updateProduct = useCallback(
    async (id: number, data: CreateProductRequest) => {
      try {
        await dispatch(updateProductAction({ id, data })).unwrap()
      } catch (error) {
        dispatch(resetProductLoadingStates())
        throw error
      }
    },
    [dispatch]
  )

  const deleteProduct = useCallback(
    async (id: number) => {
      await dispatch(deleteProductAction(id)).unwrap()
    },
    [dispatch]
  )

  const refreshData = useCallback(async () => {
    await loadProducts(pagination.currentPage, filters, pagination.perPage)
  }, [loadProducts, pagination.currentPage, filters, pagination.perPage])

  const searchProductsCallback = useCallback(
    async (query: string, searchFilters?: ProductFilters) => {
      await dispatch(
        searchProducts({
          query,
          filters: searchFilters || filters,
          pageSize: pagination.perPage || pageSize
        })
      ).unwrap()
    },
    [dispatch, pageSize, pagination.perPage, filters]
  )

  const forceResetLoadingStates = useCallback(() => {
    dispatch(resetProductLoadingStates())
  }, [dispatch])

  const setFilters = useCallback(
    (newFilters: ProductFilters) => {
      dispatch(setProductFilters(newFilters))
    },
    [dispatch]
  )

  const clearFilters = useCallback(() => {
    dispatch(clearProductFilters())
  }, [dispatch])

  const clearError = useCallback(() => {
    dispatch(clearProductError())
  }, [dispatch])

  // New pagination actions (Redux-only, no URL manipulation)
  const goToPage = useCallback(
    (page: number) => {
      dispatch(setCurrentPage(page))
      // Auto-load new page with current page size
      loadProducts(page, filters, pagination.perPage)
    },
    [dispatch, loadProducts, filters, pagination.perPage]
  )

  const changePageSize = useCallback(
    (size: number) => {
      dispatch(setPageSize(size))
      // Auto-load with new page size (resets to page 1)
      loadProducts(1, filters, size)
    },
    [dispatch, loadProducts, filters]
  )

  const setFiltersAndGoToFirstPage = useCallback(
    (newFilters: ProductFilters) => {
      dispatch(setFiltersAndResetPage(newFilters))
      // Auto-load with new filters (page 1) and current page size
      loadProducts(1, newFilters, pagination.perPage)
    },
    [dispatch, loadProducts, pagination.perPage]
  )

  // Memoize initialFilters to prevent object recreation
  const memoizedInitialFilters = useMemo(() => initialFilters, [JSON.stringify(initialFilters)])

  // Auto-load on mount - only once
  useEffect(() => {
    if (autoLoad && isAuthenticated && !hasLoadedData.current) {
      hasLoadedData.current = true

      // Set initial filters
      if (Object.keys(memoizedInitialFilters).length > 0) {
        dispatch(setProductFilters(memoizedInitialFilters))
      }

      // Load data directly with dispatch
      dispatch(
        fetchProducts({
          page: 1,
          filters: memoizedInitialFilters,
          pageSize: pagination.perPage || pageSize
        })
      )
    }
  }, [autoLoad, isAuthenticated, dispatch, pageSize, memoizedInitialFilters])

  return {
    // Data
    products,
    loading: memoizedLoading,
    error,
    pagination,
    filters,
    stats,

    // Actions
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    setFilters,
    clearFilters,
    searchProducts: searchProductsCallback,
    refreshData,
    forceResetLoadingStates,

    // Pagination Actions (Redux-only, no URL manipulation)
    goToPage,
    changePageSize,
    setFiltersAndGoToFirstPage,

    // Utilities
    clearError,
    getProductById: useCallback((id: number) => selectProductById({ products } as any, id), [products])
  }
}
