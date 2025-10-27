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

  // Rutas protegidas (requieren autenticación) - Todas bajo (modules) para layout compartido
  PROTECTED: {
    DASHBOARD: '/dashboard', // Ruta: (modules)/dashboard
    // General - Catálogos
    GENERAL_CATALOGS: '/general/catalogs', // Ruta: (modules)/general/catalogs
    //PERIOD_NAME: '/general/catalogs/period-name',
    // Purchase Module
    PURCHASES: '/purchase', // Ruta: (modules)/purchase
    // Suppliers Module
    SUPPLIERS: '/suppliers', // Ruta: (modules)/suppliers
    // Products Module
    PRODUCTS: '/products', // Ruta: (modules)/products
    // Chart of Accounts Module
    CHART_OF_ACCOUNTS: '/chart-of-accounts', // Ruta: (modules)/chart-of-accounts
    // Users Module
    USERS: '/users' // Ruta: (modules)/users
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
  // General - Catálogos
  [ROUTES.PROTECTED.GENERAL_CATALOGS]: {
    public: false,
    title: 'Catálogos',
    permissions: [PERMISSIONS.USERS.VIEW],
    showInMenu: true,
    icon: 'ri-folder-line'
  },

  // [ROUTES.PROTECTED.PERIOD_NAME]: {
  //   public: false,
  //   title: 'Period Name',
  //   permissions: [PERMISSIONS.USERS.VIEW],
  //   showInMenu: true,
  //   icon: 'ri-calendar-line'
  // },

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
  },

  [ROUTES.PROTECTED.PRODUCTS]: {
    public: false,
    title: 'Gestión de Productos',
    permissions: [PERMISSIONS.PRODUCTS.VIEW],
    showInMenu: true,
    icon: 'ri-box-3-line'
  },

  [ROUTES.PROTECTED.CHART_OF_ACCOUNTS]: {
    public: false,
    title: 'Plan de Cuentas',
    permissions: [PERMISSIONS.CHART_OF_ACCOUNTS.VIEW],
    showInMenu: true,
    icon: 'ri-account-box-line'
  },

  [ROUTES.PROTECTED.USERS]: {
    public: false,
    title: 'Gestión de Usuarios',
    permissions: [PERMISSIONS.USERS.VIEW],
    showInMenu: true,
    icon: 'ri-user-line'
  }
} as const

export type RouteKey = keyof typeof ROUTE_CONFIG
