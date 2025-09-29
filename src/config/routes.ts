// config/routes.ts
import { PERMISSIONS } from './permissions'

export const ROUTES = {
  // Rutas públicas (no requieren autenticación)
  PUBLIC: {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    NOT_FOUND: '/404'
  },

  // Rutas protegidas (requieren autenticación)
  PROTECTED: {
    DASHBOARD: '/dashboard',
    USERS: '/dashboard/users',
    USER_PROFILE: '/dashboard/users/profile',
    ACCOUNT_SETTINGS: '/dashboard/account-settings',
    ACCOUNT_DETAILS: '/dashboard/account-settings/account',
    NOTIFICATIONS: '/dashboard/account-settings/notifications',
    FORM_LAYOUTS: '/dashboard/form-layouts',
    FORM_BASIC: '/dashboard/form-layouts/basic',
    FORM_ICONS: '/dashboard/form-layouts/icons',
    CARD_BASIC: '/dashboard/card-basic',
    // General - Catálogos
    GENERAL_CATALOGS: '/general/catalogs',
    PERIOD_NAME: '/general/catalogs/period-name',
    // Purchase Module
    PURCHASES: '/purchase',
    // Suppliers Module
    SUPPLIERS: '/suppliers'
  }
} as const

// Configuración de rutas con sus permisos requeridos
export const ROUTE_CONFIG = {
  // Rutas públicas
  [ROUTES.PUBLIC.HOME]: {
    public: true,
    title: 'Inicio'
  },
  [ROUTES.PUBLIC.LOGIN]: {
    public: true,
    title: 'Iniciar Sesión'
  },
  [ROUTES.PUBLIC.REGISTER]: {
    public: true,
    title: 'Registrarse'
  },
  [ROUTES.PUBLIC.FORGOT_PASSWORD]: {
    public: true,
    title: 'Recuperar Contraseña'
  },

  // Rutas protegidas
  [ROUTES.PROTECTED.DASHBOARD]: {
    public: false,
    title: 'Dashboard',
    permissions: [PERMISSIONS.DASHBOARD.VIEW],
    showInMenu: true,
    icon: 'ri-dashboard-line'
  },
  [ROUTES.PROTECTED.USERS]: {
    public: false,
    title: 'Usuarios',
    permissions: [PERMISSIONS.USERS.VIEW],
    showInMenu: true,
    icon: 'ri-user-line'
  },
  [ROUTES.PROTECTED.USER_PROFILE]: {
    public: false,
    title: 'Mi Perfil',
    permissions: [PERMISSIONS.USERS.VIEW_PROFILE],
    showInMenu: false
  },
  [ROUTES.PROTECTED.ACCOUNT_SETTINGS]: {
    public: false,
    title: 'Configuración de Cuenta',
    permissions: [PERMISSIONS.SETTINGS.ACCOUNT],
    showInMenu: true,
    icon: 'ri-settings-line'
  },
  [ROUTES.PROTECTED.FORM_LAYOUTS]: {
    public: false,
    title: 'Formularios',
    permissions: [PERMISSIONS.FORMS.VIEW],
    showInMenu: true,
    icon: 'ri-file-text-line'
  },
  [ROUTES.PROTECTED.CARD_BASIC]: {
    public: false,
    title: 'Tarjetas',
    permissions: [PERMISSIONS.DASHBOARD.VIEW],
    showInMenu: true,
    icon: 'ri-layout-card-line'
  },
  // General - Catálogos
  [ROUTES.PROTECTED.GENERAL_CATALOGS]: {
    public: false,
    title: 'Catálogos',
    permissions: [PERMISSIONS.USERS.VIEW],
    showInMenu: true,
    icon: 'ri-folder-line'
  },

  [ROUTES.PROTECTED.PERIOD_NAME]: {
    public: false,
    title: 'Period Name',
    permissions: [PERMISSIONS.USERS.VIEW],
    showInMenu: true,
    icon: 'ri-calendar-line'
  },

  [ROUTES.PROTECTED.PURCHASES]: {
    public: false,
    title: 'Gestión de Compras',
    permissions: [PERMISSIONS.PURCHASES.VIEW],
    showInMenu: true,
    icon: 'ri-shopping-cart-line'
  },

  [ROUTES.PROTECTED.SUPPLIERS]: {
    public: false,
    title: 'Gestión de Proveedores',
    permissions: [PERMISSIONS.SUPPLIERS.VIEW],
    showInMenu: true,
    icon: 'ri-building-line'
  }
} as const

export type RouteKey = keyof typeof ROUTE_CONFIG
