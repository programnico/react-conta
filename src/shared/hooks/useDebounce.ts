// shared/hooks/useDebounce.ts
import { useEffect, useState } from 'react'
import { UI } from '@/shared/constants'

/**
 * Hook para debounce de valores
 * Útil para búsquedas en tiempo real y optimización de API calls
 */
export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay || UI.DEBOUNCE_DELAY)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook para debounce de callbacks
 * Útil para funciones que no queremos ejecutar múltiples veces seguidas
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(callback: T, delay?: number): T {
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout>()

  const debouncedCallback = ((...args: any[]) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    const timer = setTimeout(() => {
      callback(...args)
    }, delay || UI.DEBOUNCE_DELAY)

    setDebounceTimer(timer)
  }) as T

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [debounceTimer])

  return debouncedCallback
}

export default useDebounce
