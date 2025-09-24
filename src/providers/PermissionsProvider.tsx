// providers/PermissionsProvider.tsx
'use client'

import React, { createContext, useContext, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/shared/hooks/redux'
import { Permission, ROLES } from '@/config/permissions'

interface PermissionsContextType {
  permissions: Permission[]
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  hasAllPermissions: (permissions: Permission[]) => boolean
  userRole: string | null
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined)

interface PermissionsProviderProps {
  children: React.ReactNode
}

export const PermissionsProvider: React.FC<PermissionsProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAppSelector(state => state.auth)

  // Determinar permisos basado en el rol del usuario
  const permissions = useMemo((): Permission[] => {
    if (!isAuthenticated || !user) {
      return [...ROLES.GUEST.permissions]
    }

    // Aquí puedes implementar lógica más compleja basada en el usuario
    // Por ejemplo, si el usuario tiene un campo 'role' o 'permissions'
    const userRole = user.role || 'USER'

    switch (userRole) {
      case 'ADMIN':
        return [...ROLES.ADMIN.permissions]
      case 'USER':
        return [...ROLES.USER.permissions]
      default:
        return [...ROLES.GUEST.permissions]
    }
  }, [isAuthenticated, user])

  const userRole = useMemo(() => {
    if (!isAuthenticated || !user) return 'GUEST'
    return user.role || 'USER'
  }, [isAuthenticated, user])

  // Función para verificar si el usuario tiene un permiso específico
  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission)
  }

  // Función para verificar si el usuario tiene al menos uno de los permisos
  const hasAnyPermission = (requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.some(permission => permissions.includes(permission))
  }

  // Función para verificar si el usuario tiene todos los permisos
  const hasAllPermissions = (requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.every(permission => permissions.includes(permission))
  }

  const value: PermissionsContextType = {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    userRole
  }

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>
}

// Hook para usar el contexto de permisos
export const usePermissions = (): PermissionsContextType => {
  const context = useContext(PermissionsContext)
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider')
  }
  return context
}

// Componente HOC para proteger rutas por permisos
interface ProtectedRouteProps {
  children: React.ReactNode
  permissions: Permission[]
  fallback?: React.ReactNode
  requireAll?: boolean // Si es true, requiere TODOS los permisos, si es false, requiere AL MENOS UNO
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  permissions: requiredPermissions,
  fallback = <div>No tienes permisos para ver esta página</div>,
  requireAll = false
}) => {
  const { hasAnyPermission, hasAllPermissions } = usePermissions()

  const hasAccess = requireAll ? hasAllPermissions(requiredPermissions) : hasAnyPermission(requiredPermissions)

  if (!hasAccess) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
