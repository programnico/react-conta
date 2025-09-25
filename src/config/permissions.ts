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
  CATALOGS: {
    VIEW: 'catalogs:view',
    CREATE: 'catalogs:create',
    EDIT: 'catalogs:edit',
    DELETE: 'catalogs:delete',
    UNIT_MERGE: 'catalogs:unit-merge',
    PERIOD_NAME: 'catalogs:period-name'
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
      ...Object.values(PERMISSIONS.CATALOGS)
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
      PERMISSIONS.SETTINGS.ACCOUNT
    ]
  },
  GUEST: {
    name: 'Invitado',
    permissions: [PERMISSIONS.AUTH.LOGIN]
  }
} as const

export type Role = keyof typeof ROLES
