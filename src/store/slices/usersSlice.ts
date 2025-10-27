import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { User, UsersResponse, CreateUserData, UpdateUserData, UserFilters } from '@/features/users/types'
import { usersService } from '@/features/users/services/usersService'

interface UsersState {
  users: User[]
  loading: boolean
  error: string | null
  validationErrors: Record<string, string[]> | null
  filters: UserFilters
  meta: {
    current_page: number
    from: number
    last_page: number
    per_page: number
    to: number
    total: number
  } | null
  selectedUser: User | null
}

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
  validationErrors: null,
  filters: {},
  meta: null,
  selectedUser: null
}

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params: { page?: number; per_page?: number; search?: string; role?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await usersService.getUsers(params)
      return response
    } catch (error: any) {
      console.error('Error fetching users:', error)
      return rejectWithValue(error.message || 'Error al obtener usuarios')
    }
  }
)

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData: CreateUserData, { rejectWithValue }) => {
    try {
      const response = await usersService.createUser(userData)
      return response
    } catch (error: any) {
      // Si es un ApiError con errores de validación, los incluimos
      if (error.errors) {
        return rejectWithValue({
          message: error.message || 'Error al crear usuario',
          validationErrors: error.errors
        })
      }
      return rejectWithValue({
        message: error.message || 'Error al crear usuario',
        validationErrors: null
      })
    }
  }
)

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async (userData: UpdateUserData, { rejectWithValue }) => {
    try {
      const response = await usersService.updateUser(userData)
      return response
    } catch (error: any) {
      // Si es un ApiError con errores de validación, los incluimos
      if (error.errors) {
        return rejectWithValue({
          message: error.message || 'Error al actualizar usuario',
          validationErrors: error.errors
        })
      }
      return rejectWithValue({
        message: error.message || 'Error al actualizar usuario',
        validationErrors: null
      })
    }
  }
)

export const deleteUser = createAsyncThunk('users/deleteUser', async (userId: number, { rejectWithValue }) => {
  try {
    await usersService.deleteUser(userId)
    return userId
  } catch (error: any) {
    return rejectWithValue(error.message || 'Error al eliminar usuario')
  }
})

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null
    },
    clearValidationErrors: state => {
      state.validationErrors = null
    },
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload
    },
    clearSelectedUser: state => {
      state.selectedUser = null
    },
    setFilters: (state, action: PayloadAction<UserFilters>) => {
      state.filters = action.payload
    },
    clearFilters: state => {
      state.filters = {}
    }
  },
  extraReducers: builder => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false

        // La respuesta debería tener la estructura: { status, message, data: [], meta: {} }
        if (action.payload && action.payload.data && Array.isArray(action.payload.data)) {
          state.users = action.payload.data
          state.meta = action.payload.meta || null
        } else {
          // Fallback
          console.error('Unexpected users response structure:', action.payload)
          state.users = []
          state.meta = null
        }
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Create user
      .addCase(createUser.pending, state => {
        state.loading = true
        state.error = null
        state.validationErrors = null
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        state.validationErrors = null
        state.users.push(action.payload)
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false
        const payload = action.payload as any
        if (payload && typeof payload === 'object') {
          state.error = payload.message
          state.validationErrors = payload.validationErrors
        } else {
          state.error = payload as string
          state.validationErrors = null
        }
      })
      // Update user
      .addCase(updateUser.pending, state => {
        state.loading = true
        state.error = null
        state.validationErrors = null
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        state.validationErrors = null
        const index = state.users.findIndex(user => user.id === action.payload.id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false
        const payload = action.payload as any
        if (payload && typeof payload === 'object') {
          state.error = payload.message
          state.validationErrors = payload.validationErrors
        } else {
          state.error = payload as string
          state.validationErrors = null
        }
      })
      // Delete user
      .addCase(deleteUser.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false
        state.users = state.users.filter(user => user.id !== action.payload)
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { clearError, clearValidationErrors, setSelectedUser, clearSelectedUser, setFilters, clearFilters } =
  usersSlice.actions
export default usersSlice.reducer
