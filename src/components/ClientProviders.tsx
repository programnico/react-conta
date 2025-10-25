// components/ClientProviders.tsx
'use client'

// React Imports
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { Box, CircularProgress, Typography } from '@mui/material'

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

// Loading component para PersistGate
const PersistLoading = () => (
  <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' minHeight='100vh' gap={3}>
    <CircularProgress size={60} />
    <Typography variant='h6' color='text.secondary'>
      Cargando aplicación...
    </Typography>
  </Box>
)

const ClientProviders = (props: Props) => {
  // Props
  const { children, direction, mode, settingsCookie } = props

  return (
    <Provider store={store}>
      <PersistGate loading={<PersistLoading />} persistor={persistor}>
        <SecurityProvider>
          <PermissionsProvider>
            <VerticalNavProvider>
              <SettingsProvider settingsCookie={settingsCookie} mode={mode}>
                <ThemeProvider direction={direction}>{children}</ThemeProvider>
              </SettingsProvider>
            </VerticalNavProvider>
          </PermissionsProvider>
        </SecurityProvider>
      </PersistGate>
    </Provider>
  )
}

export default ClientProviders
