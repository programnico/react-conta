// React Imports
import { useMemo, useState, useEffect } from 'react'

// Third-party imports
import { useColorScheme } from '@mui/material'

// Type imports
import type { Mode } from '@core/types'

export const useImageVariant = (mode: Mode, imgLight: string, imgDark: string): string => {
  // Hooks
  const { mode: muiMode } = useColorScheme()
  const [mounted, setMounted] = useState(false)

  // Set mounted state to prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  return useMemo(() => {
    const isServer = typeof window === 'undefined'

    const currentMode = (() => {
      if (isServer || !mounted) return mode

      return muiMode || mode
    })()

    const isDarkMode = currentMode === 'dark'

    return isDarkMode ? imgDark : imgLight
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, muiMode, mounted])
}
