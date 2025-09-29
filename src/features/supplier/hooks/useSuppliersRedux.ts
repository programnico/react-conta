// features/supplier/hooks/useSuppliersRedux.ts
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/shared/hooks/redux'
import {
  fetchSuppliers,
  createSupplier as createSupplierAction,
  updateSupplier as updateSupplierAction,
  deleteSupplier as deleteSupplierAction,
  searchSuppliers,
  setSupplierFilters,
  clearSupplierFilters,
  clearSupplierError,
  resetSuppliers,
  resetSupplierLoadingStates
} from '@/store/slices/supplierSlice'
import {
  selectSuppliers,
  selectSupplierLoading,
  selectSupplierError,
  selectSupplierFilters,
  selectSupplierPagination,
  selectSupplierById,
  selectSupplierStats,
  selectIsAnySupplierLoading
} from '@/store/selectors/supplierSelectors'
import type { Supplier, CreateSupplierRequest, SupplierFilters } from '../types'

interface UseSuppliersOptions {
  autoLoad?: boolean
  initialFilters?: SupplierFilters
  pageSize?: number
}

interface UseSuppliersReturn {
  // Data
  suppliers: Supplier[]
  loading: {
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
  loadSuppliers: (page?: number, filters?: SupplierFilters) => Promise<void>
  createSupplier: (data: CreateSupplierRequest) => Promise<void>
  updateSupplier: (id: number, data: CreateSupplierRequest) => Promise<void>
  deleteSupplier: (id: number) => Promise<void>
  refreshData: () => Promise<void>

  // Filters
  filters: SupplierFilters
  setFilters: (filters: SupplierFilters) => void
  clearFilters: () => void

  // Utility functions
  getSupplierById: (id: number) => Supplier | undefined
  searchSuppliers: (query: string) => Promise<void>
  filterByType: (type: 'local' | 'foreign') => Promise<void>
  filterByClassification: (classification: string) => Promise<void>
  filterByStatus: (isActive: boolean) => Promise<void>

  // Statistics
  stats: any
  clearError: () => void
  forceResetLoadingStates: () => void
}

export const useSuppliersRedux = (options: UseSuppliersOptions = {}): UseSuppliersReturn => {
  const { autoLoad = false, initialFilters = {}, pageSize = 15 } = options

  const dispatch = useAppDispatch()

  // Check authentication status
  const { isAuthenticated } = useAppSelector(state => state.auth)

  // Use ref to track if data has been loaded
  const hasLoadedData = useRef(false)

  // Selectors
  const suppliers = useAppSelector(selectSuppliers) || []
  const supplierLoading = useAppSelector(selectSupplierLoading)
  const supplierError = useAppSelector(selectSupplierError)
  const filters = useAppSelector(selectSupplierFilters)
  const pagination = useAppSelector(selectSupplierPagination) || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 15,
    hasNextPage: false,
    hasPreviousPage: false
  }
  const stats = useAppSelector(selectSupplierStats)
  const isAnyLoading = useAppSelector(selectIsAnySupplierLoading)

  // Actions
  const loadSuppliers = useCallback(
    async (page: number = 1, newFilters?: SupplierFilters) => {
      const currentFilters = newFilters || filters
      await dispatch(
        fetchSuppliers({
          page,
          filters: currentFilters,
          pageSize
        })
      ).unwrap()
    },
    [dispatch, pageSize, filters]
  )

  const createSupplier = useCallback(
    async (data: CreateSupplierRequest) => {
      try {
        await dispatch(createSupplierAction(data)).unwrap()
      } catch (error) {
        dispatch(resetSupplierLoadingStates())
        throw error
      }
    },
    [dispatch]
  )

  const updateSupplier = useCallback(
    async (id: number, data: CreateSupplierRequest) => {
      try {
        await dispatch(updateSupplierAction({ id, data })).unwrap()
      } catch (error) {
        dispatch(resetSupplierLoadingStates())
        throw error
      }
    },
    [dispatch]
  )

  const deleteSupplier = useCallback(
    async (id: number) => {
      await dispatch(deleteSupplierAction(id)).unwrap()
    },
    [dispatch]
  )

  const refreshData = useCallback(async () => {
    await loadSuppliers(pagination.currentPage, filters)
  }, [loadSuppliers, pagination.currentPage, filters])

  // Filter actions
  const updateFilters = useCallback(
    (newFilters: SupplierFilters) => {
      dispatch(setSupplierFilters(newFilters))
    },
    [dispatch]
  )

  const clearFiltersAction = useCallback(() => {
    dispatch(clearSupplierFilters())
  }, [dispatch])

  // Utility functions
  const getSupplierById = useCallback(
    (id: number) => {
      return suppliers.find(supplier => supplier.id === id)
    },
    [suppliers]
  )

  const searchSuppliersAction = useCallback(
    async (query: string) => {
      await dispatch(
        searchSuppliers({
          query,
          filters: {}
        })
      ).unwrap()
    },
    [dispatch]
  )

  const filterByType = useCallback(
    async (type: 'local' | 'foreign') => {
      const newFilters = { ...filters, type }
      dispatch(setSupplierFilters(newFilters))
      await dispatch(
        fetchSuppliers({
          page: 1,
          filters: newFilters,
          pageSize
        })
      ).unwrap()
    },
    [dispatch, pageSize]
  )

  const filterByClassification = useCallback(
    async (classification: string) => {
      const newFilters = { ...filters, classification: classification as any }
      dispatch(setSupplierFilters(newFilters))
      await dispatch(
        fetchSuppliers({
          page: 1,
          filters: newFilters,
          pageSize
        })
      ).unwrap()
    },
    [dispatch, pageSize]
  )

  const filterByStatus = useCallback(
    async (isActive: boolean) => {
      const newFilters = { ...filters, is_active: isActive }
      dispatch(setSupplierFilters(newFilters))
      await dispatch(
        fetchSuppliers({
          page: 1,
          filters: newFilters,
          pageSize
        })
      ).unwrap()
    },
    [dispatch, pageSize]
  )

  const forceResetLoadingStates = useCallback(() => {
    dispatch(resetSupplierLoadingStates())
  }, [dispatch])

  const clearError = useCallback(() => {
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
        dispatch(setSupplierFilters(memoizedInitialFilters))
      }

      // Load data directly with dispatch
      dispatch(
        fetchSuppliers({
          page: 1,
          filters: memoizedInitialFilters,
          pageSize
        })
      )
    }
  }, [autoLoad, isAuthenticated, dispatch, pageSize, memoizedInitialFilters])

  return {
    // Data
    suppliers,
    loading: {
      suppliers: supplierLoading.list,
      creating: supplierLoading.create,
      updating: supplierLoading.update,
      deleting: supplierLoading.delete,
      searching: supplierLoading.search,
      any: isAnyLoading
    },
    error: supplierError,

    // Pagination
    pagination,

    // Actions
    loadSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    refreshData,

    // Filters
    filters,
    setFilters: updateFilters,
    clearFilters: clearFiltersAction,

    // Utility functions
    getSupplierById,
    searchSuppliers: searchSuppliersAction,
    filterByType,
    filterByClassification,
    filterByStatus,

    // Statistics
    stats,
    clearError,
    forceResetLoadingStates
  }
}
