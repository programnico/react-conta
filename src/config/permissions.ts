// config/permissions.ts
export const PERMISSIONS = {
  // Permisos de autenticación
  AUTH: {
    LOGIN: 'auth:login',
    LOGOUT: 'auth:logout',
    CHANGE_PASSWORD: 'auth:change-password',
    RESET_PASSWORD: 'auth:reset-password',
    TWO_FACTOR: 'auth:two-factor'
  },

  // Permisos de dashboard
  DASHBOARD: {
    VIEW: 'dashboard:view',
    EXPORT: 'dashboard:export',
    ANALYTICS: 'dashboard:analytics'
  },

  // Permisos de usuarios
  USERS: {
    VIEW: 'users:view',
    CREATE: 'users:create',
    EDIT: 'users:edit',
    DELETE: 'users:delete',
    VIEW_PROFILE: 'users:view-profile'
  },

  // Permisos de configuración
  SETTINGS: {
    VIEW: 'settings:view',
    EDIT: 'settings:edit',
    ACCOUNT: 'settings:account',
    NOTIFICATIONS: 'settings:notifications'
  },

  // Permisos de formularios
  FORMS: {
    VIEW: 'forms:view',
    CREATE: 'forms:create',
    EDIT: 'forms:edit'
  },

  // Permisos de catálogos generales
  // CATALOGS: {
  //   VIEW: 'catalogs:view',
  //   CREATE: 'catalogs:create',
  //   EDIT: 'catalogs:edit',
  //   DELETE: 'catalogs:delete',
  //   PERIOD_NAME: 'catalogs:period-name'
  // },

  // Permisos de compras
  PURCHASES: {
    VIEW: 'purchases:view',
    CREATE: 'purchases:create',
    EDIT: 'purchases:edit',
    DELETE: 'purchases:delete',
    APPROVE: 'purchases:approve',
    RECEIVE: 'purchases:receive'
  },

  SUPPLIERS: {
    VIEW: 'suppliers:view',
    CREATE: 'suppliers:create',
    EDIT: 'suppliers:edit',
    DELETE: 'suppliers:delete',
    MANAGE: 'suppliers:manage'
  },

  PRODUCTS: {
    VIEW: 'products:view',
    CREATE: 'products:create',
    EDIT: 'products:edit',
    DELETE: 'products:delete',
    MANAGE: 'products:manage'
  }
} as const

// Extraer todos los valores de permisos de forma recursiva
type PermissionValues<T> =
  T extends Record<string, infer U>
    ? U extends string
      ? U
      : U extends Record<string, infer V>
        ? V extends string
          ? V
          : never
        : never
    : never

export type Permission = PermissionValues<typeof PERMISSIONS>

// Roles predefinidos con sus permisos
export const ROLES = {
  ADMIN: {
    name: 'Administrador',
    permissions: [
      ...Object.values(PERMISSIONS.AUTH),
      ...Object.values(PERMISSIONS.DASHBOARD),
      ...Object.values(PERMISSIONS.USERS),
      ...Object.values(PERMISSIONS.SETTINGS),
      ...Object.values(PERMISSIONS.FORMS),
      //...Object.values(PERMISSIONS.CATALOGS),
      ...Object.values(PERMISSIONS.PURCHASES),
      ...Object.values(PERMISSIONS.SUPPLIERS),
      ...Object.values(PERMISSIONS.PRODUCTS)
    ]
  },
  USER: {
    name: 'Usuario',
    permissions: [
      PERMISSIONS.AUTH.LOGIN,
      PERMISSIONS.AUTH.LOGOUT,
      PERMISSIONS.AUTH.CHANGE_PASSWORD,
      PERMISSIONS.DASHBOARD.VIEW,
      PERMISSIONS.USERS.VIEW_PROFILE,
      PERMISSIONS.SETTINGS.ACCOUNT,
      PERMISSIONS.PURCHASES.VIEW,
      PERMISSIONS.SUPPLIERS.VIEW,
      PERMISSIONS.PURCHASES.CREATE,
      PERMISSIONS.PRODUCTS.VIEW,
      PERMISSIONS.PRODUCTS.CREATE,
      PERMISSIONS.PRODUCTS.EDIT
    ]
  },
  GUEST: {
    name: 'Invitado',
    permissions: [PERMISSIONS.AUTH.LOGIN]
  }
} as const

export type Role = keyof typeof ROLES
