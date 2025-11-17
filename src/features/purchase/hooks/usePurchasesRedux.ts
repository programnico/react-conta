// features/purchase/hooks/usePurchasesRedux.ts
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/shared/hooks/redux'
import {
  fetchPurchases,
  createPurchase as createPurchaseAction,
  updatePurchase as updatePurchaseAction,
  deletePurchase as deletePurchaseAction,
  searchPurchases,
  setFilters,
  clearFilters,
  clearError as clearPurchaseError,
  resetPurchases,
  resetLoadingStates
} from '@/store/slices/purchaseSlice'
import { fetchSuppliers, clearError as clearSupplierError } from '@/store/slices/supplierSlice'
import {
  selectPurchases,
  selectPurchaseLoading,
  selectPurchaseError,
  selectPurchaseFilters,
  selectPurchasePagination,
  selectSuppliers,
  selectSupplierLoading,
  selectSupplierError,
  selectPurchaseById,
  selectSupplierById,
  selectPurchaseStats,
  selectIsAnyPurchaseLoading
} from '@/store/selectors/purchaseSelectors'
import type { Purchase, CreatePurchaseRequest, PurchaseFilters } from '../types'

interface UsePurchasesOptions {
  autoLoad?: boolean
  initialFilters?: PurchaseFilters
  pageSize?: number
}

interface UsePurchasesReturn {
  // Data
  purchases: Purchase[]
  suppliers: any[]
  loading: {
    purchases: boolean
    suppliers: boolean
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

  // Actions
  loadPurchases: (page?: number, filters?: PurchaseFilters) => Promise<void>
  loadSuppliers: () => Promise<void>
  createPurchase: (data: CreatePurchaseRequest) => Promise<void>
  updatePurchase: (id: number, data: CreatePurchaseRequest) => Promise<void>
  deletePurchase: (id: number) => Promise<void>
  refreshData: () => Promise<void>

  // Filters
  filters: PurchaseFilters
  setFilters: (filters: PurchaseFilters) => void
  clearFilters: () => void

  // Utility functions
  getPurchaseById: (id: number) => Purchase | undefined
  getSupplierById: (id: number) => any | undefined
  searchPurchases: (query: string) => Promise<void>
  filterByStatus: (status: Purchase['status']) => Promise<void>
  filterBySupplier: (supplierId: number) => Promise<void>

  // Statistics
  stats: any
  clearError: () => void
  forceResetLoadingStates: () => void
}

export const usePurchasesRedux = (options: UsePurchasesOptions = {}): UsePurchasesReturn => {
  const { autoLoad = false, initialFilters = {}, pageSize = 15 } = options

  const dispatch = useAppDispatch()

  // Check authentication status
  const { isAuthenticated } = useAppSelector(state => state.auth)

  // Use ref to track if data has been loaded
  const hasLoadedData = useRef(false)

  // Selectors
  const purchases = useAppSelector(selectPurchases) || []
  const purchaseLoading = useAppSelector(selectPurchaseLoading)
  const purchaseError = useAppSelector(selectPurchaseError)
  const filters = useAppSelector(selectPurchaseFilters)
  const pagination = useAppSelector(selectPurchasePagination)

  const suppliers = useAppSelector(selectSuppliers) || []
  const supplierLoading = useAppSelector(selectSupplierLoading)
  const supplierError = useAppSelector(selectSupplierError)

  const stats = useAppSelector(selectPurchaseStats)
  const isAnyLoading = useAppSelector(selectIsAnyPurchaseLoading)

  // Actions
  const loadPurchases = useCallback(
    async (page: number = 1, newFilters?: PurchaseFilters) => {
      // Use the provided filters or get current state directly
      const currentFilters = newFilters || filters
      await dispatch(
        fetchPurchases({
          page,
          filters: currentFilters,
          pageSize
        })
      ).unwrap()
    },
    [dispatch, pageSize] // Removed filters dependency
  )

  const loadSuppliers = useCallback(async () => {
    await dispatch(fetchSuppliers({ page: 1, filters: {}, pageSize: 50 })).unwrap()
  }, [dispatch])

  const createPurchase = useCallback(
    async (data: CreatePurchaseRequest) => {
      await dispatch(createPurchaseAction(data)).unwrap()
    },
    [dispatch]
  )

  const updatePurchase = useCallback(
    async (id: number, data: CreatePurchaseRequest) => {
      try {
        const result = await dispatch(updatePurchaseAction({ id, data })).unwrap()
      } catch (error) {
        dispatch(resetLoadingStates())
        throw error
      }
    },
    [dispatch]
  )

  const forceResetLoadingStates = useCallback(() => {
    dispatch(resetLoadingStates())
  }, [dispatch])

  const deletePurchase = useCallback(
    async (id: number) => {
      await dispatch(deletePurchaseAction(id)).unwrap()
    },
    [dispatch]
  )

  const refreshData = useCallback(async () => {
    await Promise.all([
      dispatch(
        fetchPurchases({
          page: pagination.currentPage,
          filters,
          pageSize
        })
      ).unwrap(),
      dispatch(fetchSuppliers({ page: 1, filters: {}, pageSize: 50 })).unwrap()
    ])
  }, [dispatch, pagination.currentPage, pageSize]) // Removed filters dependency

  const updateFilters = useCallback(
    (newFilters: PurchaseFilters) => {
      dispatch(setFilters(newFilters))
    },
    [dispatch]
  )

  const clearFiltersAction = useCallback(() => {
    dispatch(clearFilters())
  }, [dispatch])

  const getPurchaseById = useCallback(
    (id: number) => {
      return purchases.find(purchase => purchase.id === id)
    },
    [purchases]
  )

  const getSupplierById = useCallback(
    (id: number) => {
      return suppliers.find(supplier => supplier.id === id)
    },
    [suppliers]
  )

  const searchPurchasesAction = useCallback(
    async (query: string) => {
      await dispatch(searchPurchases({ query, filters })).unwrap()
    },
    [dispatch] // Removed filters dependency
  )

  const filterByStatus = useCallback(
    async (status: Purchase['status']) => {
      const newFilters = { ...filters, status }
      dispatch(setFilters(newFilters))
      await dispatch(
        fetchPurchases({
          page: 1,
          filters: newFilters,
          pageSize
        })
      ).unwrap()
    },
    [dispatch, pageSize] // Removed filters dependency
  )

  const filterBySupplier = useCallback(
    async (supplierId: number) => {
      const newFilters = { ...filters, supplier_id: supplierId }
      dispatch(setFilters(newFilters))
      await dispatch(
        fetchPurchases({
          page: 1,
          filters: newFilters,
          pageSize
        })
      ).unwrap()
    },
    [dispatch, pageSize] // Removed filters dependency
  )

  const clearError = useCallback(() => {
    dispatch(clearPurchaseError())
    dispatch(clearSupplierError())
  }, [dispatch])

  // Memoize initialFilters to prevent object recreation
  const memoizedInitialFilters = useMemo(() => initialFilters, [JSON.stringify(initialFilters)])

  // Auto-load on mount - only once
  useEffect(() => {
    if (autoLoad && isAuthenticated && !hasLoadedData.current) {
      hasLoadedData.current = true

      // Set initial filters
      if (Object.keys(memoizedInitialFilters).length > 0) {
        dispatch(setFilters(memoizedInitialFilters))
      }

      // Load data directly with dispatch, not through callbacks
      dispatch(
        fetchPurchases({
          page: 1,
          filters: memoizedInitialFilters,
          pageSize
        })
      )

      dispatch(fetchSuppliers({ page: 1, filters: {}, pageSize: 50 }))
    }
  }, [autoLoad, isAuthenticated, dispatch, pageSize, memoizedInitialFilters])

  // Combined error handling
  const combinedError = purchaseError || supplierError

  return {
    // Data
    purchases,
    suppliers,
    loading: {
      purchases: purchaseLoading.list,
      suppliers: supplierLoading, // supplierLoading es un boolean, no un objeto
      creating: purchaseLoading.create,
      updating: purchaseLoading.update,
      deleting: purchaseLoading.delete,
      searching: purchaseLoading.search,
      any: isAnyLoading
    },
    error: combinedError,

    // Pagination
    pagination,

    // Actions
    loadPurchases,
    loadSuppliers,
    createPurchase,
    updatePurchase,
    deletePurchase,
    refreshData,

    // Filters
    filters,
    setFilters: updateFilters,
    clearFilters: clearFiltersAction,

    // Utility functions
    getPurchaseById,
    getSupplierById,
    searchPurchases: searchPurchasesAction,
    filterByStatus,
    filterBySupplier,

    // Statistics
    stats,
    clearError,
    forceResetLoadingStates
  }
}
