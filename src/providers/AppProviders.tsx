// providers/AppProviders.tsx
'use client'

import React from 'react'
import { store, persistor } from '@/store'
import { Provider as ReduxProvider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import { PermissionsProvider } from './PermissionsProvider'

// Tema limpio y profesional
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2'
    },
    secondary: {
      main: '#dc004e'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
  },
  shape: {
    borderRadius: 8
  }
})

interface AppProvidersProps {
  children: React.ReactNode
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ReduxProvider store={store}>
        {persistor ? (
          <PersistGate loading={null} persistor={persistor}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <PermissionsProvider>{children}</PermissionsProvider>
            </ThemeProvider>
          </PersistGate>
        ) : (
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <PermissionsProvider>{children}</PermissionsProvider>
          </ThemeProvider>
        )}
      </ReduxProvider>
    </AppRouterCacheProvider>
  )
}
