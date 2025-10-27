// config/menu.ts
import { ROUTES, ROUTE_CONFIG } from './routes'
import { PERMISSIONS, Permission } from './permissions'

export interface MenuItem {
  id: string
  label: string
  path: string
  icon?: string
  permissions: Permission[]
  children?: MenuItem[]
  showInMenu: boolean
  order?: number
}

export const MENU_CONFIG: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: ROUTES.PROTECTED.DASHBOARD,
    icon: 'ri-dashboard-line',
    permissions: [PERMISSIONS.DASHBOARD.VIEW],
    showInMenu: true,
    order: 1
  },
  // {
  //   id: 'users',
  //   label: 'Gestión de Usuarios',
  //   path: ROUTES.PROTECTED.USERS,
  //   icon: 'ri-user-line',
  //   permissions: [PERMISSIONS.USERS.VIEW],
  //   showInMenu: true,
  //   order: 2,
  //   children: [
  //     {
  //       id: 'users-list',
  //       label: 'Lista de Usuarios',
  //       path: ROUTES.PROTECTED.USERS,
  //       permissions: [PERMISSIONS.USERS.VIEW],
  //       showInMenu: true
  //     },
  //     {
  //       id: 'users-profile',
  //       label: 'Mi Perfil',
  //       path: ROUTES.PROTECTED.USER_PROFILE,
  //       permissions: [PERMISSIONS.USERS.VIEW_PROFILE],
  //       showInMenu: true
  //     }
  //   ]
  // },
  // {
  //   id: 'forms',
  //   label: 'Formularios',
  //   path: ROUTES.PROTECTED.FORM_LAYOUTS,
  //   icon: 'ri-file-text-line',
  //   permissions: [PERMISSIONS.FORMS.VIEW],
  //   showInMenu: true,
  //   order: 3,
  //   children: [
  //     {
  //       id: 'form-basic',
  //       label: 'Formularios Básicos',
  //       path: ROUTES.PROTECTED.FORM_BASIC,
  //       permissions: [PERMISSIONS.FORMS.VIEW],
  //       showInMenu: true
  //     },
  //     {
  //       id: 'form-icons',
  //       label: 'Formularios con Iconos',
  //       path: ROUTES.PROTECTED.FORM_ICONS,
  //       permissions: [PERMISSIONS.FORMS.VIEW],
  //       showInMenu: true
  //     }
  //   ]
  // },
  {
    id: 'purchase',
    label: 'Gestión de Compras',
    path: ROUTES.PROTECTED.PURCHASES,
    icon: 'ri-shopping-cart-line',
    permissions: [PERMISSIONS.PURCHASES.VIEW],
    showInMenu: true,
    order: 3.5
  },
  {
    id: 'suppliers',
    label: 'Gestión de Proveedores',
    path: ROUTES.PROTECTED.SUPPLIERS,
    icon: 'ri-building-line',
    permissions: [PERMISSIONS.SUPPLIERS.VIEW],
    showInMenu: true,
    order: 3.6
  },
  {
    id: 'products',
    label: 'Gestión de Productos',
    path: ROUTES.PROTECTED.PRODUCTS,
    icon: 'ri-box-3-line',
    permissions: [PERMISSIONS.PRODUCTS.VIEW],
    showInMenu: true,
    order: 3.7
  },
  {
    id: 'chart-of-accounts',
    label: 'Plan de Cuentas',
    path: ROUTES.PROTECTED.CHART_OF_ACCOUNTS,
    icon: 'ri-account-box-line',
    permissions: [PERMISSIONS.CHART_OF_ACCOUNTS.VIEW],
    showInMenu: true,
    order: 3.8
  },
  {
    id: 'users',
    label: 'Gestión de Usuarios',
    path: ROUTES.PROTECTED.USERS,
    icon: 'ri-user-line',
    permissions: [PERMISSIONS.USERS.VIEW],
    showInMenu: true,
    order: 3.9
  }
  // {
  //   id: 'general',
  //   label: 'General',
  //   path: ROUTES.PROTECTED.GENERAL_CATALOGS,
  //   icon: 'ri-settings-line',
  //   permissions: [PERMISSIONS.CATALOGS.VIEW],
  //   showInMenu: true,
  //   order: 4,
  //   children: [
  //     {
  //       id: 'period-name',
  //       label: 'Period Name',
  //       path: ROUTES.PROTECTED.PERIOD_NAME,
  //       icon: 'ri-calendar-line',
  //       permissions: [PERMISSIONS.CATALOGS.PERIOD_NAME],
  //       showInMenu: true
  //     }
  //   ]
  // },
  // {
  //   id: 'cards',
  //   label: 'Componentes',
  //   path: ROUTES.PROTECTED.CARD_BASIC,
  //   icon: 'ri-layout-card-line',
  //   permissions: [PERMISSIONS.DASHBOARD.VIEW],
  //   showInMenu: true,
  //   order: 5
  // }
  // {
  //   id: 'settings',
  //   label: 'Configuración',
  //   path: ROUTES.PROTECTED.ACCOUNT_SETTINGS,
  //   icon: 'ri-settings-line',
  //   permissions: [PERMISSIONS.SETTINGS.VIEW],
  //   showInMenu: true,
  //   order: 6,
  //   children: [
  //     {
  //       id: 'account-details',
  //       label: 'Detalles de Cuenta',
  //       path: ROUTES.PROTECTED.ACCOUNT_DETAILS,
  //       permissions: [PERMISSIONS.SETTINGS.ACCOUNT],
  //       showInMenu: true
  //     },
  //     {
  //       id: 'notifications',
  //       label: 'Notificaciones',
  //       path: ROUTES.PROTECTED.NOTIFICATIONS,
  //       permissions: [PERMISSIONS.SETTINGS.NOTIFICATIONS],
  //       showInMenu: true
  //     }
  //   ]
  // }
]

// Función para filtrar menús basado en permisos del usuario
export const filterMenuByPermissions = (menuItems: MenuItem[], userPermissions: Permission[]): MenuItem[] => {
  return menuItems
    .filter(item => {
      // Verificar si el usuario tiene al menos uno de los permisos requeridos
      const hasPermission = item.permissions.some(permission => userPermissions.includes(permission))
      return hasPermission && item.showInMenu
    })
    .map(item => ({
      ...item,
      children: item.children ? filterMenuByPermissions(item.children, userPermissions) : undefined
    }))
    .filter(item => !item.children || item.children.length > 0) // Remover items sin hijos válidos
    .sort((a, b) => (a.order || 999) - (b.order || 999)) // Ordenar por orden
}
