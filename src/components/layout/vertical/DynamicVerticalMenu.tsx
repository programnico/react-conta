// components/layout/vertical/DynamicVerticalMenu.tsx
'use client'

// React Imports
import { useMemo, useCallback } from 'react'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { usePermissions } from '@/providers/PermissionsProvider'

// Config Imports
import { MENU_CONFIG, filterMenuByPermissions } from '@/config/menu'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const DynamicVerticalMenu = ({ scrollMenu }: { scrollMenu: (container: any, isPerfectScrollbar: boolean) => void }) => {
  // Hooks
  const theme = useTheme()
  const { isBreakpointReached, transitionDuration, isCollapsed } = useVerticalNav()
  const { permissions } = usePermissions()

  // Get filtered menu based on user permissions
  const filteredMenu = useMemo(() => {
    return filterMenuByPermissions(MENU_CONFIG, permissions)
  }, [permissions])

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  // Render menu items recursively with useCallback to prevent infinite loops
  const renderMenuItems = useCallback(
    (menuItems: typeof filteredMenu) => {
      return menuItems.map(item => {
        if (item.children && item.children.length > 0 && !isCollapsed) {
          return (
            <SubMenu key={item.id} label={item.label} icon={item.icon ? <i className={item.icon} /> : undefined}>
              {renderMenuItems(item.children)}
            </SubMenu>
          )
        }

        return (
          <MenuItem
            key={item.id}
            href={item.path}
            icon={item.icon ? <i className={item.icon} /> : isCollapsed ? <i className='ri-circle-line' /> : undefined}
            title={isCollapsed ? item.label : undefined}
          >
            <span className='menu-item-text'>{item.label}</span>
          </MenuItem>
        )
      })
    },
    [isCollapsed]
  )

  const menuItems = useMemo(() => renderMenuItems(filteredMenu), [filteredMenu, renderMenuItems])

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      {/* Vertical Menu */}
      <Menu
        menuItemStyles={menuItemStyles(theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-line' /> }}
        menuSectionStyles={menuSectionStyles(theme)}
      >
        {/* Render dynamic menu items based on permissions */}
        {menuItems}
      </Menu>
    </ScrollWrapper>
  )
}

export default DynamicVerticalMenu
