// store/slices/purchaseSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { purchaseService } from '@/features/purchase/services/purchaseService'
import type {
  Purchase,
  PurchasesApiResponse,
  CreatePurchaseRequest,
  PurchaseFilters,
  PurchaseStats
} from '@/features/purchase/types'

// Async thunks
export const fetchPurchases = createAsyncThunk(
  'purchases/fetchPurchases',
  async (params: { page?: number; filters?: PurchaseFilters; pageSize?: number }) => {
    const { page = 1, filters = {}, pageSize = 15 } = params
    const response: PurchasesApiResponse = await purchaseService.getAll({
      ...filters,
      page,
      per_page: pageSize
    })
    // Return the complete pagination data structure
    return response.data
  }
)

export const createPurchase = createAsyncThunk('purchases/createPurchase', async (data: CreatePurchaseRequest) => {
  const purchase = await purchaseService.create(data)
  return purchase
})

export const updatePurchase = createAsyncThunk(
  'purchases/updatePurchase',
  async ({ id, data }: { id: number; data: CreatePurchaseRequest }) => {
    const purchase = await purchaseService.update(id, data)
    return purchase
  }
)

export const deletePurchase = createAsyncThunk('purchases/deletePurchase', async (id: number) => {
  await purchaseService.delete(id)
  return id
})

export const searchPurchases = createAsyncThunk(
  'purchases/searchPurchases',
  async (params: { query: string; filters?: PurchaseFilters }) => {
    const { query, filters = {} } = params
    const response = await purchaseService.search(query, filters)
    return response.data
  }
)

// Initial state
interface PurchaseState {
  purchases: Purchase[]
  loading: {
    list: boolean
    create: boolean
    update: boolean
    delete: boolean
    search: boolean
  }
  error: string | null
  filters: PurchaseFilters
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    perPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

const initialState: PurchaseState = {
  purchases: [],
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
const purchaseSlice = createSlice({
  name: 'purchases',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<PurchaseFilters>) => {
      state.filters = action.payload
    },
    clearFilters: state => {
      state.filters = {}
    },
    clearError: state => {
      state.error = null
    },
    resetPurchases: state => {
      state.purchases = []
      state.pagination = initialState.pagination
    },
    resetLoadingStates: state => {
      console.log('🔄 Manual reset of all loading states')
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
    // Fetch purchases
    builder
      .addCase(fetchPurchases.pending, state => {
        state.loading.list = true
        state.error = null
      })
      .addCase(fetchPurchases.fulfilled, (state, action) => {
        state.loading.list = false

        // Handle different payload structures
        if (action.payload && action.payload.data && Array.isArray(action.payload.data)) {
          // Payload is paginated structure with data array
          state.purchases = action.payload.data
          state.pagination = {
            currentPage: action.payload.current_page || 1,
            totalPages: action.payload.last_page || 1,
            totalItems: action.payload.total || 0,
            perPage: action.payload.per_page || 15,
            hasNextPage: action.payload.next_page_url !== null,
            hasPreviousPage: action.payload.prev_page_url !== null
          }
        } else if (Array.isArray(action.payload)) {
          // Payload is direct array of purchases
          state.purchases = action.payload
        } else {
          // Fallback to empty array
          state.purchases = []
        }
      })
      .addCase(fetchPurchases.rejected, (state, action) => {
        state.loading.list = false
        state.error = action.error.message || 'Error loading purchases'
      })

    // Create purchase
    builder
      .addCase(createPurchase.pending, state => {
        state.loading.create = true
        state.error = null
      })
      .addCase(createPurchase.fulfilled, (state, action) => {
        state.loading.create = false
        // Add new purchase to the beginning of the list
        state.purchases.unshift(action.payload)
        state.pagination.totalItems += 1
      })
      .addCase(createPurchase.rejected, (state, action) => {
        state.loading.create = false
        state.error = action.error.message || 'Error creating purchase'
      })

    // Update purchase
    builder
      .addCase(updatePurchase.pending, state => {
        console.log('🔄 updatePurchase.pending - Setting loading.update = true')
        state.loading.update = true
        state.error = null
      })
      .addCase(updatePurchase.fulfilled, (state, action) => {
        console.log('✅ updatePurchase.fulfilled - Setting loading.update = false, payload:', action.payload)
        state.loading.update = false
        const index = state.purchases.findIndex(p => p.id === action.payload.id)
        if (index !== -1) {
          state.purchases[index] = action.payload
          console.log('📝 Updated purchase at index:', index)
        } else {
          console.warn('⚠️ Could not find purchase to update with id:', action.payload.id)
        }
      })
      .addCase(updatePurchase.rejected, (state, action) => {
        console.log('❌ updatePurchase.rejected - Setting loading.update = false, error:', action.error.message)
        state.loading.update = false
        state.error = action.error.message || 'Error updating purchase'
      })

    // Delete purchase
    builder
      .addCase(deletePurchase.pending, state => {
        state.loading.delete = true
        state.error = null
      })
      .addCase(deletePurchase.fulfilled, (state, action) => {
        state.loading.delete = false
        state.purchases = state.purchases.filter(p => p.id !== action.payload)
        state.pagination.totalItems -= 1
      })
      .addCase(deletePurchase.rejected, (state, action) => {
        state.loading.delete = false
        state.error = action.error.message || 'Error deleting purchase'
      })

    // Search purchases
    builder
      .addCase(searchPurchases.pending, state => {
        state.loading.search = true
        state.error = null
      })
      .addCase(searchPurchases.fulfilled, (state, action) => {
        state.loading.search = false
        state.purchases = action.payload.data || []
        state.pagination = {
          currentPage: action.payload.current_page,
          totalPages: action.payload.last_page,
          totalItems: action.payload.total,
          perPage: action.payload.per_page,
          hasNextPage: action.payload.next_page_url !== null,
          hasPreviousPage: action.payload.prev_page_url !== null
        }
      })
      .addCase(searchPurchases.rejected, (state, action) => {
        state.loading.search = false
        state.error = action.error.message || 'Error searching purchases'
      })
  }
})

export const { setFilters, clearFilters, clearError, resetPurchases, resetLoadingStates } = purchaseSlice.actions
export default purchaseSlice.reducer
