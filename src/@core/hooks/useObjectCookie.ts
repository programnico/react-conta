// React Imports
import { useMemo, useState, useEffect } from 'react'

// Third-party Imports
import { useCookie } from 'react-use'

export const useObjectCookie = <T>(key: string, fallback?: T | null): [T, (newVal: T) => void] => {
  // State to track if component has mounted to prevent hydration issues
  const [mounted, setMounted] = useState(false)

  // Hooks
  const [valStr, updateCookie] = useCookie(key)

  // Set mounted state to prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo<T>(() => {
    // During SSR or before mount, always use fallback to ensure consistent rendering
    if (!mounted) {
      return fallback || ({} as T)
    }

    // After mount, use actual cookie value
    return valStr ? JSON.parse(valStr) : fallback
  }, [valStr, fallback, mounted])

  const updateValue = (newVal: T) => {
    // Only update cookie after component is mounted
    if (mounted) {
      updateCookie(JSON.stringify(newVal))
    }
  }

  return [value, updateValue]
}
