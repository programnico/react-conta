import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { chartOfAccountsService } from '@/features/chart-of-accounts/services/chartOfAccountsService'
import type {
  ChartOfAccount,
  ChartOfAccountsApiResponse,
  CreateChartOfAccountRequest,
  ChartOfAccountFilters
} from '@/features/chart-of-accounts/types'

// Async thunks
export const fetchChartOfAccounts = createAsyncThunk(
  'chartOfAccounts/fetchChartOfAccounts',
  async (params: { page?: number; filters?: ChartOfAccountFilters; pageSize?: number }) => {
    const { page = 1, filters = {}, pageSize = 15 } = params

    const response = await chartOfAccountsService.getAll({
      ...filters,
      page,
      per_page: pageSize
    })

    return response
  }
)

export const createChartOfAccount = createAsyncThunk(
  'chartOfAccounts/createChartOfAccount',
  async (data: CreateChartOfAccountRequest, { rejectWithValue }) => {
    try {
      const account = await chartOfAccountsService.create(data)
      return account
    } catch (error: any) {
      // Preservar los errores de validación del backend
      if (error.errors) {
        return rejectWithValue({
          message: error.message,
          errors: error.errors
        })
      }
      // Si es una instancia de ApiError, preservar todo
      if (error.status !== undefined) {
        return rejectWithValue({
          message: error.message,
          errors: error.errors || null
        })
      }
      throw error
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
      // Preservar los errores de validación del backend
      if (error.errors) {
        return rejectWithValue({
          message: error.message,
          errors: error.errors
        })
      }
      // Si es una instancia de ApiError, preservar todo
      if (error.status !== undefined) {
        return rejectWithValue({
          message: error.message,
          errors: error.errors || null
        })
      }
      throw error
    }
  }
)

export const deleteChartOfAccount = createAsyncThunk('chartOfAccounts/deleteChartOfAccount', async (id: number) => {
  await chartOfAccountsService.delete(id)
  return id
})

export const searchChartOfAccounts = createAsyncThunk(
  'chartOfAccounts/searchChartOfAccounts',
  async (params: { query: string; filters?: ChartOfAccountFilters }) => {
    const { query, filters = {} } = params
    const response = await chartOfAccountsService.search(query, filters)
    return response
  }
)

// Initial state
interface ChartOfAccountsState {
  accounts: ChartOfAccount[]
  loading: {
    list: boolean
    create: boolean
    update: boolean
    delete: boolean
    search: boolean
  }
  error: string | null
  validationErrors: Record<string, string[]> | null // Errores de validación del backend
  filters: ChartOfAccountFilters
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    perPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

const initialState: ChartOfAccountsState = {
  accounts: [],
  loading: {
    list: false,
    create: false,
    update: false,
    delete: false,
    search: false
  },
  error: null,
  validationErrors: null,
  filters: {},
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 15,
    hasNextPage: false,
    hasPreviousPage: false
  }
}

// Slice
const chartOfAccountsSlice = createSlice({
  name: 'chartOfAccounts',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<ChartOfAccountFilters>) => {
      state.filters = action.payload
    },
    clearFilters: state => {
      state.filters = {}
    },
    clearError: state => {
      state.error = null
      state.validationErrors = null
    },
    clearValidationErrors: state => {
      state.validationErrors = null
    },
    resetChartOfAccounts: state => {
      state.accounts = []
      state.pagination = initialState.pagination
    },
    resetLoadingStates: state => {
      state.loading = {
        list: false,
        create: false,
        update: false,
        delete: false,
        search: false
      }
    }
  },
  extraReducers: builder => {
    // Fetch accounts
    builder
      .addCase(fetchChartOfAccounts.pending, state => {
        state.loading.list = true
        state.error = null
      })
      .addCase(fetchChartOfAccounts.fulfilled, (state, action) => {
        state.loading.list = false
        const newAccounts = action.payload.data
        state.accounts = newAccounts
        state.pagination = {
          currentPage: action.payload.current_page,
          totalPages: action.payload.last_page,
          totalItems: action.payload.total,
          perPage: action.payload.per_page,
          hasNextPage: action.payload.next_page_url !== null,
          hasPreviousPage: action.payload.prev_page_url !== null
        }
      })
      .addCase(fetchChartOfAccounts.rejected, (state, action) => {
        state.loading.list = false
        state.error = action.error.message || 'Error loading chart of accounts'
      })

    // Create account
    builder
      .addCase(createChartOfAccount.pending, state => {
        state.loading.create = true
        state.error = null
        state.validationErrors = null
      })
      .addCase(createChartOfAccount.fulfilled, (state, action) => {
        state.loading.create = false
        state.accounts.unshift(action.payload)
        state.pagination.totalItems += 1
      })
      .addCase(createChartOfAccount.rejected, (state, action) => {
        state.loading.create = false

        // Si el error viene de rejectWithValue, usar esos datos
        if (action.payload) {
          const payload = action.payload as { message: string; errors?: Record<string, string[]> }
          state.error = payload.message
          state.validationErrors = payload.errors || null
        } else {
          // Error genérico
          state.error = action.error.message || 'Error creating account'
          state.validationErrors = null
        }
      }) // Update account
    builder
      .addCase(updateChartOfAccount.pending, state => {
        state.loading.update = true
        state.error = null
        state.validationErrors = null
      })
      .addCase(updateChartOfAccount.fulfilled, (state, action) => {
        state.loading.update = false
        const index = state.accounts.findIndex(acc => acc.id === action.payload.id)
        if (index !== -1) {
          state.accounts[index] = action.payload
        }
      })
      .addCase(updateChartOfAccount.rejected, (state, action) => {
        state.loading.update = false

        // Si el error viene de rejectWithValue, usar esos datos
        if (action.payload) {
          const payload = action.payload as { message: string; errors?: Record<string, string[]> }
          state.error = payload.message
          state.validationErrors = payload.errors || null
        } else {
          // Error genérico
          state.error = action.error.message || 'Error updating account'
          state.validationErrors = null
        }
      })

    // Delete account
    builder
      .addCase(deleteChartOfAccount.pending, state => {
        state.loading.delete = true
        state.error = null
      })
      .addCase(deleteChartOfAccount.fulfilled, (state, action) => {
        state.loading.delete = false
        state.accounts = state.accounts.filter(acc => acc.id !== action.payload)
        state.pagination.totalItems -= 1
      })
      .addCase(deleteChartOfAccount.rejected, (state, action) => {
        state.loading.delete = false
        state.error = action.error.message || 'Error deleting account'
      })

    // Search accounts
    builder
      .addCase(searchChartOfAccounts.pending, state => {
        state.loading.search = true
        state.error = null
      })
      .addCase(searchChartOfAccounts.fulfilled, (state, action) => {
        state.loading.search = false
        state.accounts = action.payload.data
        state.pagination = {
          currentPage: action.payload.current_page,
          totalPages: action.payload.last_page,
          totalItems: action.payload.total,
          perPage: action.payload.per_page,
          hasNextPage: action.payload.next_page_url !== null,
          hasPreviousPage: action.payload.prev_page_url !== null
        }
      })
      .addCase(searchChartOfAccounts.rejected, (state, action) => {
        state.loading.search = false
        state.error = action.error.message || 'Error searching accounts'
      })
  }
})

export const { setFilters, clearFilters, clearError, clearValidationErrors, resetChartOfAccounts, resetLoadingStates } =
  chartOfAccountsSlice.actions
export default chartOfAccountsSlice.reducer
