'use client'

// React Imports
import { createContext, useCallback, useMemo, useState } from 'react'

// Type Imports
import type { ChildrenType } from '../types'

export type VerticalNavState = {
  width?: number
  isToggled?: boolean
  isCollapsed?: boolean
  isBreakpointReached?: boolean
  transitionDuration?: number
}

export type VerticalNavContextProps = VerticalNavState & {
  updateVerticalNavState: (values: VerticalNavState) => void
  toggleVerticalNav: (value?: VerticalNavState['isToggled']) => void
  toggleCollapsedNav: (value?: VerticalNavState['isCollapsed']) => void
}

const VerticalNavContext = createContext({} as VerticalNavContextProps)

export const VerticalNavProvider = ({ children }: ChildrenType) => {
  // States
  const [verticalNavState, setVerticalNavState] = useState<VerticalNavState>()

  // Hooks
  const updateVerticalNavState = useCallback((values: Partial<VerticalNavState>) => {
    setVerticalNavState(prevState => ({
      ...prevState,
      ...values
    }))
  }, [])

  const toggleVerticalNav = useCallback((value?: boolean) => {
    setVerticalNavState(prevState => ({
      ...prevState,
      isToggled: value !== undefined ? Boolean(value) : !Boolean(prevState?.isToggled)
    }))
  }, [])

  const toggleCollapsedNav = useCallback((value?: boolean) => {
    setVerticalNavState(prevState => ({
      ...prevState,
      isCollapsed: value !== undefined ? Boolean(value) : !Boolean(prevState?.isCollapsed)
    }))
  }, [])

  const verticalNavProviderValue = useMemo(
    () => ({
      ...verticalNavState,
      updateVerticalNavState,
      toggleVerticalNav,
      toggleCollapsedNav
    }),
    [verticalNavState, updateVerticalNavState, toggleVerticalNav, toggleCollapsedNav]
  )

  return <VerticalNavContext.Provider value={verticalNavProviderValue}>{children}</VerticalNavContext.Provider>
}

export default VerticalNavContext
