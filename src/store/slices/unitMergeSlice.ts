// store/slices/unitMergeSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import UnitMergeService from '@/services/unitMergeService'
import type { UnitMerge, UnitMergeState, CreateUnitMergeRequest, UpdateUnitMergeRequest } from '@/types/unitMerge'
import type { RootState } from '@/store'

// Initial state
const initialState: UnitMergeState = {
  items: [],
  currentItem: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null
}

// Async thunks
export const fetchUnitMerges = createAsyncThunk('unitMerge/fetchAll', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState() as RootState
    const token = state.auth.accessToken

    if (!token) {
      throw new Error('No authentication token available')
    }

    const data = await UnitMergeService.getAll(token)
    return data
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch unit merges')
  }
})

export const createUnitMerge = createAsyncThunk(
  'unitMerge/create',
  async (data: CreateUnitMergeRequest, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState
      const token = state.auth.accessToken

      if (!token) {
        throw new Error('No authentication token available')
      }

      const result = await UnitMergeService.create(data, token)
      return result
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create unit merge')
    }
  }
)

export const updateUnitMerge = createAsyncThunk(
  'unitMerge/update',
  async (data: UpdateUnitMergeRequest, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState
      const token = state.auth.accessToken

      if (!token) {
        throw new Error('No authentication token available')
      }

      const result = await UnitMergeService.update(data, token)
      return result
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update unit merge')
    }
  }
)

export const deleteUnitMerge = createAsyncThunk(
  'unitMerge/delete',
  async (id: number, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState
      const token = state.auth.accessToken

      if (!token) {
        throw new Error('No authentication token available')
      }

      await UnitMergeService.delete(id, token)
      return id
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete unit merge')
    }
  }
)

// Slice
const unitMergeSlice = createSlice({
  name: 'unitMerge',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null
    },
    setCurrentItem: (state, action) => {
      state.currentItem = action.payload
    },
    clearCurrentItem: state => {
      state.currentItem = null
    }
  },
  extraReducers: builder => {
    builder
      // Fetch unit merges
      .addCase(fetchUnitMerges.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUnitMerges.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
        state.error = null
      })
      .addCase(fetchUnitMerges.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Create unit merge
      .addCase(createUnitMerge.pending, state => {
        state.isCreating = true
        state.error = null
      })
      .addCase(createUnitMerge.fulfilled, (state, action) => {
        state.isCreating = false
        state.items.push(action.payload)
        state.error = null
      })
      .addCase(createUnitMerge.rejected, (state, action) => {
        state.isCreating = false
        state.error = action.payload as string
      })

      // Update unit merge
      .addCase(updateUnitMerge.pending, state => {
        state.isUpdating = true
        state.error = null
      })
      .addCase(updateUnitMerge.fulfilled, (state, action) => {
        state.isUpdating = false
        const index = state.items.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        if (state.currentItem?.id === action.payload.id) {
          state.currentItem = action.payload
        }
        state.error = null
      })
      .addCase(updateUnitMerge.rejected, (state, action) => {
        state.isUpdating = false
        state.error = action.payload as string
      })

      // Delete unit merge
      .addCase(deleteUnitMerge.pending, state => {
        state.isDeleting = true
        state.error = null
      })
      .addCase(deleteUnitMerge.fulfilled, (state, action) => {
        state.isDeleting = false
        state.items = state.items.filter(item => item.id !== action.payload)
        if (state.currentItem?.id === action.payload) {
          state.currentItem = null
        }
        state.error = null
      })
      .addCase(deleteUnitMerge.rejected, (state, action) => {
        state.isDeleting = false
        state.error = action.payload as string
      })
  }
})

// Actions
export const { clearError, setCurrentItem, clearCurrentItem } = unitMergeSlice.actions

// Selectors
export const selectUnitMerge = (state: RootState) => state.unitMerge
export const selectUnitMergeItems = (state: RootState) => state.unitMerge.items
export const selectCurrentUnitMerge = (state: RootState) => state.unitMerge.currentItem
export const selectUnitMergeLoading = (state: RootState) => state.unitMerge.isLoading
export const selectUnitMergeError = (state: RootState) => state.unitMerge.error

export default unitMergeSlice.reducer
