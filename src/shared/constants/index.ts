// shared/constants/index.ts
export const APP_CONSTANTS = {
  // Error Messages
  ERRORS: {
    NETWORK_ERROR: 'Error de conexión. Verifique su internet.',
    UNAUTHORIZED: 'Sesión expirada. Por favor, inicie sesión nuevamente.',
    FORBIDDEN: 'No tiene permisos para realizar esta acción.',
    SERVER_ERROR: 'Error interno del servidor. Intente más tarde.',
    VALIDATION_ERROR: 'Datos inválidos. Verifique la información.',
    UNKNOWN_ERROR: 'Ha ocurrido un error inesperado.'
  },

  // Success Messages
  SUCCESS: {
    LOGIN: 'Inicio de sesión exitoso',
    LOGOUT: 'Sesión cerrada correctamente',
    SAVE: 'Datos guardados correctamente',
    UPDATE: 'Registro actualizado correctamente',
    DELETE: 'Registro eliminado correctamente',
    VERIFICATION: 'Verificación completada exitosamente'
  },

  // API Configuration
  API: {
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
  },

  // Storage Keys
  STORAGE: {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    USER_DATA: 'userData',
    SETTINGS: 'userSettings'
  },

  // Validation Rules
  VALIDATION: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD_MIN_LENGTH: 8,
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp']
  },

  // UI Configuration
  UI: {
    DEBOUNCE_DELAY: 300,
    PAGINATION_SIZE: 10,
    MAX_ITEMS_PER_PAGE: 100,
    TOAST_DURATION: 5000
  },

  // Security Configuration
  SECURITY: {
    TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 min before expiry
    INACTIVITY_TIMEOUT: 30 * 60 * 1000, // 30 min inactivity
    VALIDATION_INTERVAL: 5 * 60 * 1000, // 5 min validation interval
    VISIBILITY_CHECK_THRESHOLD: 60 * 60 * 1000, // 1 hour for visibility check
    MAX_REFRESH_ATTEMPTS: 3, // Max token refresh attempts
    SESSION_WARNING_TIME: 5 * 60 * 1000 // 5 min warning before logout
  }
} as const

// Export individual sections for easier imports
export const { ERRORS, SUCCESS, API, STORAGE, VALIDATION, UI, SECURITY } = APP_CONSTANTS

export default APP_CONSTANTS
