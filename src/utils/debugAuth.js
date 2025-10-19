// Utility para debugging de autenticación
// Ejecutar en la consola del navegador para limpiar estado bloqueado

console.log('🔧 Debug Auth Utils cargado')

window.debugAuth = {
  // Limpiar todo el localStorage
  clearStorage: () => {
    localStorage.clear()
    sessionStorage.clear()
    console.log('✅ Storage limpiado')
    window.location.reload()
  },

  // Limpiar solo datos de auth
  clearAuthData: () => {
    localStorage.removeItem('persist:root')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    console.log('✅ Datos de auth limpiados')
    window.location.reload()
  },

  // Mostrar estado actual
  showState: () => {
    const persistedState = localStorage.getItem('persist:root')
    if (persistedState) {
      try {
        const parsed = JSON.parse(persistedState)
        if (parsed.auth) {
          const authState = JSON.parse(parsed.auth)
          console.log('📊 Estado actual de auth:', authState)
          return authState
        }
      } catch (e) {
        console.log('❌ Error parseando estado:', e)
      }
    }
    console.log('ℹ️ No hay estado persistido')
    return null
  },

  // Forzar estado de no autenticado
  forceLogout: () => {
    const persistedState = localStorage.getItem('persist:root')
    if (persistedState) {
      try {
        const parsed = JSON.parse(persistedState)
        if (parsed.auth) {
          const authState = JSON.parse(parsed.auth)
          const newAuthState = {
            ...authState,
            isAuthenticated: false,
            isLoading: false,
            accessToken: null,
            refreshToken: null,
            user: null,
            error: null,
            loginStep: 'credentials'
          }
          parsed.auth = JSON.stringify(newAuthState)
          localStorage.setItem('persist:root', JSON.stringify(parsed))
          console.log('✅ Forzado logout en localStorage')
          window.location.reload()
        }
      } catch (e) {
        console.log('❌ Error forzando logout:', e)
      }
    }
  }
}

console.log(`
🚀 Funciones disponibles:
- debugAuth.clearStorage()     // Limpiar todo
- debugAuth.clearAuthData()    // Limpiar solo auth  
- debugAuth.showState()        // Mostrar estado actual
- debugAuth.forceLogout()      // Forzar logout
`)
