// shared/config/navigation.ts
export interface NavigationItem {
  path: string
  label: string
  icon?: string
  children?: NavigationItem[]
}

export interface ModuleConfig {
  key: string
  label: string
  icon: string
  items: NavigationItem[]
}

export const navigationConfig: Record<string, ModuleConfig> = {
  general: {
    key: 'general',
    label: 'General',
    icon: 'ri-settings-line',
    items: [
      {
        path: '/general/catalogs/unit-merge',
        label: 'Unit Merge',
        icon: 'ri-merge-cells-horizontal'
      },
      {
        path: '/general/catalogs/categories',
        label: 'Categories',
        icon: 'ri-bookmark-line'
      }
    ]
  },

  purchase: {
    key: 'purchase',
    label: 'Purchase',
    icon: 'ri-shopping-cart-line',
    items: [
      {
        path: '/purchase/orders',
        label: 'Purchase Orders',
        icon: 'ri-file-list-line'
      },
      {
        path: '/purchase/suppliers',
        label: 'Suppliers',
        icon: 'ri-truck-line'
      },
      {
        path: '/purchase/reports',
        label: 'Reports',
        icon: 'ri-bar-chart-line'
      }
    ]
  },

  accounting: {
    key: 'accounting',
    label: 'Accounting',
    icon: 'ri-calculator-line',
    items: [
      {
        path: '/accounting/transactions',
        label: 'Transactions',
        icon: 'ri-exchange-line'
      },
      {
        path: '/accounting/balances',
        label: 'Balances',
        icon: 'ri-scales-line'
      },
      {
        path: '/accounting/reports',
        label: 'Financial Reports',
        icon: 'ri-pie-chart-line'
      }
    ]
  },

  administration: {
    key: 'administration',
    label: 'Administration',
    icon: 'ri-admin-line',
    items: [
      {
        path: '/administration/users',
        label: 'User Management',
        icon: 'ri-user-settings-line'
      },
      {
        path: '/administration/roles',
        label: 'Roles & Permissions',
        icon: 'ri-shield-user-line'
      },
      {
        path: '/administration/settings',
        label: 'System Settings',
        icon: 'ri-settings-3-line'
      }
    ]
  }
}

// Helper functions
export const getAllNavigationItems = (): NavigationItem[] => {
  return Object.values(navigationConfig).flatMap(module => module.items)
}

export const getModuleByPath = (path: string): ModuleConfig | undefined => {
  return Object.values(navigationConfig).find(module => module.items.some(item => path.startsWith(item.path)))
}

export const getBreadcrumbs = (currentPath: string): Array<{ label: string; path?: string }> => {
  const module = getModuleByPath(currentPath)
  if (!module) return []

  const item = module.items.find(item => currentPath.startsWith(item.path))
  if (!item) return []

  return [{ label: 'Dashboard', path: '/dashboard' }, { label: module.label }, { label: item.label, path: item.path }]
}
