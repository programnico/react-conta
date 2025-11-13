// features/supplier/hooks/useSuppliersRedux.ts
import { useSelector, useDispatch } from 'react-redux'
import { useCallback } from 'react'
import { RootState, AppDispatch } from '@/store'
import {
  fetchSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  searchSuppliers,
  clearError,
  clearValidationErrors,
  setSelectedSupplier,
  clearSelectedSupplier,
  setFilters,
  clearFilters,
  setNeedsReload,
  setCurrentPage,
  setRowsPerPage,
  resetPagination,
  openForm,
  closeForm
} from '@/store/slices/supplierSlice'
import type { Supplier, CreateSupplierRequest, SupplierFilters } from '../types'

export const useSuppliersRedux = () => {
  const dispatch = useDispatch<AppDispatch>()
  const state = useSelector((state: RootState) => state.suppliers)

  const {
    suppliers,
    loading,
    error,
    validationErrors,
    filters,
    selectedSupplier,
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
  const loadSuppliers = useCallback(
    (params?: { [key: string]: any }) => {
      const { page, per_page, pageSize, ...filterParams } = params || {}

      return dispatch(
        fetchSuppliers({
          page: page || 1,
          pageSize: per_page || pageSize || 15,
          filters: filterParams as SupplierFilters
        })
      )
    },
    [dispatch]
  )

  const createNewSupplier = (supplierData: CreateSupplierRequest) => {
    return dispatch(createSupplier(supplierData))
  }

  const updateExistingSupplier = (supplierData: { id: number; data: CreateSupplierRequest }) => {
    return dispatch(updateSupplier(supplierData))
  }

  const deleteExistingSupplier = (supplierId: number) => {
    return dispatch(deleteSupplier(supplierId))
  }

  const searchSuppliersAction = (params: { query: string; filters?: SupplierFilters; pageSize?: number }) => {
    return dispatch(searchSuppliers(params))
  }

  const clearErrorAction = () => {
    dispatch(clearError())
  }

  const clearValidationErrorsAction = () => {
    dispatch(clearValidationErrors())
  }

  const setSelectedSupplierAction = (supplier: Supplier | null) => {
    dispatch(setSelectedSupplier(supplier))
  }

  const clearSelectedSupplierAction = () => {
    dispatch(clearSelectedSupplier())
  }

  const setFiltersAction = (newFilters: SupplierFilters) => {
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
    (mode: 'create' | 'edit', supplier?: Supplier) => {
      dispatch(openForm({ mode, supplier }))
    },
    [dispatch]
  )

  const closeFormAction = useCallback(() => {
    dispatch(closeForm())
  }, [dispatch])

  return {
    // State
    suppliers,
    loading,
    loadingStates,
    error,
    validationErrors,
    filters,
    selectedSupplier,
    needsReload,
    pagination,
    isFormOpen,
    formMode,

    // Actions
    loadSuppliers,
    createSupplier: createNewSupplier,
    updateSupplier: updateExistingSupplier,
    deleteSupplier: deleteExistingSupplier,
    searchSuppliers: searchSuppliersAction,
    clearError: clearErrorAction,
    clearValidationErrors: clearValidationErrorsAction,
    setSelectedSupplier: setSelectedSupplierAction,
    clearSelectedSupplier: clearSelectedSupplierAction,
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
