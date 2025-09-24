// store/slices/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { AuthService } from '@/shared/services/authService'
import { ApiError as ApiErrorClass } from '@/shared/services/apiClient'
import type {
  AuthState,
  LoginCredentials,
  VerificationRequest,
  VerificationResponse,
  UserData,
  ApiError
} from '@/shared/types/auth'

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  requiresVerification: false,
  verificationToken: null,
  changePasswordRequired: false,
  error: null,
  loginStep: 'credentials'
}

// Async thunks
export const loginAsync = createAsyncThunk('auth/login', async (credentials: LoginCredentials, { rejectWithValue }) => {
  try {
    const response = await AuthService.login(credentials)
    return response
  } catch (error) {
    if (error instanceof ApiErrorClass) {
      return rejectWithValue({
        message: error.message,
        code: error.code,
        status: error.status
      } as ApiError)
    }
    return rejectWithValue({
      message: 'An unexpected error occurred during login'
    } as ApiError)
  }
})

export const verifyCodeAsync = createAsyncThunk(
  'auth/verifyCode',
  async (verificationData: VerificationRequest, { rejectWithValue }) => {
    try {
      const response = await AuthService.verifyCode(verificationData)
      return response
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        return rejectWithValue({
          message: error.message,
          code: error.code,
          status: error.status
        } as ApiError)
      }
      return rejectWithValue({
        message: 'An unexpected error occurred during verification'
      } as ApiError)
    }
  }
)

export const refreshTokenAsync = createAsyncThunk(
  'auth/refreshToken',
  async (refreshToken: string, { rejectWithValue }) => {
    try {
      const response = await AuthService.refreshToken(refreshToken)
      return response
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        return rejectWithValue({
          message: error.message,
          code: error.code,
          status: error.status
        } as ApiError)
      }
      return rejectWithValue({
        message: 'Token refresh failed'
      } as ApiError)
    }
  }
)

export const logoutAsync = createAsyncThunk('auth/logout', async (_, { getState }) => {
  const state = getState() as { auth: AuthState }
  if (state.auth.accessToken) {
    await AuthService.logout(state.auth.accessToken)
  }
  return null
})

export const getUserProfileAsync = createAsyncThunk('auth/getUserProfile', async (_, { getState, rejectWithValue }) => {
  const state = getState() as { auth: AuthState }

  if (!state.auth.accessToken) {
    return rejectWithValue({
      message: 'No access token available'
    } as ApiError)
  }

  try {
    const response = await AuthService.getUserProfile(state.auth.accessToken)
    return response
  } catch (error) {
    if (error instanceof ApiErrorClass) {
      return rejectWithValue({
        message: error.message,
        code: error.code,
        status: error.status
      } as ApiError)
    }
    return rejectWithValue({
      message: 'Failed to fetch user profile'
    } as ApiError)
  }
})

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Clear error
    clearError: state => {
      state.error = null
    },

    // Reset auth state
    resetAuth: state => {
      return { ...initialState }
    },

    // Set user data manually
    setUser: (state, action: PayloadAction<UserData | null>) => {
      state.user = action.payload
    },

    // Set tokens manually (for hydration from localStorage)
    setTokens: (
      state,
      action: PayloadAction<{
        accessToken: string | null
        refreshToken: string | null
      }>
    ) => {
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.isAuthenticated = !!action.payload.accessToken
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },

    // Reset login step
    resetLoginStep: state => {
      state.loginStep = 'credentials'
      state.requiresVerification = false
      state.verificationToken = null
      state.error = null
    }
  },
  extraReducers: builder => {
    builder
      // Login cases
      .addCase(loginAsync.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.error = null
        state.verificationToken = action.payload.tk || null
        state.changePasswordRequired = action.payload.change_password || false
        state.requiresVerification = true
        state.loginStep = 'verification'
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false
        const error = action.payload as ApiError
        state.error = error?.message || 'Login failed'
        state.loginStep = 'credentials'
      })

      // Verification cases
      .addCase(verifyCodeAsync.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(verifyCodeAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.error = null

        // Verificar diferentes formas de determinar el éxito
        const payload = action.payload as VerificationResponse
        const isSuccess =
          payload.success === true ||
          (payload.access_token && payload.access_token.length > 0) ||
          (payload.token && payload.token.length > 0) ||
          // Si no hay campo success pero hay tokens, asumir éxito
          (!('success' in payload) && (payload.access_token || payload.token))

        state.isAuthenticated = Boolean(isSuccess)
        state.requiresVerification = false
        state.verificationToken = null
        state.loginStep = 'completed'

        if (action.payload.user) {
          state.user = action.payload.user
        }

        if (action.payload.access_token) {
          state.accessToken = action.payload.access_token
        }

        if (action.payload.refresh_token) {
          state.refreshToken = action.payload.refresh_token
        }
      })
      .addCase(verifyCodeAsync.rejected, (state, action) => {
        state.isLoading = false
        const error = action.payload as ApiError
        state.error = error?.message || 'Verification failed'
        // Stay in verification step to allow retry
      })

      // Token refresh cases
      .addCase(refreshTokenAsync.pending, state => {
        state.isLoading = true
      })
      .addCase(refreshTokenAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.accessToken = action.payload.access_token
        if (action.payload.refresh_token) {
          state.refreshToken = action.payload.refresh_token
        }
        state.isAuthenticated = true
      })
      .addCase(refreshTokenAsync.rejected, state => {
        state.isLoading = false
        state.isAuthenticated = false
        state.accessToken = null
        state.refreshToken = null
        state.user = null
      })

      // Logout cases
      .addCase(logoutAsync.fulfilled, state => {
        return { ...initialState }
      })

      // Get user profile cases
      .addCase(getUserProfileAsync.fulfilled, (state, action) => {
        state.user = action.payload
      })
  }
})

// Export actions
export const { clearError, resetAuth, setUser, setTokens, setLoading, resetLoginStep } = authSlice.actions

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated
export const selectUser = (state: { auth: AuthState }) => state.auth.user
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading
export const selectError = (state: { auth: AuthState }) => state.auth.error
export const selectLoginStep = (state: { auth: AuthState }) => state.auth.loginStep
export const selectRequiresVerification = (state: { auth: AuthState }) => state.auth.requiresVerification
export const selectChangePasswordRequired = (state: { auth: AuthState }) => state.auth.changePasswordRequired

export default authSlice.reducer
