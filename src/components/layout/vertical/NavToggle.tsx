'use client'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

const NavToggle = () => {
  // Hooks
  const { toggleVerticalNav, toggleCollapsedNav, isBreakpointReached } = useVerticalNav()

  const handleClick = () => {
    if (isBreakpointReached) {
      // En móviles, ocultar completamente el menú
      toggleVerticalNav()
    } else {
      // En desktop, solo colapsar (mostrar iconos)
      toggleCollapsedNav()
    }
  }

  return (
    <>
      <i className='ri-menu-line text-xl cursor-pointer' onClick={handleClick} />
      {/* Comment following code and uncomment above code in order to toggle menu on desktop screens as well */}
      {/* {isBreakpointReached && <i className='ri-menu-line text-xl cursor-pointer' onClick={handleClick} />} */}
    </>
  )
}

export default NavToggle
