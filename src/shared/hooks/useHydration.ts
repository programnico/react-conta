// hooks/useHydration.ts
import { useEffect, useState } from 'react'

/**
 * Hook para detectar cuando estamos en el cliente (después de hidratación)
 * Evita diferencias SSR/Cliente
 */
export const useHydration = () => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Solo se ejecuta en el cliente
    setIsClient(true)
  }, [])

  return isClient
}

export default useHydration
