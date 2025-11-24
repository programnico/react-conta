// store/slices/establishmentSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import { establishmentService } from '@/features/establishment/services/establishmentService'
import type {
  Establishment,
  EstablishmentsApiResponse,
  EstablishmentsApiClientResponse,
  CreateEstablishmentRequest,
  EstablishmentFilters
} from '@/features/establishment/types'

// Async thunks
export const fetchEstablishments = createAsyncThunk<
  EstablishmentsApiResponse | EstablishmentsApiClientResponse,
  { page?: number; filters?: EstablishmentFilters; pageSize?: number }
>('establishments/fetchEstablishments', async (params, { rejectWithValue }) => {
  try {
    const { page = 1, filters = {}, pageSize = 15 } = params
    const response = await establishmentService.getAll({
      page,
      per_page: pageSize,
      ...filters
    })
    return response
  } catch (error: any) {
    console.error('Error fetching establishments:', error)
    return rejectWithValue(error.message || 'Error al obtener establecimientos')
  }
})

export const createEstablishment = createAsyncThunk(
  'establishments/createEstablishment',
  async (data: CreateEstablishmentRequest, { rejectWithValue }) => {
    try {
      const establishment = await establishmentService.create(data)
      return establishment
    } catch (error: any) {
      if (error.errors) {
        return rejectWithValue({
          message: error.message || 'Error al crear establecimiento',
          validationErrors: error.errors
        })
      }
      return rejectWithValue({
        message: error.message || 'Error al crear establecimiento',
        validationErrors: null
      })
    }
  }
)

export const updateEstablishment = createAsyncThunk(
  'establishments/updateEstablishment',
  async ({ id, data }: { id: number; data: CreateEstablishmentRequest }, { rejectWithValue }) => {
    try {
      const establishment = await establishmentService.update(id, data)
      return establishment
    } catch (error: any) {
      if (error.errors) {
        return rejectWithValue({
          message: error.message || 'Error al actualizar establecimiento',
          validationErrors: error.errors
        })
      }
      return rejectWithValue({
        message: error.message || 'Error al actualizar establecimiento',
        validationErrors: null
      })
    }
  }
)

export const deleteEstablishment = createAsyncThunk(
  'establishments/deleteEstablishment',
  async (id: number, { rejectWithValue }) => {
    try {
      await establishmentService.delete(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error al eliminar establecimiento')
    }
  }
)

export const searchEstablishments = createAsyncThunk<
  EstablishmentsApiResponse | EstablishmentsApiClientResponse,
  { query: string; filters?: EstablishmentFilters; pageSize?: number }
>('establishments/searchEstablishments', async (params, { rejectWithValue }) => {
  try {
    const { query, filters = {}, pageSize = 15 } = params
    const searchFilters = {
      ...filters,
      per_page: pageSize
    }
    const response = await establishmentService.search(query, searchFilters)
    return response
  } catch (error: any) {
    return rejectWithValue(error.message || 'Error al buscar establecimientos')
  }
})

// Helper function para extraer datos de paginación
const extractPaginationData = (payload: EstablishmentsApiResponse | EstablishmentsApiClientResponse) => {
  if ('status' in payload && 'data' in payload && payload.data && typeof payload.data === 'object') {
    return payload.data
  } else if ('current_page' in payload && 'data' in payload) {
    return payload
  }
  return null
}

// Initial state
interface EstablishmentState {
  establishments: Establishment[]
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
  filters: EstablishmentFilters
  selectedEstablishment: Establishment | null
  needsReload: boolean
  isFormOpen: boolean
  formMode: 'create' | 'edit'
  pagination: {
    currentPage: number
    rowsPerPage: number
    totalPages: number
    totalRecords: number
    from: number
    to: number
  }
}

const initialState: EstablishmentState = {
  establishments: [],
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
  selectedEstablishment: null,
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
const establishmentSlice = createSlice({
  name: 'establishments',
  initialState,
  reducers: {
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
    setSelectedEstablishment: (state, action: PayloadAction<Establishment | null>) => {
      state.selectedEstablishment = action.payload
    },
    clearSelectedEstablishment: state => {
      state.selectedEstablishment = null
    },
    setFilters: (state, action: PayloadAction<EstablishmentFilters>) => {
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
    openForm: (state, action: PayloadAction<{ mode: 'create' | 'edit'; establishment?: Establishment }>) => {
      state.isFormOpen = true
      state.formMode = action.payload.mode
      if (action.payload.mode === 'edit' && action.payload.establishment) {
        state.selectedEstablishment = action.payload.establishment
      } else {
        state.selectedEstablishment = null
      }
    },
    closeForm: state => {
      state.isFormOpen = false
      state.selectedEstablishment = null
    }
  },
  extraReducers: builder => {
    builder
      // Fetch establishments
      .addCase(fetchEstablishments.pending, state => {
        state.loading = true
        if (state.loadingStates) {
          state.loadingStates.fetching = true
        }
        state.error = null
      })
      .addCase(fetchEstablishments.fulfilled, (state, action) => {
        state.loading = false
        if (state.loadingStates) {
          state.loadingStates.fetching = false
        }
        state.needsReload = false

        const paginationData = extractPaginationData(action.payload)

        if (paginationData && 'data' in paginationData && Array.isArray(paginationData.data)) {
          state.establishments = paginationData.data

          state.pagination = {
            currentPage: paginationData.current_page || 1,
            rowsPerPage: paginationData.per_page || 15,
            totalPages: paginationData.last_page || 1,
            totalRecords: paginationData.total || 0,
            from: paginationData.from || 0,
            to: paginationData.to || 0
          }
        } else {
          console.error('Unexpected establishments response structure:', action.payload)
          state.establishments = []
          state.pagination = {
            ...state.pagination,
            totalPages: 1,
            totalRecords: 0,
            from: 0,
            to: 0
          }
        }
      })
      .addCase(fetchEstablishments.rejected, (state, action) => {
        state.loading = false
        if (state.loadingStates) {
          state.loadingStates.fetching = false
        }
        state.error = action.payload as string
      })
      // Create establishment
      .addCase(createEstablishment.pending, state => {
        if (state.loadingStates) {
          state.loadingStates.creating = true
        }
        state.error = null
        state.validationErrors = null
      })
      .addCase(createEstablishment.fulfilled, (state, action) => {
        if (state.loadingStates) {
          state.loadingStates.creating = false
        }
        state.error = null
        state.validationErrors = null
        state.needsReload = true
      })
      .addCase(createEstablishment.rejected, (state, action) => {
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
      // Update establishment
      .addCase(updateEstablishment.pending, state => {
        if (state.loadingStates) {
          state.loadingStates.updating = true
        }
        state.error = null
        state.validationErrors = null
      })
      .addCase(updateEstablishment.fulfilled, (state, action) => {
        if (state.loadingStates) {
          state.loadingStates.updating = false
        }
        state.error = null
        state.validationErrors = null
        state.needsReload = true
      })
      .addCase(updateEstablishment.rejected, (state, action) => {
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
      // Delete establishment
      .addCase(deleteEstablishment.pending, state => {
        if (state.loadingStates) {
          state.loadingStates.deleting = true
        }
        state.error = null
      })
      .addCase(deleteEstablishment.fulfilled, (state, action) => {
        if (state.loadingStates) {
          state.loadingStates.deleting = false
        }
        state.needsReload = true
      })
      .addCase(deleteEstablishment.rejected, (state, action) => {
        if (state.loadingStates) {
          state.loadingStates.deleting = false
        }
        state.error = action.payload as string
      })
      // Search establishments
      .addCase(searchEstablishments.pending, state => {
        state.loading = true
        if (state.loadingStates) {
          state.loadingStates.searching = true
        }
        state.error = null
      })
      .addCase(searchEstablishments.fulfilled, (state, action) => {
        state.loading = false
        if (state.loadingStates) {
          state.loadingStates.searching = false
        }

        const paginationData = extractPaginationData(action.payload)

        if (paginationData && 'data' in paginationData && Array.isArray(paginationData.data)) {
          state.establishments = paginationData.data

          state.pagination = {
            currentPage: paginationData.current_page || 1,
            rowsPerPage: paginationData.per_page || 15,
            totalPages: paginationData.last_page || 1,
            totalRecords: paginationData.total || 0,
            from: paginationData.from || 0,
            to: paginationData.to || 0
          }
        } else {
          console.error('Unexpected search establishments response structure:', action.payload)
          state.establishments = []
          state.pagination = {
            ...state.pagination,
            totalPages: 1,
            totalRecords: 0,
            from: 0,
            to: 0
          }
        }
      })
      .addCase(searchEstablishments.rejected, (state, action) => {
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
  setSelectedEstablishment,
  clearSelectedEstablishment,
  setFilters,
  clearFilters,
  setNeedsReload,
  setCurrentPage,
  setRowsPerPage,
  resetPagination,
  updatePaginationMeta,
  openForm,
  closeForm
} = establishmentSlice.actions

export default establishmentSlice.reducer
