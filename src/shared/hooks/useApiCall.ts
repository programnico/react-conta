// shared/hooks/useApiCall.ts
import { useState, useCallback } from 'react'
import { ApiError } from '@/shared/services/apiClient'
import { ERRORS } from '@/shared/constants'

export interface UseApiCallOptions {
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
  showLoading?: boolean
}

export interface ApiCallState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApiCall<T = any>(options: UseApiCallOptions = {}) {
  const { onSuccess, onError, showLoading = true } = options

  const [state, setState] = useState<ApiCallState<T>>({
    data: null,
    loading: false,
    error: null
  })

  const execute = useCallback(
    async (apiCall: () => Promise<T>): Promise<T | null> => {
      try {
        if (showLoading) {
          setState(prev => ({ ...prev, loading: true, error: null }))
        }

        const result = await apiCall()

        setState(prev => ({
          ...prev,
          data: result,
          loading: false,
          error: null
        }))

        onSuccess?.(result)
        return result
      } catch (error) {
        let errorMessage: string = ERRORS.UNKNOWN_ERROR

        if (error instanceof ApiError) {
          switch (error.status) {
            case 401:
              errorMessage = ERRORS.UNAUTHORIZED
              break
            case 403:
              errorMessage = ERRORS.FORBIDDEN
              break
            case 400:
              errorMessage = ERRORS.VALIDATION_ERROR
              break
            case 500:
              errorMessage = ERRORS.SERVER_ERROR
              break
            default:
              errorMessage = error.message || ERRORS.UNKNOWN_ERROR
          }
        } else if (error instanceof Error) {
          errorMessage = error.message
        }

        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage
        }))

        onError?.(errorMessage)
        return null
      }
    },
    [onSuccess, onError, showLoading]
  )

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null
    })
  }, [])

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }))
  }, [])

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }))
  }, [])

  return {
    ...state,
    execute,
    reset,
    setData,
    setLoading,
    setError
  }
}

export default useApiCall
