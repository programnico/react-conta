// store/slices/supplierSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import { supplierService } from '@/features/supplier/services/supplierService'
import type {
  Supplier,
  SuppliersApiClientResponse,
  SuppliersApiResponse,
  CreateSupplierRequest,
  SupplierFilters
} from '@/features/supplier/types'

// Async thunks
export const fetchSuppliers = createAsyncThunk<
  SuppliersApiResponse | SuppliersApiClientResponse, // Tipo de retorno: puede ser cualquiera de los dos
  { page?: number; filters?: SupplierFilters; pageSize?: number }
>('suppliers/fetchSuppliers', async (params, { rejectWithValue }) => {
  try {
    const { page = 1, filters = {}, pageSize = 15 } = params
    const response = await supplierService.getAll({
      page,
      per_page: pageSize,
      ...filters
    })
    return response
  } catch (error: any) {
    return rejectWithValue(error.message || 'Error al obtener proveedores')
  }
})

export const createSupplier = createAsyncThunk(
  'suppliers/createSupplier',
  async (data: CreateSupplierRequest, { rejectWithValue }) => {
    try {
      const supplier = await supplierService.create(data)
      return supplier
    } catch (error: any) {
      // Si es un ApiError con errores de validación, los incluimos
      if (error.errors) {
        return rejectWithValue({
          message: error.message || 'Error al crear proveedor',
          validationErrors: error.errors
        })
      }
      return rejectWithValue({
        message: error.message || 'Error al crear proveedor',
        validationErrors: null
      })
    }
  }
)

export const updateSupplier = createAsyncThunk(
  'suppliers/updateSupplier',
  async ({ id, data }: { id: number; data: CreateSupplierRequest }, { rejectWithValue }) => {
    try {
      const supplier = await supplierService.update(id, data)
      return supplier
    } catch (error: any) {
      // Si es un ApiError con errores de validación, los incluimos
      if (error.errors) {
        return rejectWithValue({
          message: error.message || 'Error al actualizar proveedor',
          validationErrors: error.errors
        })
      }
      return rejectWithValue({
        message: error.message || 'Error al actualizar proveedor',
        validationErrors: null
      })
    }
  }
)

export const deleteSupplier = createAsyncThunk('suppliers/deleteSupplier', async (id: number, { rejectWithValue }) => {
  try {
    await supplierService.delete(id)
    return id
  } catch (error: any) {
    return rejectWithValue(error.message || 'Error al eliminar proveedor')
  }
})

export const searchSuppliers = createAsyncThunk<
  SuppliersApiResponse | SuppliersApiClientResponse,
  { query: string; filters?: SupplierFilters; pageSize?: number }
>('suppliers/searchSuppliers', async (params, { rejectWithValue }) => {
  try {
    const { query, filters = {}, pageSize = 15 } = params
    const searchFilters = {
      ...filters,
      per_page: pageSize
    }
    const response = await supplierService.search(query, searchFilters)
    return response
  } catch (error: any) {
    return rejectWithValue(error.message || 'Error al buscar proveedores')
  }
})

// Helper function para extraer datos de paginación de la respuesta
const extractPaginationData = (payload: SuppliersApiResponse | SuppliersApiClientResponse) => {
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
interface SupplierState {
  suppliers: Supplier[]
  loading: boolean
  error: string | null
  validationErrors: Record<string, string[]> | null
  filters: SupplierFilters
  selectedSupplier: Supplier | null
  needsReload: boolean
  // Estado del formulario
  isFormOpen: boolean
  formMode: 'create' | 'edit'
  // Estado de paginación local (separado de meta del servidor)
  pagination: {
    currentPage: number
    rowsPerPage: number
  }
  meta: {
    current_page: number
    from: number
    last_page: number
    per_page: number
    to: number
    total: number
  } | null
}

const initialState: SupplierState = {
  suppliers: [],
  loading: false,
  error: null,
  validationErrors: null,
  filters: {},
  selectedSupplier: null,
  needsReload: false,
  isFormOpen: false,
  formMode: 'create',
  pagination: {
    currentPage: 1,
    rowsPerPage: 15
  },
  meta: null
}

// Slice
const supplierSlice = createSlice({
  name: 'suppliers',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null
    },
    clearValidationErrors: state => {
      state.validationErrors = null
    },
    setSelectedSupplier: (state, action: PayloadAction<Supplier | null>) => {
      state.selectedSupplier = action.payload
    },
    clearSelectedSupplier: state => {
      state.selectedSupplier = null
    },
    setFilters: (state, action: PayloadAction<SupplierFilters>) => {
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
    // Form state actions
    openForm: (state, action: PayloadAction<{ mode: 'create' | 'edit'; supplier?: Supplier }>) => {
      state.isFormOpen = true
      state.formMode = action.payload.mode
      if (action.payload.mode === 'edit' && action.payload.supplier) {
        state.selectedSupplier = action.payload.supplier
      } else {
        state.selectedSupplier = null
      }
    },
    closeForm: state => {
      state.isFormOpen = false
      state.selectedSupplier = null
    }
  },
  extraReducers: builder => {
    builder
      // Fetch suppliers
      .addCase(fetchSuppliers.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.loading = false
        state.needsReload = false // Limpiar flag de recarga

        const paginationData = extractPaginationData(action.payload)

        if (paginationData && 'data' in paginationData && Array.isArray(paginationData.data)) {
          state.suppliers = paginationData.data
          state.meta = {
            current_page: paginationData.current_page || 1,
            from: paginationData.from || 0,
            last_page: paginationData.last_page || 1,
            per_page: paginationData.per_page || 15,
            to: paginationData.to || 0,
            total: paginationData.total || 0
          }

          // Actualizar filtros en el estado Redux con los filtros utilizados
          const { filters } = (action as any).meta.arg || {}
          if (filters) {
            state.filters = filters
          }
        } else {
          // Fallback
          console.error('Unexpected suppliers response structure:', action.payload)
          state.suppliers = []
          state.meta = null
        }
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Create supplier
      .addCase(createSupplier.pending, state => {
        state.loading = true
        state.error = null
        state.validationErrors = null
      })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        state.validationErrors = null
        // Marcar que necesita recarga
        state.needsReload = true
      })
      .addCase(createSupplier.rejected, (state, action) => {
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
      // Update supplier
      .addCase(updateSupplier.pending, state => {
        state.loading = true
        state.error = null
        state.validationErrors = null
      })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        state.validationErrors = null
        // Marcar que necesita recarga para mantener consistencia
        state.needsReload = true
      })
      .addCase(updateSupplier.rejected, (state, action) => {
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
      // Delete supplier
      .addCase(deleteSupplier.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.loading = false
        // Marcar que necesita recarga
        state.needsReload = true
      })
      .addCase(deleteSupplier.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Search suppliers
      .addCase(searchSuppliers.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(searchSuppliers.fulfilled, (state, action) => {
        state.loading = false

        const paginationData = extractPaginationData(action.payload)

        if (paginationData && 'data' in paginationData && Array.isArray(paginationData.data)) {
          state.suppliers = paginationData.data
          state.meta = {
            current_page: paginationData.current_page || 1,
            from: paginationData.from || 0,
            last_page: paginationData.last_page || 1,
            per_page: paginationData.per_page || 15,
            to: paginationData.to || 0,
            total: paginationData.total || 0
          }

          // Actualizar filtros en el estado Redux con la búsqueda realizada
          const { query, filters: searchFilters } = (action as any).meta.arg
          state.filters = {
            ...searchFilters,
            search: query
          }
        } else {
          // Fallback
          console.error('Unexpected search suppliers response structure:', action.payload)
          state.suppliers = []
          state.meta = null
        }
      })
      .addCase(searchSuppliers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const {
  clearError,
  clearValidationErrors,
  setSelectedSupplier,
  clearSelectedSupplier,
  setFilters,
  clearFilters,
  setNeedsReload,
  setCurrentPage,
  setRowsPerPage,
  resetPagination,
  openForm,
  closeForm
} = supplierSlice.actions

export default supplierSlice.reducer
