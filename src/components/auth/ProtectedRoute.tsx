// components/auth/ProtectedRoute.tsx
'use client'

import { usePathname } from 'next/navigation'
import AuthGuard from './AuthGuard'
import { PERMISSIONS } from '@/config/permissions'
import type { Permission } from '@/config/permissions'

interface ProtectedRouteProps {
  children: React.ReactNode
}

// Mapeo de rutas a permisos requeridos
const routePermissions: Record<string, Permission> = {
  '/dashboard': PERMISSIONS.DASHBOARD.VIEW,
  '/users': PERMISSIONS.USERS.VIEW,
  '/suppliers': PERMISSIONS.SUPPLIERS.VIEW,
  '/products': PERMISSIONS.PRODUCTS.VIEW,
  '/purchase': PERMISSIONS.PURCHASES.VIEW,
  '/settings': PERMISSIONS.SETTINGS.VIEW
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const pathname = usePathname()

  // Buscar el permiso requerido para la ruta actual
  const requiredPermission = Object.keys(routePermissions).find(route => pathname.startsWith(route))
    ? routePermissions[Object.keys(routePermissions).find(route => pathname.startsWith(route)) || '']
    : undefined

  return <AuthGuard requiredPermission={requiredPermission}>{children}</AuthGuard>
}

export default ProtectedRoute
