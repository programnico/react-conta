// components/ClientOnly.tsx
'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

interface ClientOnlyProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Componente que solo renderiza en el cliente para evitar errores de hidratación
 * Útil para componentes que dependen de localStorage, window, etc.
 */
const ClientOnly = ({ children, fallback = null }: ClientOnlyProps) => {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

export default ClientOnly
