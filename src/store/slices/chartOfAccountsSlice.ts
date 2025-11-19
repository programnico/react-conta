import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import { chartOfAccountsService } from '@/features/chart-of-accounts/services/chartOfAccountsService'
import type {
  ChartOfAccount,
  ChartOfAccountsApiResponse,
  ChartOfAccountsApiClientResponse,
  CreateChartOfAccountRequest,
  ChartOfAccountFilters
} from '@/features/chart-of-accounts/types'

// Async thunks
export const fetchChartOfAccounts = createAsyncThunk<
  ChartOfAccountsApiResponse | ChartOfAccountsApiClientResponse,
  { page?: number; filters?: ChartOfAccountFilters; pageSize?: number }
>('chartOfAccounts/fetchChartOfAccounts', async (params, { rejectWithValue }) => {
  try {
    const { page = 1, filters = {}, pageSize = 15 } = params
    const response = await chartOfAccountsService.getAll({
      page,
      per_page: pageSize,
      ...filters
    })
    return response
  } catch (error: any) {
    console.error('Error fetching chart of accounts:', error)
    return rejectWithValue(error.message || 'Error al obtener cuentas')
  }
})

export const createChartOfAccount = createAsyncThunk(
  'chartOfAccounts/createChartOfAccount',
  async (data: CreateChartOfAccountRequest, { rejectWithValue }) => {
    try {
      const account = await chartOfAccountsService.create(data)
      return account
    } catch (error: any) {
      // Si es un ApiError con errores de validación, los incluimos
      if (error.errors) {
        return rejectWithValue({
          message: error.message || 'Error al crear cuenta',
          validationErrors: error.errors
        })
      }
      return rejectWithValue({
        message: error.message || 'Error al crear cuenta',
        validationErrors: null
      })
    }
  }
)

export const updateChartOfAccount = createAsyncThunk(
  'chartOfAccounts/updateChartOfAccount',
  async ({ id, data }: { id: number; data: CreateChartOfAccountRequest }, { rejectWithValue }) => {
    try {
      const account = await chartOfAccountsService.update(id, data)
      return account
    } catch (error: any) {
      // Si es un ApiError con errores de validación, los incluimos
      if (error.errors) {
        return rejectWithValue({
          message: error.message || 'Error al actualizar cuenta',
          validationErrors: error.errors
        })
      }
      return rejectWithValue({
        message: error.message || 'Error al actualizar cuenta',
        validationErrors: null
      })
    }
  }
)

export const deleteChartOfAccount = createAsyncThunk(
  'chartOfAccounts/deleteChartOfAccount',
  async (id: number, { rejectWithValue }) => {
    try {
      await chartOfAccountsService.delete(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error al eliminar cuenta')
    }
  }
)

export const searchChartOfAccounts = createAsyncThunk<
  ChartOfAccountsApiResponse | ChartOfAccountsApiClientResponse,
  { query: string; filters?: ChartOfAccountFilters; pageSize?: number }
>('chartOfAccounts/searchChartOfAccounts', async (params, { rejectWithValue }) => {
  try {
    const { query, filters = {}, pageSize = 15 } = params
    const searchFilters = {
      ...filters,
      per_page: pageSize
    }
    const response = await chartOfAccountsService.search(query, searchFilters)
    return response
  } catch (error: any) {
    return rejectWithValue(error.message || 'Error al buscar cuentas')
  }
})

// Helper function para extraer datos de paginación de la respuesta
const extractPaginationData = (payload: ChartOfAccountsApiResponse | ChartOfAccountsApiClientResponse) => {
  // Caso 1: Respuesta completa del API { status, message, data: {...} }
  if ('status' in payload && 'data' in payload && payload.data && typeof payload.data === 'object') {
    return payload.data
  }
  // Caso 2: ApiClient ya extrajo 'data' - solo estructura de paginación { current_page, data: [], ... }
  else if ('current_page' in payload && 'data' in payload) {
    return payload
  }
  return null
}

// Initial state
interface ChartOfAccountsState {
  accounts: ChartOfAccount[]
  loading: boolean
  loadingStates: {
    fetching: boolean
    creating: boolean
    updating: boolean
    deleting: boolean
    searching: boolean
  }
  error: string | null
  validationErrors: Record<string, string[]> | null
  filters: ChartOfAccountFilters
  selectedAccount: ChartOfAccount | null
  needsReload: boolean
  // Estado del formulario
  isFormOpen: boolean
  formMode: 'create' | 'edit'
  // Estado de paginación unificado
  pagination: {
    currentPage: number
    rowsPerPage: number
    totalPages: number
    totalRecords: number
    from: number
    to: number
  }
}

const initialState: ChartOfAccountsState = {
  accounts: [],
  loading: false,
  loadingStates: {
    fetching: false,
    creating: false,
    updating: false,
    deleting: false,
    searching: false
  },
  error: null,
  validationErrors: null,
  filters: {},
  selectedAccount: null,
  needsReload: false,
  isFormOpen: false,
  formMode: 'create',
  pagination: {
    currentPage: 1,
    rowsPerPage: 15,
    totalPages: 1,
    totalRecords: 0,
    from: 0,
    to: 0
  }
}

// Slice
const chartOfAccountsSlice = createSlice({
  name: 'chartOfAccounts',
  initialState,
  reducers: {
    // Ensure state has all required properties (for migration from old stored state)
    initializeState: state => {
      if (!state.loadingStates) {
        state.loadingStates = {
          fetching: false,
          creating: false,
          updating: false,
          deleting: false,
          searching: false
        }
      }
      if (!state.pagination.totalPages) {
        state.pagination = {
          ...state.pagination,
          totalPages: 1,
          totalRecords: 0,
          from: 0,
          to: 0
        }
      }
      if (state.isFormOpen === undefined) {
        state.isFormOpen = false
        state.formMode = 'create'
      }
    },
    clearError: state => {
      state.error = null
    },
    clearValidationErrors: state => {
      state.validationErrors = null
    },
    setSelectedAccount: (state, action: PayloadAction<ChartOfAccount | null>) => {
      state.selectedAccount = action.payload
    },
    clearSelectedAccount: state => {
      state.selectedAccount = null
    },
    setFilters: (state, action: PayloadAction<ChartOfAccountFilters>) => {
      state.filters = action.payload
    },
    clearFilters: state => {
      state.filters = {}
    },
    setNeedsReload: (state, action: PayloadAction<boolean>) => {
      state.needsReload = action.payload
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload
    },
    setRowsPerPage: (state, action: PayloadAction<number>) => {
      state.pagination.rowsPerPage = action.payload
      // Resetear a página 1 cuando cambie el tamaño de página
      state.pagination.currentPage = 1
    },
    resetPagination: state => {
      state.pagination.currentPage = 1
    },
    updatePaginationMeta: (
      state,
      action: PayloadAction<{
        currentPage: number
        totalPages: number
        totalRecords: number
        from: number
        to: number
        rowsPerPage: number
      }>
    ) => {
      const { currentPage, totalPages, totalRecords, from, to, rowsPerPage } = action.payload
      state.pagination = {
        currentPage,
        rowsPerPage,
        totalPages,
        totalRecords,
        from,
        to
      }
    },
    // Form state actions
    openForm: (state, action: PayloadAction<{ mode: 'create' | 'edit'; account?: ChartOfAccount }>) => {
      state.isFormOpen = true
      state.formMode = action.payload.mode
      if (action.payload.mode === 'edit' && action.payload.account) {
        state.selectedAccount = action.payload.account
      } else {
        state.selectedAccount = null
      }
    },
    closeForm: state => {
      state.isFormOpen = false
      state.selectedAccount = null
    }
  },
  extraReducers: builder => {
    builder
      // Fetch chart of accounts
      .addCase(fetchChartOfAccounts.pending, state => {
        state.loading = true
        if (state.loadingStates) {
          state.loadingStates.fetching = true
        }
        state.error = null
      })
      .addCase(fetchChartOfAccounts.fulfilled, (state, action) => {
        state.loading = false
        if (state.loadingStates) {
          state.loadingStates.fetching = false
        }
        state.needsReload = false // Limpiar flag de recarga

        const paginationData = extractPaginationData(action.payload)

        if (paginationData && 'data' in paginationData && Array.isArray(paginationData.data)) {
          state.accounts = paginationData.data

          // Actualizar paginación unificada
          state.pagination = {
            currentPage: paginationData.current_page || 1,
            rowsPerPage: paginationData.per_page || 15,
            totalPages: paginationData.last_page || 1,
            totalRecords: paginationData.total || 0,
            from: paginationData.from || 0,
            to: paginationData.to || 0
          }
        } else {
          // Fallback
          console.error('Unexpected chart of accounts response structure:', action.payload)
          state.accounts = []
          state.pagination = {
            ...state.pagination,
            totalPages: 1,
            totalRecords: 0,
            from: 0,
            to: 0
          }
        }
      })
      .addCase(fetchChartOfAccounts.rejected, (state, action) => {
        state.loading = false
        if (state.loadingStates) {
          state.loadingStates.fetching = false
        }
        state.error = action.payload as string
      })
      // Create chart of account
      .addCase(createChartOfAccount.pending, state => {
        if (state.loadingStates) {
          state.loadingStates.creating = true
        }
        state.error = null
        state.validationErrors = null
      })
      .addCase(createChartOfAccount.fulfilled, (state, action) => {
        if (state.loadingStates) {
          state.loadingStates.creating = false
        }
        state.error = null
        state.validationErrors = null
        // Marcar que necesita recarga
        state.needsReload = true
      })
      .addCase(createChartOfAccount.rejected, (state, action) => {
        if (state.loadingStates) {
          state.loadingStates.creating = false
        }
        const payload = action.payload as any
        if (payload && typeof payload === 'object') {
          state.error = payload.message
          state.validationErrors = payload.validationErrors
        } else {
          state.error = payload as string
          state.validationErrors = null
        }
      })
      // Update chart of account
      .addCase(updateChartOfAccount.pending, state => {
        if (state.loadingStates) {
          state.loadingStates.updating = true
        }
        state.error = null
        state.validationErrors = null
      })
      .addCase(updateChartOfAccount.fulfilled, (state, action) => {
        if (state.loadingStates) {
          state.loadingStates.updating = false
        }
        state.error = null
        state.validationErrors = null
        // Marcar que necesita recarga para mantener consistencia
        state.needsReload = true
      })
      .addCase(updateChartOfAccount.rejected, (state, action) => {
        if (state.loadingStates) {
          state.loadingStates.updating = false
        }
        const payload = action.payload as any
        if (payload && typeof payload === 'object') {
          state.error = payload.message
          state.validationErrors = payload.validationErrors
        } else {
          state.error = payload as string
          state.validationErrors = null
        }
      })
      // Delete chart of account
      .addCase(deleteChartOfAccount.pending, state => {
        if (state.loadingStates) {
          state.loadingStates.deleting = true
        }
        state.error = null
      })
      .addCase(deleteChartOfAccount.fulfilled, (state, action) => {
        if (state.loadingStates) {
          state.loadingStates.deleting = false
        }
        // Marcar que necesita recarga
        state.needsReload = true
      })
      .addCase(deleteChartOfAccount.rejected, (state, action) => {
        if (state.loadingStates) {
          state.loadingStates.deleting = false
        }
        state.error = action.payload as string
      })
      // Search chart of accounts
      .addCase(searchChartOfAccounts.pending, state => {
        state.loading = true
        if (state.loadingStates) {
          state.loadingStates.searching = true
        }
        state.error = null
      })
      .addCase(searchChartOfAccounts.fulfilled, (state, action) => {
        state.loading = false
        if (state.loadingStates) {
          state.loadingStates.searching = false
        }

        const paginationData = extractPaginationData(action.payload)

        if (paginationData && 'data' in paginationData && Array.isArray(paginationData.data)) {
          state.accounts = paginationData.data

          // Actualizar paginación unificada
          state.pagination = {
            currentPage: paginationData.current_page || 1,
            rowsPerPage: paginationData.per_page || 15,
            totalPages: paginationData.last_page || 1,
            totalRecords: paginationData.total || 0,
            from: paginationData.from || 0,
            to: paginationData.to || 0
          }
        } else {
          // Fallback
          console.error('Unexpected search chart of accounts response structure:', action.payload)
          state.accounts = []
          state.pagination = {
            ...state.pagination,
            totalPages: 1,
            totalRecords: 0,
            from: 0,
            to: 0
          }
        }
      })
      .addCase(searchChartOfAccounts.rejected, (state, action) => {
        state.loading = false
        if (state.loadingStates) {
          state.loadingStates.searching = false
        }
        state.error = action.payload as string
      })
  }
})

export const {
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
  updatePaginationMeta,
  openForm,
  closeForm
} = chartOfAccountsSlice.actions

export default chartOfAccountsSlice.reducer
