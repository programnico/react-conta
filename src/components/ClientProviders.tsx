// components/ClientProviders.tsx
'use client'

// React Imports
import { useState, useEffect } from 'react'
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
import { SecurityProvider } from '@/providers/SecurityProvider'
import ThemeProvider from '@components/theme'

// Store Imports
import { store, persistor } from '@/store'

type Props = ChildrenType & {
  direction: Direction
  mode: Mode
  settingsCookie: Settings
}

// Loading component para PersistGate - elegante y profesional
const PersistLoading = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        zIndex: 9999
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e3e3e3',
          borderTop: '3px solid #1976d2',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }}
      />
      <div
        style={{
          fontSize: '16px',
          color: '#666',
          fontWeight: '500',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        Initializing Application...
      </div>
    </div>
  )
}

const ClientProviders = (props: Props) => {
  // Props
  const { children, direction, mode, settingsCookie } = props

  // Estado para controlar si estamos en el cliente
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Contenido de los providers
  const providerContent = (
    <SecurityProvider>
      <PermissionsProvider>
        <VerticalNavProvider>
          <SettingsProvider settingsCookie={settingsCookie} mode={mode}>
            <ThemeProvider direction={direction}>{children}</ThemeProvider>
          </SettingsProvider>
        </VerticalNavProvider>
      </PermissionsProvider>
    </SecurityProvider>
  )

  return (
    <Provider store={store}>
      {!isClient ? (
        // Durante SSR o hidratación inicial, mostrar loading
        <PersistLoading />
      ) : persistor ? (
        // Solo en el cliente, usar PersistGate
        <PersistGate loading={<PersistLoading />} persistor={persistor}>
          {providerContent}
        </PersistGate>
      ) : (
        providerContent
      )}
    </Provider>
  )
}

export default ClientProviders
