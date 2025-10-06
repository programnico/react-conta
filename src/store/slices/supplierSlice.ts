// store/slices/supplierSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import { supplierService } from '@/features/supplier/services/supplierService'
import type { Supplier, SuppliersApiResponse, CreateSupplierRequest, SupplierFilters } from '@/features/supplier/types'

// Async thunks
export const fetchSuppliers = createAsyncThunk(
  'suppliers/fetchSuppliers',
  async (params: { page?: number; filters?: SupplierFilters; pageSize?: number }) => {
    const { page = 1, filters = {}, pageSize = 15 } = params
    const response = await supplierService.getAll({
      ...filters,
      page,
      per_page: pageSize
    })
    // The apiClient already extracts the data property, so response is the pagination data
    return response as any // Cast to any to handle the extracted pagination structure
  }
)

export const createSupplier = createAsyncThunk('suppliers/createSupplier', async (data: CreateSupplierRequest) => {
  const supplier = await supplierService.create(data)
  return supplier
})

export const updateSupplier = createAsyncThunk(
  'suppliers/updateSupplier',
  async ({ id, data }: { id: number; data: CreateSupplierRequest }) => {
    const supplier = await supplierService.update(id, data)
    return supplier
  }
)

export const deleteSupplier = createAsyncThunk('suppliers/deleteSupplier', async (id: number) => {
  await supplierService.delete(id)
  return id
})

export const searchSuppliers = createAsyncThunk(
  'suppliers/searchSuppliers',
  async (params: { query: string; filters?: SupplierFilters }) => {
    const { query, filters = {} } = params
    const response = await supplierService.search(query, filters)
    return response.data
  }
)

// Initial state
interface SupplierState {
  suppliers: Supplier[]
  loading: {
    list: boolean
    create: boolean
    update: boolean
    delete: boolean
    search: boolean
  }
  error: string | null
  filters: SupplierFilters
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    perPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

const initialState: SupplierState = {
  suppliers: [],
  loading: {
    list: false,
    create: false,
    update: false,
    delete: false,
    search: false
  },
  error: null,
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
const supplierSlice = createSlice({
  name: 'suppliers',
  initialState,
  reducers: {
    setSupplierFilters: (state, action: PayloadAction<SupplierFilters>) => {
      state.filters = action.payload
    },
    clearSupplierFilters: state => {
      state.filters = {}
    },
    clearSupplierError: state => {
      state.error = null
    },
    resetSuppliers: state => {
      state.suppliers = []
      state.pagination = initialState.pagination
    },
    resetSupplierLoadingStates: state => {
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
    // Fetch suppliers
    builder
      .addCase(fetchSuppliers.pending, state => {
        if (typeof state.loading !== 'object' || state.loading === null) {
          state.loading = {
            list: false,
            create: false,
            update: false,
            delete: false,
            search: false
          }
        }
        state.loading.list = true
        state.error = null
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        if (typeof state.loading !== 'object' || state.loading === null) {
          state.loading = {
            list: false,
            create: false,
            update: false,
            delete: false,
            search: false
          }
        }
        state.loading.list = false

        // Handle different response structures
        if (Array.isArray(action.payload)) {
          // Direct array response
          state.suppliers = action.payload
          state.pagination = {
            currentPage: 1,
            totalPages: 1,
            totalItems: action.payload.length,
            perPage: action.payload.length,
            hasNextPage: false,
            hasPreviousPage: false
          }
        } else {
          // Paginated response structure
          state.suppliers = action.payload.data || []
          state.pagination = {
            currentPage: action.payload.current_page,
            totalPages: action.payload.last_page,
            totalItems: action.payload.total,
            perPage: action.payload.per_page,
            hasNextPage: action.payload.next_page_url !== null,
            hasPreviousPage: action.payload.prev_page_url !== null
          }
        }
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        if (typeof state.loading !== 'object' || state.loading === null) {
          state.loading = {
            list: false,
            create: false,
            update: false,
            delete: false,
            search: false
          }
        }
        state.loading.list = false
        state.error = action.error.message || 'Error fetching suppliers'
      })

    // Create supplier
    builder
      .addCase(createSupplier.pending, state => {
        state.loading.create = true
        state.error = null
      })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.loading.create = false
        // Add new supplier to the beginning of the list
        state.suppliers.unshift(action.payload)
        state.pagination.totalItems += 1
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.loading.create = false
        state.error = action.error.message || 'Error creating supplier'
      })

    // Update supplier
    builder
      .addCase(updateSupplier.pending, state => {
        state.loading.update = true
        state.error = null
      })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        state.loading.update = false
        const index = state.suppliers.findIndex(s => s.id === action.payload.id)
        if (index !== -1) {
          state.suppliers[index] = action.payload
        }
      })
      .addCase(updateSupplier.rejected, (state, action) => {
        state.loading.update = false
        state.error = action.error.message || 'Error updating supplier'
      })

    // Delete supplier
    builder
      .addCase(deleteSupplier.pending, state => {
        state.loading.delete = true
        state.error = null
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.loading.delete = false
        state.suppliers = state.suppliers.filter(s => s.id !== action.payload)
        state.pagination.totalItems -= 1
      })
      .addCase(deleteSupplier.rejected, (state, action) => {
        state.loading.delete = false
        state.error = action.error.message || 'Error deleting supplier'
      })

    // Search suppliers
    builder
      .addCase(searchSuppliers.pending, state => {
        state.loading.search = true
        state.error = null
      })
      .addCase(searchSuppliers.fulfilled, (state, action) => {
        state.loading.search = false
        state.suppliers = action.payload.data || []
        state.pagination = {
          currentPage: action.payload.current_page,
          totalPages: action.payload.last_page,
          totalItems: action.payload.total,
          perPage: action.payload.per_page,
          hasNextPage: action.payload.next_page_url !== null,
          hasPreviousPage: action.payload.prev_page_url !== null
        }
      })
      .addCase(searchSuppliers.rejected, (state, action) => {
        state.loading.search = false
        state.error = action.error.message || 'Error searching suppliers'
      })
  }
})

export const {
  setSupplierFilters,
  clearSupplierFilters,
  clearSupplierError,
  resetSuppliers,
  resetSupplierLoadingStates
} = supplierSlice.actions

export default supplierSlice.reducer
