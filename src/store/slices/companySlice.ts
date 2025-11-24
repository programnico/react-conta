// store/slices/companySlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import { companyService } from '@/features/company/services/companyService'
import type {
  Company,
  CompaniesApiResponse,
  CompaniesApiClientResponse,
  CreateCompanyRequest,
  CompanyFilters
} from '@/features/company/types'

// Async thunks
export const fetchCompanies = createAsyncThunk<
  CompaniesApiResponse | CompaniesApiClientResponse,
  { page?: number; filters?: CompanyFilters; pageSize?: number }
>('companies/fetchCompanies', async (params, { rejectWithValue }) => {
  try {
    const { page = 1, filters = {}, pageSize = 15 } = params
    const response = await companyService.getAll({
      page,
      per_page: pageSize,
      ...filters
    })
    return response
  } catch (error: any) {
    console.error('Error fetching companies:', error)
    return rejectWithValue(error.message || 'Error al obtener empresas')
  }
})

export const createCompany = createAsyncThunk(
  'companies/createCompany',
  async (data: CreateCompanyRequest, { rejectWithValue }) => {
    try {
      const company = await companyService.create(data)
      return company
    } catch (error: any) {
      if (error.errors) {
        return rejectWithValue({
          message: error.message || 'Error al crear empresa',
          validationErrors: error.errors
        })
      }
      return rejectWithValue({
        message: error.message || 'Error al crear empresa',
        validationErrors: null
      })
    }
  }
)

export const updateCompany = createAsyncThunk(
  'companies/updateCompany',
  async ({ id, data }: { id: number; data: CreateCompanyRequest }, { rejectWithValue }) => {
    try {
      const company = await companyService.update(id, data)
      return company
    } catch (error: any) {
      if (error.errors) {
        return rejectWithValue({
          message: error.message || 'Error al actualizar empresa',
          validationErrors: error.errors
        })
      }
      return rejectWithValue({
        message: error.message || 'Error al actualizar empresa',
        validationErrors: null
      })
    }
  }
)

export const deleteCompany = createAsyncThunk('companies/deleteCompany', async (id: number, { rejectWithValue }) => {
  try {
    await companyService.delete(id)
    return id
  } catch (error: any) {
    return rejectWithValue(error.message || 'Error al eliminar empresa')
  }
})

export const searchCompanies = createAsyncThunk<
  CompaniesApiResponse | CompaniesApiClientResponse,
  { query: string; filters?: CompanyFilters; pageSize?: number }
>('companies/searchCompanies', async (params, { rejectWithValue }) => {
  try {
    const { query, filters = {}, pageSize = 15 } = params
    const searchFilters = {
      ...filters,
      per_page: pageSize
    }
    const response = await companyService.search(query, searchFilters)
    return response
  } catch (error: any) {
    return rejectWithValue(error.message || 'Error al buscar empresas')
  }
})

// Helper function para extraer datos de paginación
const extractPaginationData = (payload: CompaniesApiResponse | CompaniesApiClientResponse) => {
  if ('status' in payload && 'data' in payload && payload.data && typeof payload.data === 'object') {
    return payload.data
  } else if ('current_page' in payload && 'data' in payload) {
    return payload
  }
  return null
}

// Initial state
interface CompanyState {
  companies: Company[]
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
  filters: CompanyFilters
  selectedCompany: Company | null
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

const initialState: CompanyState = {
  companies: [],
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
  selectedCompany: null,
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
const companySlice = createSlice({
  name: 'companies',
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
    setSelectedCompany: (state, action: PayloadAction<Company | null>) => {
      state.selectedCompany = action.payload
    },
    clearSelectedCompany: state => {
      state.selectedCompany = null
    },
    setFilters: (state, action: PayloadAction<CompanyFilters>) => {
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
    openForm: (state, action: PayloadAction<{ mode: 'create' | 'edit'; company?: Company }>) => {
      state.isFormOpen = true
      state.formMode = action.payload.mode
      if (action.payload.mode === 'edit' && action.payload.company) {
        state.selectedCompany = action.payload.company
      } else {
        state.selectedCompany = null
      }
    },
    closeForm: state => {
      state.isFormOpen = false
      state.selectedCompany = null
    }
  },
  extraReducers: builder => {
    builder
      // Fetch companies
      .addCase(fetchCompanies.pending, state => {
        state.loading = true
        if (state.loadingStates) {
          state.loadingStates.fetching = true
        }
        state.error = null
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.loading = false
        if (state.loadingStates) {
          state.loadingStates.fetching = false
        }
        state.needsReload = false

        const paginationData = extractPaginationData(action.payload)

        if (paginationData && 'data' in paginationData && Array.isArray(paginationData.data)) {
          state.companies = paginationData.data

          state.pagination = {
            currentPage: paginationData.current_page || 1,
            rowsPerPage: paginationData.per_page || 15,
            totalPages: paginationData.last_page || 1,
            totalRecords: paginationData.total || 0,
            from: paginationData.from || 0,
            to: paginationData.to || 0
          }
        } else {
          console.error('Unexpected companies response structure:', action.payload)
          state.companies = []
          state.pagination = {
            ...state.pagination,
            totalPages: 1,
            totalRecords: 0,
            from: 0,
            to: 0
          }
        }
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loading = false
        if (state.loadingStates) {
          state.loadingStates.fetching = false
        }
        state.error = action.payload as string
      })
      // Create company
      .addCase(createCompany.pending, state => {
        if (state.loadingStates) {
          state.loadingStates.creating = true
        }
        state.error = null
        state.validationErrors = null
      })
      .addCase(createCompany.fulfilled, (state, action) => {
        if (state.loadingStates) {
          state.loadingStates.creating = false
        }
        state.error = null
        state.validationErrors = null
        state.needsReload = true
      })
      .addCase(createCompany.rejected, (state, action) => {
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
      // Update company
      .addCase(updateCompany.pending, state => {
        if (state.loadingStates) {
          state.loadingStates.updating = true
        }
        state.error = null
        state.validationErrors = null
      })
      .addCase(updateCompany.fulfilled, (state, action) => {
        if (state.loadingStates) {
          state.loadingStates.updating = false
        }
        state.error = null
        state.validationErrors = null
        state.needsReload = true
      })
      .addCase(updateCompany.rejected, (state, action) => {
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
      // Delete company
      .addCase(deleteCompany.pending, state => {
        if (state.loadingStates) {
          state.loadingStates.deleting = true
        }
        state.error = null
      })
      .addCase(deleteCompany.fulfilled, (state, action) => {
        if (state.loadingStates) {
          state.loadingStates.deleting = false
        }
        state.needsReload = true
      })
      .addCase(deleteCompany.rejected, (state, action) => {
        if (state.loadingStates) {
          state.loadingStates.deleting = false
        }
        state.error = action.payload as string
      })
      // Search companies
      .addCase(searchCompanies.pending, state => {
        state.loading = true
        if (state.loadingStates) {
          state.loadingStates.searching = true
        }
        state.error = null
      })
      .addCase(searchCompanies.fulfilled, (state, action) => {
        state.loading = false
        if (state.loadingStates) {
          state.loadingStates.searching = false
        }

        const paginationData = extractPaginationData(action.payload)

        if (paginationData && 'data' in paginationData && Array.isArray(paginationData.data)) {
          state.companies = paginationData.data

          state.pagination = {
            currentPage: paginationData.current_page || 1,
            rowsPerPage: paginationData.per_page || 15,
            totalPages: paginationData.last_page || 1,
            totalRecords: paginationData.total || 0,
            from: paginationData.from || 0,
            to: paginationData.to || 0
          }
        } else {
          console.error('Unexpected search companies response structure:', action.payload)
          state.companies = []
          state.pagination = {
            ...state.pagination,
            totalPages: 1,
            totalRecords: 0,
            from: 0,
            to: 0
          }
        }
      })
      .addCase(searchCompanies.rejected, (state, action) => {
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
  setSelectedCompany,
  clearSelectedCompany,
  setFilters,
  clearFilters,
  setNeedsReload,
  setCurrentPage,
  setRowsPerPage,
  resetPagination,
  updatePaginationMeta,
  openForm,
  closeForm
} = companySlice.actions

export default companySlice.reducer
