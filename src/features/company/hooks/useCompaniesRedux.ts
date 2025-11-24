// features/company/hooks/useCompaniesRedux.ts
import { useSelector, useDispatch } from 'react-redux'
import { useCallback, useEffect } from 'react'
import { RootState, AppDispatch } from '@/store'
import {
  fetchCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  searchCompanies,
  initializeState,
  clearError,
  clearValidationErrors,
  setSelectedCompany,
  clearSelectedCompany,
  setFilters,
  clearFilters,
  setNeedsReload,
  setCurrentPage,
  setRowsPerPage,
  resetPagination,
  openForm,
  closeForm
} from '@/store/slices/companySlice'
import type { Company, CreateCompanyRequest, CompanyFilters } from '../types'

export const useCompaniesRedux = () => {
  const dispatch = useDispatch<AppDispatch>()
  const state = useSelector((state: RootState) => state.companies)

  // Initialize state on mount to ensure all properties exist
  useEffect(() => {
    dispatch(initializeState())
  }, [dispatch])

  const {
    companies,
    loading,
    error,
    validationErrors,
    filters,
    selectedCompany,
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
  const loadCompanies = useCallback(
    (params?: { [key: string]: any }) => {
      const { page, per_page, pageSize, ...filterParams } = params || {}

      return dispatch(
        fetchCompanies({
          page: page || 1,
          pageSize: per_page || pageSize || 15,
          filters: filterParams as CompanyFilters
        })
      )
    },
    [dispatch]
  )

  const createNewCompany = (companyData: CreateCompanyRequest) => {
    return dispatch(createCompany(companyData))
  }

  const updateExistingCompany = (companyData: { id: number; data: CreateCompanyRequest }) => {
    return dispatch(updateCompany(companyData))
  }

  const deleteExistingCompany = (companyId: number) => {
    return dispatch(deleteCompany(companyId))
  }

  const searchCompaniesAction = (params: { query: string; filters?: CompanyFilters; pageSize?: number }) => {
    return dispatch(searchCompanies(params))
  }

  const clearErrorAction = () => {
    dispatch(clearError())
  }

  const clearValidationErrorsAction = () => {
    dispatch(clearValidationErrors())
  }

  const setSelectedCompanyAction = (company: Company | null) => {
    dispatch(setSelectedCompany(company))
  }

  const clearSelectedCompanyAction = () => {
    dispatch(clearSelectedCompany())
  }

  const setFiltersAction = (newFilters: CompanyFilters) => {
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
    (mode: 'create' | 'edit', company?: Company) => {
      dispatch(openForm({ mode, company }))
    },
    [dispatch]
  )

  const closeFormAction = useCallback(() => {
    dispatch(closeForm())
  }, [dispatch])

  return {
    // State
    companies,
    loading,
    loadingStates,
    error,
    validationErrors,
    filters,
    selectedCompany,
    needsReload,
    pagination,
    isFormOpen,
    formMode,

    // Actions
    loadCompanies,
    fetchCompanies: loadCompanies, // Alias para compatibilidad
    createCompany: createNewCompany,
    updateCompany: updateExistingCompany,
    deleteCompany: deleteExistingCompany,
    searchCompanies: searchCompaniesAction,
    clearError: clearErrorAction,
    clearValidationErrors: clearValidationErrorsAction,
    setSelectedCompany: setSelectedCompanyAction,
    clearSelectedCompany: clearSelectedCompanyAction,
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
