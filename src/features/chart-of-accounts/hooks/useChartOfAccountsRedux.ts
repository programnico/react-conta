// features/chart-of-accounts/hooks/useChartOfAccountsRedux.ts
import { useSelector, useDispatch } from 'react-redux'
import { useCallback, useRef, useEffect } from 'react'
import { RootState, AppDispatch } from '@/store'
import {
  fetchChartOfAccounts,
  createChartOfAccount,
  updateChartOfAccount,
  deleteChartOfAccount,
  searchChartOfAccounts,
  clearError,
  clearValidationErrors,
  setSelectedAccount,
  clearSelectedAccount,
  setFilters,
  clearFilters,
  setNeedsReload,
  setCurrentPage,
  setRowsPerPage,
  resetPagination
} from '@/store/slices/chartOfAccountsSlice'
import type { ChartOfAccount, CreateChartOfAccountRequest, ChartOfAccountFilters } from '../types'

export const useChartOfAccountsRedux = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { accounts, loading, error, validationErrors, filters, selectedAccount, needsReload, pagination, meta } =
    useSelector((state: RootState) => state.chartOfAccounts)

  // Use refs to capture current values without causing re-renders
  const paginationRef = useRef(pagination)
  const filtersRef = useRef(filters)

  // Update refs when values change
  useEffect(() => {
    paginationRef.current = pagination
  }, [pagination])

  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  // Action creators - STABLE function to prevent infinite loops
  const loadAccounts = useCallback(
    (explicitFilters?: ChartOfAccountFilters) => {
      // Use current values from refs
      const { currentPage, rowsPerPage } = paginationRef.current

      // Use explicitly passed filters, or fallback to current Redux filters
      const filtersToUse = explicitFilters !== undefined ? explicitFilters : filtersRef.current

      return dispatch(
        fetchChartOfAccounts({
          page: currentPage,
          pageSize: rowsPerPage,
          filters: filtersToUse
        })
      )
    },
    [dispatch] // Only dispatch as dependency - access pagination and filters via refs
  )

  const createNewAccount = (accountData: CreateChartOfAccountRequest) => {
    return dispatch(createChartOfAccount(accountData))
  }

  const updateExistingAccount = (accountData: { id: number; data: CreateChartOfAccountRequest }) => {
    return dispatch(updateChartOfAccount(accountData))
  }

  const deleteExistingAccount = (accountId: number) => {
    return dispatch(deleteChartOfAccount(accountId))
  }

  const searchAccountsAction = (params: { query: string; filters?: ChartOfAccountFilters; pageSize?: number }) => {
    return dispatch(searchChartOfAccounts(params))
  }

  const clearErrorAction = () => {
    dispatch(clearError())
  }

  const clearValidationErrorsAction = () => {
    dispatch(clearValidationErrors())
  }

  const setSelectedAccountAction = (account: ChartOfAccount | null) => {
    dispatch(setSelectedAccount(account))
  }

  const clearSelectedAccountAction = () => {
    dispatch(clearSelectedAccount())
  }

  const setFiltersAction = (newFilters: ChartOfAccountFilters) => {
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
    accounts,
    loading,
    error,
    validationErrors,
    filters,
    selectedAccount,
    needsReload,
    pagination,
    meta,

    // Actions
    loadAccounts,
    createAccount: createNewAccount,
    updateAccount: updateExistingAccount,
    deleteAccount: deleteExistingAccount,
    searchAccounts: searchAccountsAction,
    clearError: clearErrorAction,
    clearValidationErrors: clearValidationErrorsAction,
    setSelectedAccount: setSelectedAccountAction,
    clearSelectedAccount: clearSelectedAccountAction,
    setFilters: setFiltersAction,
    clearFilters: clearFiltersAction,
    setNeedsReload: setNeedsReloadAction,
    setCurrentPage: setCurrentPageAction,
    setRowsPerPage: setRowsPerPageAction,
    resetPagination: resetPaginationAction
  }
}
