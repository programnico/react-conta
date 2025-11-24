// features/establishment/hooks/useEstablishmentsRedux.ts
import { useSelector, useDispatch } from 'react-redux'
import { useCallback, useEffect } from 'react'
import { RootState, AppDispatch } from '@/store'
import {
  fetchEstablishments,
  createEstablishment,
  updateEstablishment,
  deleteEstablishment,
  searchEstablishments,
  initializeState,
  clearError,
  clearValidationErrors,
  setSelectedEstablishment,
  clearSelectedEstablishment,
  setFilters,
  clearFilters,
  setNeedsReload,
  setCurrentPage,
  setRowsPerPage,
  resetPagination,
  openForm,
  closeForm
} from '@/store/slices/establishmentSlice'
import type { Establishment, CreateEstablishmentRequest, EstablishmentFilters } from '../types'

export const useEstablishmentsRedux = () => {
  const dispatch = useDispatch<AppDispatch>()
  const state = useSelector((state: RootState) => state.establishments)

  // Initialize state on mount to ensure all properties exist
  useEffect(() => {
    dispatch(initializeState())
  }, [dispatch])

  const {
    establishments,
    loading,
    error,
    validationErrors,
    filters,
    selectedEstablishment,
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
  const loadEstablishments = useCallback(
    (params?: { [key: string]: any }) => {
      const { page, per_page, pageSize, ...filterParams } = params || {}

      return dispatch(
        fetchEstablishments({
          page: page || 1,
          pageSize: per_page || pageSize || 15,
          filters: filterParams as EstablishmentFilters
        })
      )
    },
    [dispatch]
  )

  const createNewEstablishment = (establishmentData: CreateEstablishmentRequest) => {
    return dispatch(createEstablishment(establishmentData))
  }

  const updateExistingEstablishment = (establishmentData: { id: number; data: CreateEstablishmentRequest }) => {
    return dispatch(updateEstablishment(establishmentData))
  }

  const deleteExistingEstablishment = (establishmentId: number) => {
    return dispatch(deleteEstablishment(establishmentId))
  }

  const searchEstablishmentsAction = (params: { query: string; filters?: EstablishmentFilters; pageSize?: number }) => {
    return dispatch(searchEstablishments(params))
  }

  const clearErrorAction = () => {
    dispatch(clearError())
  }

  const clearValidationErrorsAction = () => {
    dispatch(clearValidationErrors())
  }

  const setSelectedEstablishmentAction = (establishment: Establishment | null) => {
    dispatch(setSelectedEstablishment(establishment))
  }

  const clearSelectedEstablishmentAction = () => {
    dispatch(clearSelectedEstablishment())
  }

  const setFiltersAction = (newFilters: EstablishmentFilters) => {
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
    (mode: 'create' | 'edit', establishment?: Establishment) => {
      dispatch(openForm({ mode, establishment }))
    },
    [dispatch]
  )

  const closeFormAction = useCallback(() => {
    dispatch(closeForm())
  }, [dispatch])

  return {
    // State
    establishments,
    loading,
    loadingStates,
    error,
    validationErrors,
    filters,
    selectedEstablishment,
    needsReload,
    pagination,
    isFormOpen,
    formMode,

    // Actions
    loadEstablishments,
    fetchEstablishments: loadEstablishments, // Alias para compatibilidad
    createEstablishment: createNewEstablishment,
    updateEstablishment: updateExistingEstablishment,
    deleteEstablishment: deleteExistingEstablishment,
    searchEstablishments: searchEstablishmentsAction,
    clearError: clearErrorAction,
    clearValidationErrors: clearValidationErrorsAction,
    setSelectedEstablishment: setSelectedEstablishmentAction,
    clearSelectedEstablishment: clearSelectedEstablishmentAction,
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
