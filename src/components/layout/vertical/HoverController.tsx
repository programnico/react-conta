'use client'

// React Imports
import { useEffect } from 'react'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

const HoverController = () => {
  const { isCollapsed, isBreakpointReached } = useVerticalNav()

  useEffect(() => {
    // Solo aplicar en desktop y cuando está colapsado
    if (isBreakpointReached || !isCollapsed) return

    const handleHeaderHover = (e: Event) => {
      // Prevenir que el header active el hover del sidebar
      e.stopPropagation()
    }

    // Usar setTimeout para esperar que el DOM se renderice
    const timer = setTimeout(() => {
      const header = document.querySelector('.ts-vertical-nav-header') as HTMLElement

      if (header) {
        // Prevenir que el header active hover del contenedor padre
        header.addEventListener('mouseenter', handleHeaderHover)
        header.addEventListener('mouseover', handleHeaderHover)

        // Agregar estilo inline para prevenir propagación
        header.style.pointerEvents = 'auto'
      }
    }, 100)

    // Cleanup
    return () => {
      clearTimeout(timer)
      const header = document.querySelector('.ts-vertical-nav-header') as HTMLElement

      if (header) {
        header.removeEventListener('mouseenter', handleHeaderHover)
        header.removeEventListener('mouseover', handleHeaderHover)
      }
    }
  }, [isCollapsed, isBreakpointReached])

  return null // Este componente no renderiza nada
}

export default HoverController
