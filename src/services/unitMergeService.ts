// services/unitMergeService.ts
import { API_CONFIG, getEndpointUrl } from '@/utils/api'
import type { UnitMerge, CreateUnitMergeRequest, UpdateUnitMergeRequest, ApiResponse } from '@/types/unitMerge'

class UnitMergeService {
  private baseUrl = API_CONFIG.ENDPOINTS.PEI.UNIT_MERGE

  /**
   * Get all unit merges
   */
  async getAll(token: string): Promise<UnitMerge[]> {
    try {
      const response = await fetch(getEndpointUrl(this.baseUrl), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Handle different response formats
      if (Array.isArray(data)) {
        return data
      } else if (data.data && Array.isArray(data.data)) {
        return data.data
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Error fetching unit merges:', error)
      throw error
    }
  }

  /**
   * Create a new unit merge
   */
  async create(data: CreateUnitMergeRequest, token: string): Promise<UnitMerge> {
    try {
      const formData = new FormData()
      formData.append('name', data.name)

      const response = await fetch(getEndpointUrl(this.baseUrl), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // Handle different response formats
      if (result.data) {
        return result.data
      } else if (result.id) {
        return result
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Error creating unit merge:', error)
      throw error
    }
  }

  /**
   * Update an existing unit merge
   */
  async update(data: UpdateUnitMergeRequest, token: string): Promise<UnitMerge> {
    try {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('id', data.id.toString())

      const response = await fetch(getEndpointUrl(this.baseUrl), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // Handle different response formats
      if (result.data) {
        return result.data
      } else if (result.id) {
        return result
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Error updating unit merge:', error)
      throw error
    }
  }

  /**
   * Delete a unit merge
   */
  async delete(id: number, token: string): Promise<void> {
    try {
      const response = await fetch(getEndpointUrl(`${this.baseUrl}/${id}`), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Some APIs return empty response for DELETE
      if (response.headers.get('content-length') !== '0') {
        await response.json()
      }
    } catch (error) {
      console.error('Error deleting unit merge:', error)
      throw error
    }
  }
}

export default new UnitMergeService()
