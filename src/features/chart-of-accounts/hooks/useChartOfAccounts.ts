// features/chart-of-accounts/hooks/useChartOfAccounts.ts
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/shared/hooks/redux'
import {
  fetchChartOfAccounts,
  createChartOfAccount as createChartOfAccountAction,
  updateChartOfAccount as updateChartOfAccountAction,
  deleteChartOfAccount as deleteChartOfAccountAction,
  searchChartOfAccounts,
  setFilters,
  clearFilters,
  clearError as clearChartOfAccountError,
  resetChartOfAccounts,
  resetLoadingStates
} from '@/store/slices/chartOfAccountsSlice'
import {
  selectChartOfAccounts,
  selectChartOfAccountsLoading,
  selectChartOfAccountsError,
  selectChartOfAccountsValidationErrors,
  selectChartOfAccountsFilters,
  selectChartOfAccountsPagination,
  selectChartOfAccountById,
  selectChartOfAccountsStats,
  selectIsAnyChartOfAccountLoading,
  selectRootChartOfAccounts,
  selectChildChartOfAccounts,
  selectChartOfAccountsByType,
  selectActiveChartOfAccounts,
  selectChartOfAccountsByLevel,
  selectFilteredChartOfAccounts
} from '@/store/selectors/chartOfAccountsSelectors'
import type { ChartOfAccount, CreateChartOfAccountRequest, ChartOfAccountFilters } from '../types'

interface UseChartOfAccountsOptions {
  autoLoad?: boolean
  initialFilters?: ChartOfAccountFilters
  pageSize?: number
}

interface UseChartOfAccountsReturn {
  // Data
  accounts: ChartOfAccount[]
  loading: {
    accounts: boolean
    creating: boolean
    updating: boolean
    deleting: boolean
    searching: boolean
    any: boolean
  }
  error: string | null
  validationErrors: Record<string, string[]> | null

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
  loadAccounts: (page?: number, filters?: ChartOfAccountFilters) => Promise<void>
  createAccount: (data: CreateChartOfAccountRequest) => Promise<void>
  updateAccount: (id: number, data: CreateChartOfAccountRequest) => Promise<void>
  deleteAccount: (id: number) => Promise<void>
  refreshData: () => Promise<void>

  // Filters
  filters: ChartOfAccountFilters
  setFilters: (filters: ChartOfAccountFilters) => void
  clearFilters: () => void

  // Utility functions
  getAccountById: (id: number) => ChartOfAccount | undefined
  searchAccounts: (query: string) => Promise<void>
  filterByType: (accountType: string) => Promise<void>
  filterByLevel: (level: number) => Promise<void>
  filterByStatus: (isActive: boolean) => Promise<void>
  filterByParent: (parentId: number | null) => Promise<void>

  // Hierarchical data
  rootAccounts: ChartOfAccount[]
  getChildAccounts: (parentId: number) => ChartOfAccount[]
  getAccountsByType: (accountType: string) => ChartOfAccount[]
  getAccountsByLevel: (level: number) => ChartOfAccount[]
  getActiveAccounts: () => ChartOfAccount[]
  getFilteredAccounts: () => ChartOfAccount[]

  // Statistics
  stats: {
    total: number
    active: number
    inactive: number
    byType: Record<string, number>
    byLevel: Record<number, number>
  }
  clearError: () => void
  forceResetLoadingStates: () => void
}

export const useChartOfAccounts = (options: UseChartOfAccountsOptions = {}): UseChartOfAccountsReturn => {
  const { autoLoad = false, initialFilters = {}, pageSize: initialPageSize = 15 } = options

  const dispatch = useAppDispatch()

  // Check authentication status
  const { isAuthenticated } = useAppSelector(state => state.auth)

  // Use ref to track if data has been loaded and current pageSize
  const hasLoadedData = useRef(false)
  const currentPageSize = useRef(initialPageSize)

  // Selectors
  const accounts = useAppSelector(selectChartOfAccounts) || []
  const loading = useAppSelector(selectChartOfAccountsLoading)
  const error = useAppSelector(selectChartOfAccountsError)
  const validationErrors = useAppSelector(selectChartOfAccountsValidationErrors)
  const filters = useAppSelector(selectChartOfAccountsFilters)
  const pagination = useAppSelector(selectChartOfAccountsPagination)
  const stats = useAppSelector(selectChartOfAccountsStats)
  const isAnyLoading = useAppSelector(selectIsAnyChartOfAccountLoading)

  // Hierarchical selectors
  const rootAccounts = useAppSelector(selectRootChartOfAccounts)
  const activeAccounts = useAppSelector(selectActiveChartOfAccounts)
  const filteredAccounts = useAppSelector(selectFilteredChartOfAccounts)

  // Memoize filters to prevent infinite loops
  const memoizedFilters = useMemo(() => filters, [JSON.stringify(filters)])

  // Actions
  const loadAccounts = useCallback(
    async (page: number = 1, newFilters?: ChartOfAccountFilters, newPageSize?: number) => {
      const currentFilters = newFilters || memoizedFilters
      const pageSizeToUse = newPageSize || currentPageSize.current
      if (newPageSize) {
        currentPageSize.current = newPageSize
      }

      await dispatch(
        fetchChartOfAccounts({
          page,
          filters: currentFilters,
          pageSize: pageSizeToUse
        })
      ).unwrap()
    },
    [dispatch, memoizedFilters]
  )

  const createAccount = useCallback(
    async (data: CreateChartOfAccountRequest) => {
      await dispatch(createChartOfAccountAction(data)).unwrap()
    },
    [dispatch]
  )

  const updateAccount = useCallback(
    async (id: number, data: CreateChartOfAccountRequest) => {
      await dispatch(updateChartOfAccountAction({ id, data })).unwrap()
    },
    [dispatch]
  )

  const deleteAccount = useCallback(
    async (id: number) => {
      await dispatch(deleteChartOfAccountAction(id)).unwrap()
    },
    [dispatch]
  )

  const refreshData = useCallback(async () => {
    await dispatch(
      fetchChartOfAccounts({
        page: pagination.currentPage,
        filters: memoizedFilters,
        pageSize: currentPageSize.current
      })
    ).unwrap()
  }, [dispatch, pagination.currentPage, memoizedFilters])

  const updateFilters = useCallback(
    (newFilters: ChartOfAccountFilters) => {
      dispatch(setFilters(newFilters))
    },
    [dispatch]
  )

  const clearFiltersAction = useCallback(() => {
    dispatch(clearFilters())
  }, [dispatch])

  const getAccountById = useCallback(
    (id: number) => {
      return accounts.find(account => account.id === id)
    },
    [accounts]
  )

  const searchAccountsAction = useCallback(
    async (query: string) => {
      await dispatch(searchChartOfAccounts({ query, filters: memoizedFilters })).unwrap()
    },
    [dispatch, memoizedFilters]
  )

  const filterByType = useCallback(
    async (accountType: string) => {
      const currentFilters = memoizedFilters
      const newFilters = { ...currentFilters, account_type: accountType }
      dispatch(setFilters(newFilters))
      await dispatch(
        fetchChartOfAccounts({
          page: 1,
          filters: newFilters,
          pageSize: currentPageSize.current
        })
      ).unwrap()
    },
    [dispatch, memoizedFilters]
  )

  const filterByLevel = useCallback(
    async (level: number) => {
      const currentFilters = memoizedFilters
      const newFilters = { ...currentFilters, level }
      dispatch(setFilters(newFilters))
      await dispatch(
        fetchChartOfAccounts({
          page: 1,
          filters: newFilters,
          pageSize: currentPageSize.current
        })
      ).unwrap()
    },
    [dispatch, memoizedFilters]
  )

  const filterByStatus = useCallback(
    async (isActive: boolean) => {
      const currentFilters = memoizedFilters
      const newFilters = { ...currentFilters, is_active: isActive }
      dispatch(setFilters(newFilters))
      await dispatch(
        fetchChartOfAccounts({
          page: 1,
          filters: newFilters,
          pageSize: currentPageSize.current
        })
      ).unwrap()
    },
    [dispatch, memoizedFilters]
  )

  const filterByParent = useCallback(
    async (parentId: number | null) => {
      const currentFilters = memoizedFilters
      const newFilters = {
        ...currentFilters,
        parent_account_id: parentId === null ? undefined : parentId
      }
      dispatch(setFilters(newFilters))
      await dispatch(
        fetchChartOfAccounts({
          page: 1,
          filters: newFilters,
          pageSize: currentPageSize.current
        })
      ).unwrap()
    },
    [dispatch, memoizedFilters]
  )

  const forceResetLoadingStates = useCallback(() => {
    dispatch(resetLoadingStates())
  }, [dispatch])

  const clearError = useCallback(() => {
    dispatch(clearChartOfAccountError())
  }, [dispatch])

  // Hierarchical utility functions
  const getChildAccounts = useCallback(
    (parentId: number) => {
      return accounts.filter(account => account.parent_account_id === parentId)
    },
    [accounts]
  )

  const getAccountsByType = useCallback(
    (accountType: string) => {
      return accounts.filter(account => account.account_type === accountType)
    },
    [accounts]
  )

  const getAccountsByLevel = useCallback(
    (level: number) => {
      return accounts.filter(account => account.level === level)
    },
    [accounts]
  )

  const getActiveAccounts = useCallback(() => {
    return activeAccounts
  }, [activeAccounts])

  const getFilteredAccounts = useCallback(() => {
    return filteredAccounts
  }, [filteredAccounts])

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
        fetchChartOfAccounts({
          page: 1,
          filters: memoizedInitialFilters,
          pageSize: currentPageSize.current
        })
      )
    }
  }, [autoLoad, isAuthenticated, dispatch, memoizedInitialFilters])

  return {
    // Data
    accounts,
    loading: {
      accounts: loading.list,
      creating: loading.create,
      updating: loading.update,
      deleting: loading.delete,
      searching: loading.search,
      any: isAnyLoading
    },
    error,
    validationErrors,

    // Pagination
    pagination,

    // Actions
    loadAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    refreshData,

    // Filters
    filters,
    setFilters: updateFilters,
    clearFilters: clearFiltersAction,

    // Utility functions
    getAccountById,
    searchAccounts: searchAccountsAction,
    filterByType,
    filterByLevel,
    filterByStatus,
    filterByParent,

    // Hierarchical data
    rootAccounts,
    getChildAccounts,
    getAccountsByType,
    getAccountsByLevel,
    getActiveAccounts,
    getFilteredAccounts,

    // Statistics
    stats,
    clearError,
    forceResetLoadingStates
  }
}
