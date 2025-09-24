// shared/services/BaseCrudService.ts
import { apiClient } from './apiClient'

export interface CrudServiceOptions {
  useFormData?: boolean
  customEndpoints?: {
    getAll?: string
    getById?: string
    create?: string
    update?: string
    delete?: string
  }
}

export abstract class BaseCrudService<T, CreateT, UpdateT> {
  protected abstract endpoint: string
  protected options: CrudServiceOptions

  constructor(options: CrudServiceOptions = {}) {
    this.options = options
  }

  /**
   * Get all records
   */
  async getAll(filters?: Record<string, any>): Promise<T[]> {
    const endpoint = this.options.customEndpoints?.getAll || this.endpoint
    return apiClient.get<T[]>(endpoint, filters)
  }

  /**
   * Get single record by ID
   */
  async getById(id: string | number): Promise<T> {
    const endpoint = this.options.customEndpoints?.getById || `${this.endpoint}/${id}`
    return apiClient.get<T>(endpoint)
  }

  /**
   * Create new record
   */
  async create(data: CreateT): Promise<T> {
    const endpoint = this.options.customEndpoints?.create || this.endpoint

    if (this.options.useFormData) {
      return apiClient.postFormData<T>(endpoint, data)
    }

    return apiClient.post<T>(endpoint, data)
  }

  /**
   * Update existing record
   */
  async update(id: string | number, data: UpdateT): Promise<T> {
    const endpoint = this.options.customEndpoints?.update || `${this.endpoint}/${id}`
    return apiClient.put<T>(endpoint, data)
  }

  /**
   * Delete record
   */
  async delete(id: string | number): Promise<void> {
    const endpoint = this.options.customEndpoints?.delete || `${this.endpoint}/${id}`
    return apiClient.delete<void>(endpoint)
  }

  /**
   * Batch operations (optional - can be overridden by specific services)
   */
  async batchCreate(items: CreateT[]): Promise<T[]> {
    const promises = items.map(item => this.create(item))
    return Promise.all(promises)
  }

  async batchUpdate(items: Array<{ id: string | number; data: UpdateT }>): Promise<T[]> {
    const promises = items.map(({ id, data }) => this.update(id, data))
    return Promise.all(promises)
  }

  async batchDelete(ids: Array<string | number>): Promise<void> {
    const promises = ids.map(id => this.delete(id))
    await Promise.all(promises)
  }
}

// Generic CRUD hook interface
export interface CrudHookResult<T, CreateT, UpdateT> {
  // Data
  data: T[]
  currentItem: T | null

  // Loading states
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean

  // Error handling
  error: string | null

  // Actions
  load: (filters?: Record<string, any>) => Promise<void>
  loadById: (id: string | number) => Promise<T>
  create: (data: CreateT) => Promise<T>
  update: (id: string | number, data: UpdateT) => Promise<T>
  delete: (id: string | number) => Promise<void>

  // State management
  setCurrentItem: (item: T | null) => void
  clearError: () => void
  refresh: () => Promise<void>
}
