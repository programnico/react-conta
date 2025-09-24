// features/general/period-name/services/periodNameService.ts
import { BaseCrudService } from '@/shared/services/BaseCrudService'
import { API_CONFIG } from '@/shared/services/apiClient'
import type { PeriodName, CreatePeriodNameRequest, UpdatePeriodNameRequest } from '../types'

class PeriodNameService extends BaseCrudService<PeriodName, CreatePeriodNameRequest, UpdatePeriodNameRequest> {
  protected endpoint = '/pei/period-name'

  constructor() {
    super({
      useFormData: true // Same API format as unit-merge
    })
  }

  /**
   * Custom update method to handle the specific API format
   * This API expects FormData with 'id' included in the body
   */
  async update(id: string | number, data: UpdatePeriodNameRequest): Promise<PeriodName> {
    // For this specific API, include the ID in the data
    const updateData = {
      ...data,
      id: Number(id)
    }

    // Use the base endpoint (not with /:id) as the API expects ID in body
    return super.create(updateData as any) // Reuse create method as API uses same endpoint
  }

  /**
   * Get period names by status (example of custom method)
   */
  async getByStatus(status: 'active' | 'inactive'): Promise<PeriodName[]> {
    return this.getAll({ status })
  }

  /**
   * Search period names by name
   */
  async searchByName(query: string): Promise<PeriodName[]> {
    return this.getAll({ search: query })
  }

  /**
   * Get period names by description
   */
  async getByDescription(description: string): Promise<PeriodName[]> {
    return this.getAll({ description })
  }

  /**
   * Get period name statistics
   */
  async getStatistics(): Promise<{ total: number; active: number; inactive: number }> {
    const allItems = await this.getAll()
    return {
      total: allItems.length,
      active: allItems.filter(item => !(item as any).status || (item as any).status === 'active').length,
      inactive: allItems.filter(item => (item as any).status === 'inactive').length
    }
  }
}

// Export singleton instance
export const periodNameService = new PeriodNameService()
export default periodNameService
