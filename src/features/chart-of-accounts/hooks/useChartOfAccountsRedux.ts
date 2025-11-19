// features/chart-of-accounts/hooks/useChartOfAccountsRedux.ts
import { useSelector, useDispatch } from 'react-redux'
import { useCallback, useEffect } from 'react'
import { RootState, AppDispatch } from '@/store'
import {
  fetchChartOfAccounts,
  createChartOfAccount,
  updateChartOfAccount,
  deleteChartOfAccount,
  searchChartOfAccounts,
  initializeState,
  clearError,
  clearValidationErrors,
  setSelectedAccount,
  clearSelectedAccount,
  setFilters,
  clearFilters,
  setNeedsReload,
  setCurrentPage,
  setRowsPerPage,
  resetPagination,
  openForm,
  closeForm
} from '@/store/slices/chartOfAccountsSlice'
import type { ChartOfAccount, CreateChartOfAccountRequest, ChartOfAccountFilters } from '../types'

export const useChartOfAccountsRedux = () => {
  const dispatch = useDispatch<AppDispatch>()
  const state = useSelector((state: RootState) => state.chartOfAccounts)

  // Initialize state on mount to ensure all properties exist
  useEffect(() => {
    dispatch(initializeState())
  }, [dispatch])

  const {
    accounts,
    loading,
    error,
    validationErrors,
    filters,
    selectedAccount,
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
  const loadAccounts = useCallback(
    (params?: { [key: string]: any }) => {
      const { page, per_page, pageSize, ...filterParams } = params || {}

      return dispatch(
        fetchChartOfAccounts({
          page: page || 1,
          pageSize: per_page || pageSize || 15,
          filters: filterParams as ChartOfAccountFilters
        })
      )
    },
    [dispatch]
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

  // Form actions
  const openFormAction = useCallback(
    (mode: 'create' | 'edit', account?: ChartOfAccount) => {
      dispatch(openForm({ mode, account }))
    },
    [dispatch]
  )

  const closeFormAction = useCallback(() => {
    dispatch(closeForm())
  }, [dispatch])

  return {
    // State
    accounts,
    loading,
    loadingStates,
    error,
    validationErrors,
    filters,
    selectedAccount,
    needsReload,
    pagination,
    isFormOpen,
    formMode,

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
    resetPagination: resetPaginationAction,
    openForm: openFormAction,
    closeForm: closeFormAction
  }
}
