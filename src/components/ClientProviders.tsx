// components/ClientProviders.tsx
'use client'

// React Imports
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

// Type Imports
import type { ChildrenType, Direction } from '@core/types'
import type { Mode } from '@core/types'
import type { Settings } from '@core/contexts/settingsContext'

// Context Imports
import { VerticalNavProvider } from '@menu/contexts/verticalNavContext'
import { SettingsProvider } from '@core/contexts/settingsContext'
import { PermissionsProvider } from '@/providers/PermissionsProvider'
import ThemeProvider from '@components/theme'

// Store Imports
import { store, persistor } from '@/store'

type Props = ChildrenType & {
  direction: Direction
  mode: Mode
  settingsCookie: Settings
}

const ClientProviders = (props: Props) => {
  // Props
  const { children, direction, mode, settingsCookie } = props

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <PermissionsProvider>
          <VerticalNavProvider>
            <SettingsProvider settingsCookie={settingsCookie} mode={mode}>
              <ThemeProvider direction={direction}>{children}</ThemeProvider>
            </SettingsProvider>
          </VerticalNavProvider>
        </PermissionsProvider>
      </PersistGate>
    </Provider>
  )
}

export default ClientProviders
