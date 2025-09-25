// features/general/unit-merge/services/unitMergeService.ts
import { BaseCrudService } from '@/shared/services/BaseCrudService'
import { API_CONFIG, apiClient } from '@/shared/services/apiClient'
import type { UnitMerge, CreateUnitMergeRequest, UpdateUnitMergeRequest } from '../types'

class UnitMergeService extends BaseCrudService<UnitMerge, CreateUnitMergeRequest, UpdateUnitMergeRequest> {
  protected endpoint = API_CONFIG.ENDPOINTS.PEI.UNIT_MERGE

  constructor() {
    super({
      useFormData: true // This API expects FormData
    })
  }

  /**
   * Custom update method to handle the specific API format
   * This API expects FormData with 'id' included in the body using POST method
   */
  async update(id: string | number, data: UpdateUnitMergeRequest): Promise<UnitMerge> {
    // For this specific API, include the ID in the data
    const updateData = {
      ...data,
      id: Number(id)
    }

    // Use FormData for this API - this API uses POST for updates with ID in body
    if (this.options.useFormData) {
      return apiClient.postFormData<UnitMerge>(this.endpoint, updateData)
    }

    return apiClient.post<UnitMerge>(this.endpoint, updateData)
  }

  /**
   * Get unit merges by status (example of custom method)
   */
  async getByStatus(status: 'active' | 'inactive'): Promise<UnitMerge[]> {
    return this.getAll({ status })
  }

  /**
   * Search unit merges by name
   */
  async searchByName(query: string): Promise<UnitMerge[]> {
    return this.getAll({ search: query })
  }

  /**
   * Get unit merge statistics (example of custom endpoint)
   */
  async getStatistics(): Promise<{ total: number; active: number; inactive: number }> {
    // This would be a custom endpoint like /pei/unit-merge/stats
    // For now, return mock data
    const allItems = await this.getAll()
    return {
      total: allItems.length,
      active: allItems.length, // Assuming all are active for now
      inactive: 0
    }
  }
}

// Export singleton instance
export const unitMergeService = new UnitMergeService()
export default unitMergeService
